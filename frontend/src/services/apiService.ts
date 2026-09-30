/**
 * apiService.ts — FarmerAI Real Backend API Client
 * Connects directly to FastAPI backend on http://127.0.0.1:8000
 */

const API_BASE = 'http://127.0.0.1:8000';

export interface DiagnosisData {
  crop: string;
  disease: string;
  scientific_label: string;
  is_disease: boolean;
  confidence: number;
  confidence_level: 'HIGH' | 'MODERATE' | 'LOW';
  confidence_note: string;
  low_confidence: boolean;
  severity?: string;
}

export interface PredictionItem {
  rank: number;
  class_label: string;
  crop: string;
  condition: string;
  confidence: number;
  is_disease: boolean;
}

export interface DiagnoseResponse {
  status: string;
  diagnosis: DiagnosisData;
  severity: string;
  spread_risk: string;
  cause: string;
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  spread_prevention: string[];
  top5_predictions: PredictionItem[];
  meta: {
    filename: string;
    inference_time_ms: number;
    inference_mode: string;
    model: string;
    image_size: number;
  };
}

export interface WeatherData {
  status: string;
  location: string;
  latitude: number;
  longitude: number;
  summary: string;
  temperature_c: number;
  humidity_percent: number;
  precipitation_mm_now: number;
  precipitation_mm_next_24h: number;
  weather_description: string;
}

export interface DiseaseSearchResult {
  class_label: string;
  common_name: string;
  crop: string;
  is_disease: boolean;
  severity: string;
  score: number;
}

export interface ChatResponse {
  status: string;
  reply: string;
  model: string;
  grounded_on_diagnosis: boolean;
  grounding_source?: string;
  matched_class_label?: string;
  weather_summary?: string;
}

export interface AdviseResponse {
  status: string;
  diagnosis?: DiagnosisData;
  advice: string;
  model: string;
  grounding_source?: string;
  matched_class_label?: string;
  weather_summary?: string;
}

/** Check health and active capabilities */
export async function getHealth() {
  const res = await fetch(`${API_BASE}/`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

/** Fetch live weather for a Rwanda district */
export async function getWeather(district: string = 'Musanze'): Promise<WeatherData> {
  const res = await fetch(`${API_BASE}/api/v1/weather?district=${encodeURIComponent(district)}`);
  if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
  return res.json();
}

/** Search knowledge base for crop diseases */
export async function searchDiseases(query: string): Promise<DiseaseSearchResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE}/api/v1/diseases/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

/** Run vision NN on uploaded leaf image */
export async function diagnoseLeaf(file: File, cropHint?: string): Promise<DiagnoseResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (cropHint) formData.append('crop', cropHint);

  const res = await fetch(`${API_BASE}/api/v1/diagnose`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Diagnosis failed' }));
    throw new Error(errorData.detail || 'Failed to diagnose leaf image');
  }

  return res.json();
}

/** Send text chat to LLM advisor (Non-streaming) */
export async function sendChat(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: {
    district?: string;
    language?: string;
    diagnosisLabel?: string;
    diagnosisConfidence?: number;
    farmContext?: string;
  } = {}
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      district: options.district,
      language: options.language,
      diagnosis_label: options.diagnosisLabel,
      diagnosis_confidence: options.diagnosisConfidence,
      farm_context: options.farmContext,
      auto_ground: true,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Chat failed' }));
    throw new Error(errorData.detail || `Chat failed (${res.status})`);
  }

  return res.json();
}

/** Stream chat response from LLM advisor via Server-Sent Events (SSE) */
export async function streamChat(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: {
    district?: string;
    language?: string;
    diagnosisLabel?: string;
    diagnosisConfidence?: number;
    farmContext?: string;
  } = {},
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        district: options.district,
        language: options.language,
        diagnosis_label: options.diagnosisLabel,
        diagnosis_confidence: options.diagnosisConfidence,
        farm_context: options.farmContext,
        auto_ground: true,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ detail: `Streaming failed (${res.status})` }));
      throw new Error(errJson.detail || 'Streaming failed');
    }

    if (!res.body) throw new Error('No readable stream available');

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.content) onChunk(parsed.content);
            if (parsed.error) throw new Error(parsed.error);
          } catch (e: any) {
            if (e.message !== 'Unexpected end of JSON input') {
              console.warn('SSE parsing warning:', e);
            }
          }
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err);
  }
}

/** Unified multimodal advise (leaf image + prompt in one call) */
export async function sendAdvise(
  file: File | null,
  message: string,
  options: {
    district?: string;
    language?: string;
    farmContext?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  } = {}
): Promise<AdviseResponse> {
  const formData = new FormData();
  if (file) formData.append('file', file);
  formData.append('message', message);
  if (options.district) formData.append('district', options.district);
  if (options.language) formData.append('language', options.language);
  if (options.farmContext) formData.append('farm_context', options.farmContext);
  if (options.history && options.history.length > 0) {
    formData.append('history_json', JSON.stringify(options.history));
  }

  const res = await fetch(`${API_BASE}/api/v1/advise`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Advise request failed' }));
    throw new Error(errorData.detail || `Advise failed with status ${res.status}`);
  }

  return res.json();
}
