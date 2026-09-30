import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  Sparkles, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Leaf, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { streamChat, sendAdvise, DiagnosisData } from '../services/apiService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  leafImage?: string;
  diagnosis?: DiagnosisData;
  groundedSource?: string;
  weatherSummary?: string;
}

interface ChatViewProps {
  district: string;
  onDistrictChange: (district: string) => void;
  activeDiagnosis: DiagnosisData | null;
  onClearActiveDiagnosis: () => void;
  onSwitchToScanner: () => void;
}

const PROMPT_SUGGESTIONS = [
  {
    title: "Diagnose potato leaf spots",
    subtitle: "Identify early or late blight & treatment steps",
    prompt: "My potato leaves have dark brown concentric spots and yellowing edges. What disease is this and what should I spray?",
    icon: "🥔"
  },
  {
    title: "Musanze weather & spraying",
    subtitle: "Check precipitation & fungicide timing",
    prompt: "Given the current weather in Musanze, is it safe to spray protective fungicides today?",
    icon: "🌦️"
  },
  {
    title: "Tomato late blight rescue",
    subtitle: "Urgent outbreak control for nightshades",
    prompt: "Water-soaked lesions appeared on my tomato stems and leaves after recent rain. How can I stop the spread immediately?",
    icon: "🍅"
  },
  {
    title: "Maize rust organic remedy",
    subtitle: "Safe solutions for smallholder cereal farmers",
    prompt: "What are the most effective organic treatments for common rust on maize crops in Rwanda?",
    icon: "🌽"
  }
];

export const ChatView: React.FC<ChatViewProps> = ({
  district,
  onDistrictChange,
  activeDiagnosis,
  onClearActiveDiagnosis,
  onSwitchToScanner
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stagedImage, setStagedImage] = useState<{ file: File; previewUrl: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message / streaming tokens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Adjust textarea height dynamically
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStagedImage({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const removeStagedImage = () => {
    if (stagedImage) URL.revokeObjectURL(stagedImage.previewUrl);
    setStagedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || inputText.trim();
    if ((!textToSend && !stagedImage) || isGenerating) return;

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leafImage: stagedImage?.previewUrl
    };

    const currentStagedFile = stagedImage?.file || null;
    const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    removeStagedImage();
    setIsGenerating(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Multimodal image upload via /api/v1/advise
    if (currentStagedFile) {
      try {
        const response = await sendAdvise(currentStagedFile, textToSend, {
          district,
          history: historyPayload
        });

        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: response.advice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          diagnosis: response.diagnosis,
          groundedSource: response.grounding_source,
          weatherSummary: response.weather_summary
        };

        setMessages(prev => [...prev, assistantMsg]);
      } catch (err: any) {
        setMessages(prev => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: `⚠️ Failed to diagnose image: ${err.message}. Please ensure the backend is running.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Text-only stream via /api/v1/chat/stream
    let streamedContent = '';
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, initialAssistantMsg]);

    await streamChat(
      textToSend,
      historyPayload,
      {
        district,
        diagnosisLabel: activeDiagnosis?.scientific_label,
        diagnosisConfidence: activeDiagnosis ? activeDiagnosis.confidence / 100 : undefined
      },
      (chunk: string) => {
        streamedContent += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMsgId ? { ...msg, content: streamedContent } : msg
          )
        );
      },
      () => {
        setIsGenerating(false);
      },
      (err: Error) => {
        setIsGenerating(false);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMsgId
              ? { ...msg, content: streamedContent || `⚠️ Error: ${err.message}` }
              : msg
          )
        );
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to parse simple markdown formatting cleanly
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1 / 2 / 3
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx}>{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx}>{trimmed.replace('## ', '')}</h2>;
      }
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx}>{trimmed.replace('# ', '')}</h1>;
      }

      // Numbered items: "1. **Title**: description"
      if (/^\d+\.\s/.test(trimmed)) {
        const parts = trimmed.split('**');
        if (parts.length >= 3) {
          return (
            <p key={idx} style={{ paddingLeft: '14px', marginBottom: '8px' }}>
              <strong>{parts[0]}{parts[1]}</strong>{parts.slice(2).join('**')}
            </p>
          );
        }
        return <p key={idx} style={{ paddingLeft: '14px', marginBottom: '6px' }}>{trimmed}</p>;
      }

      // Bullet items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px' }}>
            {trimmed.replace(/^[-*]\s+/, '')}
          </li>
        );
      }

      // Bold titles like **What's happening**
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <h3 key={idx} style={{ marginTop: '14px', marginBottom: '6px' }}>{trimmed.replace(/\*\*/g, '')}</h3>;
      }

      if (!trimmed) {
        return <div key={idx} style={{ height: '8px' }} />;
      }

      return <p key={idx}>{line}</p>;
    });
  };

  return (
    <div className="chat-scroll-container">
      <div className="chat-center-wrapper">
        {/* Active Grounding Banner if an external diagnosis was selected */}
        {activeDiagnosis && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 163, 127, 0.12)',
            border: '1px solid rgba(16, 163, 127, 0.3)',
            borderRadius: '12px',
            padding: '10px 16px',
            margin: '16px 0 8px',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Leaf size={16} color="#10a37f" />
              <span>Grounded on: <strong>{activeDiagnosis.disease}</strong> ({activeDiagnosis.crop}) — {activeDiagnosis.confidence}% confidence</span>
            </div>
            <button 
              onClick={onClearActiveDiagnosis} 
              style={{ background: 'transparent', border: 'none', color: '#b4b4b4', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ChatGPT Style Empty State Hero */}
        {messages.length === 0 ? (
          <div className="chatgpt-hero">
            <div className="hero-avatar">
              <Sparkles size={26} color="#ffffff" />
            </div>
            <h1 className="hero-title">What would you like to grow or diagnose today?</h1>
            <p className="hero-subtitle">
              FarmerAI combines real-time EfficientNet leaf disease neural vision with Groq 120B agronomic intelligence for Rwanda smallholder farms.
            </p>

            <div className="prompt-chips-grid">
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <button 
                  key={idx} 
                  className="prompt-chip" 
                  onClick={() => handleSend(item.prompt)}
                >
                  <strong><span>{item.icon}</span> {item.title}</strong>
                  <span>{item.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', paddingTop: '16px' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`chat-turn ${msg.role}`}>
                {msg.role === 'user' ? (
                  <div className="user-bubble">
                    {msg.leafImage && (
                      <div style={{ marginBottom: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img 
                          src={msg.leafImage} 
                          alt="Uploaded leaf" 
                          style={{ maxHeight: '160px', width: 'auto', display: 'block', borderRadius: '8px' }} 
                        />
                      </div>
                    )}
                    {msg.content}
                  </div>
                ) : (
                  <div className="assistant-response">
                    <div className="assistant-avatar-small">
                      <Sparkles size={16} color="#ffffff" />
                    </div>
                    <div className="assistant-text-content">
                      {/* Context Badges */}
                      {(msg.diagnosis || msg.weatherSummary) && (
                        <div className="context-pill-banner">
                          {msg.diagnosis && (
                            <span className={`badge-tag ${(msg.diagnosis.severity || 'high').toLowerCase()}`}>
                              <Leaf size={12} /> {msg.diagnosis.disease} ({msg.diagnosis.confidence}%)
                            </span>
                          )}
                          {msg.weatherSummary && (
                            <span className="badge-tag weather">
                              <MapPin size={12} /> {district} Weather Injected
                            </span>
                          )}
                        </div>
                      )}

                      {/* Assistant text */}
                      {renderFormattedContent(msg.content)}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && messages[messages.length - 1]?.role === 'user' && (
              <div className="chat-turn assistant">
                <div className="assistant-response">
                  <div className="assistant-avatar-small">
                    <Sparkles size={16} color="#ffffff" />
                  </div>
                  <div className="assistant-text-content" style={{ color: '#8e8e8e', fontStyle: 'italic' }}>
                    Consulting FarmerAI advisor...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating ChatGPT Input Box */}
      <div className="bottom-input-anchor">
        <div className="input-container-pill">
          {/* Staged Leaf Preview */}
          {stagedImage && (
            <div className="staged-leaf-preview">
              <img src={stagedImage.previewUrl} alt="Staged" />
              <span>{stagedImage.file.name}</span>
              <button className="staged-remove-btn" onClick={removeStagedImage}>
                <X size={14} />
              </button>
            </div>
          )}

          <div className="input-row">
            {/* Paperclip Button for Leaf Scan */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/jpeg,image/png,image/webp" 
              onChange={handleImageSelect}
            />
            <button 
              className="icon-action-btn"
              title="Attach leaf photo for neural disease diagnosis"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={18} />
            </button>

            {/* Auto-expanding Textarea */}
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask anything about crops, pests, fertilizer, or attach a leaf photo..."
              rows={1}
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
            />

            {/* Send Button */}
            <div className="input-actions-bar">
              <button
                className="send-round-btn"
                disabled={(!inputText.trim() && !stagedImage) || isGenerating}
                onClick={() => handleSend()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="input-bottom-disclaimer">
          FarmerAI provides AI agronomic guidance. For severe crop blight, always consult a local sector agronomist.
        </div>
      </div>
    </div>
  );
};
