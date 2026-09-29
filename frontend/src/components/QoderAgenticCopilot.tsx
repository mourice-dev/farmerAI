/** @format */

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ChevronRight,
  X,
} from "lucide-react";
import { DiseaseDetectionResult, FarmProfile, Language, WeatherData } from "../types";
import { AIPipelineService, ChatMessage } from "../services/aiPipelineService";

interface QoderAgenticCopilotProps {
  farm: FarmProfile;
  weather: WeatherData;
  recentDiagnosis: DiseaseDetectionResult | null;
  language: Language;
  isOpen: boolean;
  onToggle: () => void;
  activeModel: string;
}

export const QoderAgenticCopilot: React.FC<QoderAgenticCopilotProps> = ({
  farm,
  weather,
  recentDiagnosis,
  language,
  isOpen,
  onToggle,
  activeModel,
}) => {
  const isRw = language === "rw";

  const [inputVal, setInputVal] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-01",
      sender: "ai",
      text: isRw
        ? `Muraho ${farm.farmerName}! Ndi Starcloud Agentic Co-Pilot ufashijwe na ${activeModel}. Ikirere cy'i ${farm.district} kiragaragaza ubuhehere bwa ${weather.humidityPercentage}% n'amahirwe y'imvura ya ${weather.rainChance24h}%. Ushobora kumpa amategeko yo gusesengura amababi, kubara ifumbire, cyangwa gutegura ihinga ry'igihembwe.`
        : `Hello ${farm.farmerName}! I am your Starcloud Autonomous Agent running on ${activeModel}. District ${farm.district} has ${weather.humidityPercentage}% humidity and ${weather.rainChance24h}% rain chance. Delegate autonomous farming tasks, ask for disease remedies, or execute agro-calendar planning.`,
      timestamp: "Now",
      suggestedActions: isRw
        ? ["/ikirere (Weather Washout Risk)", "/gusuzuma (Run Vision Model)", "/ifumbire (Lime & Fertilizer)"]
        : ["/weather (Rain & Washout)", "/diagnose (Run Vision ONNX)", "/lime (Calculate Soil Travertine)"],
    },
  ]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          background: "#ffffff",
          color: "#000000",
          border: "none",
          borderTopLeftRadius: 100,
          borderBottomLeftRadius: 100,
          padding: "14px 8px",
          cursor: "pointer",
          boxShadow: "-4px 4px 20px rgba(255, 255, 255, 0.2)",
          zIndex: 85,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
        title="Open Starcloud Co-Pilot"
      >
        <Sparkles size={16} color="#000000" />
        <span
          style={{
            writingMode: "vertical-rl",
            fontSize: "0.72rem",
            fontFamily: "var(--font-family-mono)",
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}
        >
          CO-PILOT
        </span>
      </button>
    );
  }

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "farmer",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsProcessing(true);

    const response = await AIPipelineService.queryAgriAssistant(
      query,
      farm,
      recentDiagnosis,
      weather,
      language
    );

    setMessages((prev) => [...prev, response]);
    setIsProcessing(false);
  };

  const handleQuickCommand = (cmd: string) => {
    if (cmd.includes("weather") || cmd.includes("ikirere")) {
      handleSend(isRw ? "Ese imvura iragwa ejo i Muhanga?" : "Will it rain tomorrow in Muhanga?");
    } else if (cmd.includes("diagnose") || cmd.includes("gusuzuma")) {
      handleSend(isRw ? "Ndashaka gusuzuma ibibabi by'inyanya" : "Diagnose tomato leaf spots");
    } else if (cmd.includes("lime") || cmd.includes("ifumbire")) {
      handleSend(isRw ? "Urugereko rwo gushyira ingwa (chaux) mu butaka" : "Calculate travertine lime for acidic soil");
    }
  };

  return (
    <aside
      style={{
        width: 340,
        background: "#000000",
        borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        zIndex: 80,
        fontFamily: "var(--font-family-aeonik)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 6px #ffffff",
            }}
          />
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "#ffffff",
              letterSpacing: "0.04em",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            STARCLOUD AGENT
          </span>
          <span
            style={{
              fontSize: "0.68rem",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              padding: "1px 8px",
              borderRadius: 100,
              fontFamily: "var(--font-family-mono)",
            }}
          >
            {activeModel}
          </span>
        </div>

        <button
          onClick={onToggle}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title="Minimize Co-Pilot"
        >
          <X size={16} />
        </button>
      </div>

      {/* Message Stream */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          background: "#000000",
        }}
      >
        {messages.map((m) => {
          const isAI = m.sender === "ai";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isAI ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                  fontSize: "0.7rem",
                  color: "rgba(255, 255, 255, 0.45)",
                  fontFamily: "var(--font-family-mono)",
                }}
              >
                {isAI ? <Bot size={12} color="#ffffff" /> : <User size={12} />}
                <span>{isAI ? `Agent (${activeModel})` : "You"}</span>
                <span>• {m.timestamp}</span>
              </div>

              <div
                style={{
                  background: isAI ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
                  border: isAI ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  color: isAI ? "#ffffff" : "#000000",
                  maxWidth: "92%",
                  fontWeight: isAI ? 400 : 500,
                }}
              >
                {m.text}

                {/* Suggested actions chips */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {m.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickCommand(act)}
                        style={{
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: 8,
                          color: "#ffffff",
                          padding: "6px 10px",
                          fontSize: "0.76rem",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontFamily: "var(--font-family-mono)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <ChevronRight size={11} color="#ffffff" />
                        <span>{act}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.78rem",
              color: "rgba(255, 255, 255, 0.6)",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            <Sparkles size={14} color="#ffffff" />
            <span>Starcloud Agent synthesizing agronomic logic...</span>
          </div>
        )}
      </div>

      {/* Quick Action Commands */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          gap: 6,
          background: "rgba(255, 255, 255, 0.02)",
          overflowX: "auto",
        }}
      >
        {[
          { label: "/weather", action: "weather" },
          { label: "/diagnose", action: "diagnose" },
          { label: "/lime", action: "lime" },
        ].map((chip) => (
          <button
            key={chip.action}
            onClick={() => handleQuickCommand(chip.action)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 100,
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.72rem",
              padding: "3px 10px",
              fontFamily: "var(--font-family-mono)",
              cursor: "pointer",
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Prompt Box */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "#000000",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            type="text"
            placeholder={isRw ? "Andika ubutumwa cyangwa /ikirere..." : "Prompt agent in Kinyarwanda or EN..."}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 100,
              padding: "9px 16px",
              fontSize: "0.82rem",
              color: "#ffffff",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            disabled={!inputVal.trim() || isProcessing}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </aside>
  );
};
