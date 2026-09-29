/** @format */

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Brain,
  Mic,
  ArrowUp,
  Image as ImageIcon,
  PenTool,
  Globe,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  CropType,
  DiseaseDetectionResult,
  Language,
  RwandaDistrict,
  WeatherData,
  DecisionFusionAdvice,
} from "../types";
import { AIPipelineService } from "../services/aiPipelineService";
import { DIAGNOSTIC_SAMPLES } from "../data/mockData";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  thinking?: string;
  thinkingTimeSec?: number;
  imageUrl?: string;
  diagnosisResult?: DiseaseDetectionResult;
  weatherAdvice?: DecisionFusionAdvice;
}

interface ChatGptInterfaceProps {
  district: RwandaDistrict;
  language: Language;
  weather: WeatherData;
  advice: DecisionFusionAdvice;
  activeModel: string;
  onOpenVoiceModal: () => void;
  onOpenWorkTab: (tab: string) => void;
  initialChatTitle?: string;
}

export function ChatGptInterface({
  district,
  language,
  weather,
  advice,
  activeModel,
  onOpenVoiceModal,
  onOpenWorkTab,
  initialChatTitle,
}: ChatGptInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showThinkingMap, setShowThinkingMap] = useState<Record<string, boolean>>({});
  const [showGradCamMap, setShowGradCamMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load sample conversation if initialChatTitle passed
  useEffect(() => {
    if (initialChatTitle) {
      loadPresetConversation(initialChatTitle);
    }
  }, [initialChatTitle]);

  const loadPresetConversation = (title: string) => {
    if (title.includes("Early Blight") || title.includes("Tomato")) {
      const sample = DIAGNOSTIC_SAMPLES[0];
      setMessages([
        {
          id: "m-user-1",
          sender: "user",
          text: "Can you analyze this tomato leaf photo for blight and advise if I should spray today in Muhanga?",
          timestamp: "Today at 21:40",
          imageUrl: sample.imageUrl,
        },
        {
          id: "m-ai-1",
          sender: "assistant",
          text: `### Diagnosis: ${sample.result.diagnosis}\n\n**Pathogen:** *${sample.result.scientificName}*\n**Rwanda Ag Name:** ${sample.result.kinyarwandaName}\n**Confidence Score:** ${(sample.result.confidence * 100).toFixed(1)}%\n\n#### Immediate Agronomic Protocol:\n1. **Foliar Sanitation:** Remove and burn the lower infected leaves immediately. Disinfect tools with 70% alcohol.\n2. **Muhanga Weather Advisory:** Rainfall is expected in Muhanga within the next 24 hours. **DO NOT SPRAY** foliar fungicides right now as rain will wash off chemical protection.\n3. **Post-Rain Protocol:** Once the canopy dries, apply Mancozeb 80% WP or Copper Hydroxide (Kocide 2000).`,
          timestamp: "Today at 21:40",
          thinking: `DeepSeek-V3 Reasoning Process:\n1. Input leaf analyzed against 38 plant pathology classes via EfficientNetV2-S ONNX model.\n2. Detected concentric bullseye rings characteristic of Alternaria solani (OOD score: 0.04).\n3. Cross-referenced Muhanga district weather telemetry (Relative Humidity 82%, Rain chance 70%).\n4. Triggered Washout Risk heuristic: Prevent chemical foliar application until rain passes.`,
          thinkingTimeSec: 2,
          imageUrl: sample.imageUrl,
          diagnosisResult: sample.result,
          weatherAdvice: advice,
        },
      ]);
    } else if (title.includes("Lime") || title.includes("Soil")) {
      setMessages([
        {
          id: "m-user-2",
          sender: "user",
          text: "What is the recommended soil lime application for Muhanga acidic soil (pH 4.8) for climbing beans?",
          timestamp: "Today at 20:15",
        },
        {
          id: "m-ai-2",
          sender: "assistant",
          text: `### Muhanga Soil Lime & NPK Protocol\n\n- **Current Soil pH:** 4.8 (Strongly Acidic)\n- **Target pH for Climbing Beans:** 6.2 - 6.8\n- **RAB Lime Rate:** **2.4 Metric Tons / Hectare** of Agricultural Limestone (CaCO₃).\n\n#### Application Guidelines:\n- Spread lime evenly 3 to 4 weeks before sowing Season 2026A.\n- Incorporate into the top 15-20cm of soil during primary tilling.\n- Combine with 50 kg/ha DAP at planting and farmyard manure (10 t/ha).`,
          timestamp: "Today at 20:15",
          thinking: `Evaluated Muhanga district soil database. pH 4.8 falls within high aluminum toxicity danger threshold for climbing beans. Applied RAB (Rwanda Agriculture Board) soil buffer curve calculation.`,
          thinkingTimeSec: 3,
        },
      ]);
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (textToSend?: string, attachedImg?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text && !attachedImg) return;

    const userMsgId = `usr-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: text || "Uploaded image for plant pathology diagnosis",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      imageUrl: attachedImg,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // Simulate DeepSeek-V3 MoE reasoning + Vision inference
      await new Promise((resolve) => setTimeout(resolve, 1400));

      let responseText = "";
      let diagResult: DiseaseDetectionResult | undefined;
      let thinkingText = "";

      if (attachedImg || text.toLowerCase().includes("leaf") || text.toLowerCase().includes("blight") || text.toLowerCase().includes("crop")) {
        const sample = DIAGNOSTIC_SAMPLES[0];
        diagResult = sample.result;

        responseText = `### Diagnosis: ${diagResult.diagnosis}\n\n` +
          `**Pathogen:** *${diagResult.scientificName}*\n` +
          `**Confidence:** ${(diagResult.confidence * 100).toFixed(1)}%\n\n` +
          `#### Key Symptoms Identified:\n` +
          diagResult.symptoms.map((s) => `- ${s}`).join("\n") + "\n\n" +
          `#### Recommended Agronomic Action:\n` +
          `- **Immediate:** ${diagResult.immediateAction}\n` +
          `- **Chemical Protocol:** ${diagResult.recommendedChemicalTreatment}\n` +
          `- **Organic Alternative:** ${diagResult.recommendedOrganicTreatment}\n\n` +
          `> **Weather Check (${district}):** ${weather.forecastSummary} Rain probability is ${weather.rainChance24h}%. Delay spraying if rain is imminent.`;

        thinkingText = `DeepSeek-V3 MoE Architecture Inference:\n1. Vision Back-end: EfficientNetV2-S processed high-resolution leaf texture.\n2. Detected concentric necrotized lesions with chlorotic halos.\n3. Out-of-Distribution (OOD) score: 0.03 (< 0.5 threshold = high in-distribution confidence).\n4. Integrated RAB agrochemical guidelines & weather radar.`;
      } else if (text.toLowerCase().includes("weather") || text.toLowerCase().includes("rain") || text.toLowerCase().includes("spray")) {
        responseText = `### Hyperlocal Weather & Spray Advisory for **${district}**\n\n` +
          `- **Temperature:** ${weather.tempCelsius}°C | **Humidity:** ${weather.humidityPercentage}%\n` +
          `- **Rain Risk (24h):** ${weather.rainChance24h}% (${weather.expectedRainfallMm} mm expected)\n` +
          `- **Spore Germination Risk:** ${weather.sporeGerminationIndex}% (Elevated fungal pressure)\n\n` +
          `#### Agronomic Decision:\n` +
          `**${advice.sprayAdvice.headline}**\n` +
          `${advice.sprayAdvice.explanation}\n\n` +
          `**Irrigation:** ${advice.irrigationAdvice.headline} - ${advice.irrigationAdvice.reason}`;

        thinkingText = `Synthesizing Rwanda Meteo telemetry for ${district}. Moisture accumulation over past 12h: ${weather.soilMoisturePercentage}%. Spore germination index computed at 78/100.`;
      } else {
        responseText = `Hello! I am **FarmerAI**, powered by **DeepSeek-V3 MoE** reasoning models and real-time agricultural telemetry from Rwanda.\n\n` +
          `How can I assist your farm in **${district}** today?\n\n` +
          `- **Diagnose Crop Diseases:** Click the **+** button or camera icon to upload a photo of your maize, potato, tomato, or bean leaves.\n` +
          `- **Weather Decision Fusion:** Inquire about spray windows, rain washout forecasts, and spore germination pressure.\n` +
          `- **Soil & Fertilizer Advice:** Get RAB-certified NPK and lime calculation for your specific soil pH.\n` +
          `- **Switch to + Work:** Click **+ Work** at the top to access the multi-tool Agricultural Studio (Outbreak Radar, Soil Calculator, Seasonal Planner).`;

        thinkingText = `DeepSeek-V3 router activated 8 of 256 expert modules. Parsed user context: District ${district}, Role: General Farmer.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        thinking: isThinkingEnabled ? thinkingText : undefined,
        thinkingTimeSec: 2,
        imageUrl: attachedImg,
        diagnosisResult: diagResult,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const imgData = uploadEvent.target?.result as string;
      handleSendMessage(
        "Analyze this crop leaf photo for disease symptoms, confidence, and treatment protocol.",
        imgData
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`>]/g, ""));
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Render Live Audio Waveform Icon (matching ChatGPT blue button)
  const renderWaveformIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="8" width="2.5" height="8" rx="1.25" fill="#ffffff" />
      <rect x="8.5" y="4" width="2.5" height="16" rx="1.25" fill="#ffffff" />
      <rect x="13.5" y="6" width="2.5" height="12" rx="1.25" fill="#ffffff" />
      <rect x="18.5" y="9" width="2.5" height="6" rx="1.25" fill="#ffffff" />
    </svg>
  );

  return (
    <div
      className="chatgpt-canvas"
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000000",
        color: "#ffffff",
        position: "relative",
        fontFamily: "var(--font-family-aeonik)",
        overflow: "hidden",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* When NO messages: Replicate EXACT ChatGPT Landing Screen */}
      {messages.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px 80px 16px",
            maxWidth: 780,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Headline from Screenshot: "Where should we begin?" */}
          <h1
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: "#ffffff",
              marginBottom: 28,
              textAlign: "center",
              letterSpacing: "-0.025em",
            }}
          >
            Where should we begin?
          </h1>

          {/* ChatGPT Rounded Pill Prompt Bar */}
          <div
            style={{
              width: "100%",
              maxWidth: 768,
              backgroundColor: "#212121",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 28,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
              transition: "border-color 0.15s ease",
            }}
            className="chatgpt-input-bar"
          >
            {/* Plus Button (attach image/file) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach photo of crop leaf or document"
              style={{
                background: "transparent",
                border: "none",
                color: "#b4b4b4",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s ease",
              }}
              className="chatgpt-icon-hover"
            >
              <Plus size={20} color="#b4b4b4" />
            </button>

            {/* Input field: "Ask anything" */}
            <input
              type="text"
              placeholder="Ask anything"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              autoFocus
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 400,
                fontFamily: "inherit",
              }}
            />

            {/* Right Controls: Think, Mic, Voice Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {/* Think Button (DeepSeek-V3 Reasoning Toggle) */}
              <button
                onClick={() => setIsThinkingEnabled(!isThinkingEnabled)}
                title="DeepSeek-V3 Deep Reasoning"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 20,
                  border: isThinkingEnabled
                    ? "1px solid rgba(255, 255, 255, 0.25)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: isThinkingEnabled
                    ? "rgba(255, 255, 255, 0.12)"
                    : "transparent",
                  color: isThinkingEnabled ? "#ffffff" : "#8e8e8e",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Brain size={15} />
                <span>Think</span>
              </button>

              {/* Microphone Button */}
              <button
                onClick={onOpenVoiceModal}
                title="Voice Assistant (Ikinyarwanda / English)"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#b4b4b4",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                className="chatgpt-icon-hover"
              >
                <Mic size={18} />
              </button>

              {/* Signature Blue Audio Waveform Button from Screenshot */}
              <button
                onClick={() => {
                  if (inputPrompt.trim()) {
                    handleSendMessage();
                  } else {
                    onOpenVoiceModal();
                  }
                }}
                title={inputPrompt.trim() ? "Send message" : "Start Live Voice"}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "#2563eb", // vibrant OpenAI blue
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)",
                  transition: "transform 0.1s ease, background-color 0.15s ease",
                }}
                className="chatgpt-blue-btn"
              >
                {inputPrompt.trim() ? (
                  <ArrowUp size={18} color="#ffffff" strokeWidth={2.5} />
                ) : (
                  renderWaveformIcon()
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggestion Pills below input matching screenshot */}
          <div
            style={{
              width: "100%",
              maxWidth: 768,
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingLeft: 8,
            }}
          >
            {/* 1. Create an image or sticker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "transparent",
                border: "none",
                color: "#e3e3e3",
                fontSize: 14.5,
                fontWeight: 400,
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: 8,
                textAlign: "left",
                transition: "color 0.15s ease",
              }}
              className="chatgpt-suggestion-btn"
            >
              <ImageIcon size={18} color="#b4b4b4" />
              <span>Create an image or sticker</span>
            </button>

            {/* 2. Write or edit */}
            <button
              onClick={() => {
                setInputPrompt("Calculate soil lime and fertilizer protocol for my farm in Muhanga");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "transparent",
                border: "none",
                color: "#e3e3e3",
                fontSize: 14.5,
                fontWeight: 400,
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: 8,
                textAlign: "left",
                transition: "color 0.15s ease",
              }}
              className="chatgpt-suggestion-btn"
            >
              <PenTool size={18} color="#b4b4b4" />
              <span>Write or edit</span>
            </button>

            {/* 3. Search the web */}
            <button
              onClick={() => {
                handleSendMessage(`Check real-time weather and rain washout risk for ${district}`);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "transparent",
                border: "none",
                color: "#e3e3e3",
                fontSize: 14.5,
                fontWeight: 400,
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: 8,
                textAlign: "left",
                transition: "color 0.15s ease",
              }}
              className="chatgpt-suggestion-btn"
            >
              <Globe size={18} color="#b4b4b4" />
              <span>Search the web</span>
            </button>
          </div>
        </div>
      ) : (
        /* Conversation Mode (Active Chat Stream) */
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 20px 100px 20px",
          }}
          className="chatgpt-scrollbar"
        >
          <div style={{ maxWidth: 768, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar Icon */}
                {msg.sender === "user" ? (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: "#b91c1c", // terracotta/crimson red
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    KN
                  </div>
                ) : (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backgroundColor: "#171717",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12a10 10 0 0 1 10-10z" />
                      <circle cx="12" cy="12" r="2" fill="#ffffff" />
                    </svg>
                  </div>
                )}

                {/* Message Content Container */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Sender Name & Timestamp */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>
                      {msg.sender === "user" ? "kope nshuti" : "FarmerAI (DeepSeek-V3)"}
                    </span>
                    <span style={{ fontSize: 12, color: "#8e8e8e" }}>{msg.timestamp}</span>
                  </div>

                  {/* Optional Attached Image Preview */}
                  {msg.imageUrl && (
                    <div
                      style={{
                        position: "relative",
                        maxWidth: 320,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        marginBottom: 12,
                      }}
                    >
                      <img
                        src={msg.imageUrl}
                        alt="Crop leaf sample"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          filter:
                            showGradCamMap[msg.id] && msg.diagnosisResult
                              ? "contrast(180%) saturate(300%) hue-rotate(180deg)"
                              : "none",
                          transition: "filter 0.3s ease",
                        }}
                      />

                      {/* Grad-CAM Toggle Badge if diagnosis available */}
                      {msg.diagnosisResult && (
                        <button
                          onClick={() =>
                            setShowGradCamMap((prev) => ({
                              ...prev,
                              [msg.id]: !prev[msg.id],
                            }))
                          }
                          style={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            backgroundColor: showGradCamMap[msg.id]
                              ? "#ffffff"
                              : "rgba(0, 0, 0, 0.75)",
                            color: showGradCamMap[msg.id] ? "#000000" : "#ffffff",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: 12,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Sparkles size={11} />
                          <span>{showGradCamMap[msg.id] ? "Original Photo" : "Grad-CAM Heatmap"}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Collapsible DeepSeek Thinking Box */}
                  {msg.thinking && (
                    <div
                      style={{
                        marginBottom: 12,
                        backgroundColor: "#171717",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() =>
                          setShowThinkingMap((prev) => ({
                            ...prev,
                            [msg.id]: !prev[msg.id],
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "transparent",
                          border: "none",
                          color: "#a3a3a3",
                          fontSize: 12.5,
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Brain size={14} color="#8e8e8e" />
                          <span>Thought for {msg.thinkingTimeSec || 2} seconds</span>
                        </div>
                        {showThinkingMap[msg.id] ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>

                      {showThinkingMap[msg.id] && (
                        <div
                          style={{
                            padding: "8px 12px 12px 12px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                            fontSize: 12,
                            color: "#8e8e8e",
                            fontFamily: "var(--font-family-mono)",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.5,
                          }}
                        >
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Message Text */}
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: "#ececec",
                      whiteSpace: "pre-wrap",
                    }}
                    className="chatgpt-formatted-text"
                  >
                    {msg.text}
                  </div>

                  {/* Action Bar (Copy, Audio Readout, Feedback) */}
                  {msg.sender === "assistant" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 12,
                        paddingTop: 6,
                      }}
                    >
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy text"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: copiedId === msg.id ? "#ffffff" : "#8e8e8e",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                        }}
                        className="chatgpt-icon-hover"
                      >
                        {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.text)}
                        title="Read aloud"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#8e8e8e",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        className="chatgpt-icon-hover"
                      >
                        <Volume2 size={15} />
                      </button>

                      <button
                        title="Good response"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#8e8e8e",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        className="chatgpt-icon-hover"
                      >
                        <ThumbsUp size={14} />
                      </button>

                      <button
                        title="Bad response"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#8e8e8e",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        className="chatgpt-icon-hover"
                      >
                        <ThumbsDown size={14} />
                      </button>

                      {/* Jump to Work Tab if diagnostic result */}
                      {msg.diagnosisResult && (
                        <button
                          onClick={() => onOpenWorkTab("crop-doctor")}
                          style={{
                            marginLeft: "auto",
                            background: "transparent",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: 14,
                            padding: "3px 10px",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                          className="chatgpt-icon-hover"
                        >
                          Open in Crop Doctor Studio &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "#171717",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RefreshCw size={14} color="#ffffff" className="animate-spin" />
                </div>
                <span style={{ fontSize: 14, color: "#8e8e8e" }}>
                  DeepSeek-V3 thinking...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Sticky Bottom Prompt Pill when in active conversation */}
      {messages.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, #000000 70%, transparent)",
            padding: "16px 20px 20px 20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 768,
              backgroundColor: "#212121",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 28,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
            }}
            className="chatgpt-input-bar"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach photo of crop leaf"
              style={{
                background: "transparent",
                border: "none",
                color: "#b4b4b4",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              className="chatgpt-icon-hover"
            >
              <Plus size={20} color="#b4b4b4" />
            </button>

            <input
              type="text"
              placeholder="Ask anything"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 400,
                fontFamily: "inherit",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => setIsThinkingEnabled(!isThinkingEnabled)}
                title="DeepSeek-V3 Reasoning"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 20,
                  border: isThinkingEnabled
                    ? "1px solid rgba(255, 255, 255, 0.25)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: isThinkingEnabled
                    ? "rgba(255, 255, 255, 0.12)"
                    : "transparent",
                  color: isThinkingEnabled ? "#ffffff" : "#8e8e8e",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Brain size={15} />
                <span>Think</span>
              </button>

              <button
                onClick={onOpenVoiceModal}
                title="Voice Assistant"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#b4b4b4",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                className="chatgpt-icon-hover"
              >
                <Mic size={18} />
              </button>

              <button
                onClick={() => {
                  if (inputPrompt.trim()) {
                    handleSendMessage();
                  } else {
                    onOpenVoiceModal();
                  }
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                className="chatgpt-blue-btn"
              >
                {inputPrompt.trim() ? (
                  <ArrowUp size={18} color="#ffffff" strokeWidth={2.5} />
                ) : (
                  renderWaveformIcon()
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
