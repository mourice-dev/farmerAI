/** @format */

import React from "react";
import {
  PanelLeft,
  Gift,
  Sparkles,
  ChevronDown,
  Globe,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { Language, RwandaDistrict } from "../types";

const RWANDA_DISTRICTS: RwandaDistrict[] = [
  "Muhanga",
  "Musanze",
  "Ruhango",
  "Huye",
  "Nyabihu",
  "Rubavu",
  "Nyagatare",
  "Bugesera",
  "Kicukiro",
  "Gakenke",
  "Nyamagabe",
  "Rwamagana",
];

interface ChatGptHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeMode: "chat" | "work";
  onSelectMode: (mode: "chat" | "work") => void;
  district: RwandaDistrict;
  onSelectDistrict: (d: RwandaDistrict) => void;
  language: Language;
  onToggleLanguage: () => void;
  activeModel?: string;
  onSelectModel?: (m: string) => void;
}

export function ChatGptHeader({
  sidebarOpen,
  onToggleSidebar,
  activeMode,
  onSelectMode,
  district,
  onSelectDistrict,
  language,
  onToggleLanguage,
  activeModel = "DeepSeek-V3",
  onSelectModel,
}: ChatGptHeaderProps) {
  return (
    <header
      className="chatgpt-header"
      style={{
        height: 52,
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        fontFamily: "var(--font-family-aeonik)",
      }}
    >
      {/* Left Area: Sidebar toggle when collapsed, or subtle title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            title="Open sidebar"
            style={{
              background: "transparent",
              border: "none",
              color: "#b4b4b4",
              padding: "6px 8px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            className="chatgpt-icon-hover"
          >
            <PanelLeft size={18} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff" }}>
              ChatGPT
            </span>
          </button>
        )}

        {/* Model dropdown / badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 8px",
            borderRadius: 6,
            cursor: "pointer",
            color: "#b4b4b4",
            fontSize: 13,
            fontWeight: 500,
          }}
          className="chatgpt-model-badge"
          title="Active Reasoning Engine"
        >
          <span style={{ color: "#ffffff" }}>FarmerAI</span>
          <span style={{ color: "#8e8e8e" }}>{activeModel}</span>
          <ChevronDown size={14} color="#8e8e8e" />
        </div>
      </div>

      {/* Center Segmented Toggle: [ Chat | + Work ] matching screenshot */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#171717",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 24,
          padding: 3,
          gap: 2,
        }}
      >
        <button
          onClick={() => onSelectMode("chat")}
          style={{
            background: activeMode === "chat" ? "#262626" : "transparent",
            color: activeMode === "chat" ? "#ffffff" : "#a3a3a3",
            border: "none",
            borderRadius: 20,
            padding: "5px 18px",
            fontSize: 13.5,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow:
              activeMode === "chat" ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
          }}
        >
          Chat
        </button>

        <button
          onClick={() => onSelectMode("work")}
          style={{
            background: activeMode === "work" ? "#262626" : "transparent",
            color: activeMode === "work" ? "#ffffff" : "#a3a3a3",
            border: "none",
            borderRadius: 20,
            padding: "5px 18px",
            fontSize: 13.5,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow:
              activeMode === "work" ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
          }}
        >
          <span>+ Work</span>
        </button>
      </div>

      {/* Right Area: Free offer & Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* District Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: "4px 10px",
            fontSize: 12,
            color: "#e3e3e3",
          }}
        >
          <MapPin size={12} color="#ffffff" />
          <select
            value={district}
            onChange={(e) => onSelectDistrict(e.target.value as RwandaDistrict)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: 12,
              fontFamily: "inherit",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {RWANDA_DISTRICTS.map((d) => (
              <option key={d} value={d} style={{ background: "#171717", color: "#ffffff" }}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Free offer button from screenshot */}
        <button
          onClick={() => alert("Free offer active: Free access to DeepSeek-V3 MoE 671B Agro-Reasoning and Rwandan Weather Fusion.")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "none",
            borderRadius: 16,
            padding: "5px 10px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          className="chatgpt-icon-hover"
        >
          <Gift size={16} color="#ffffff" />
          <span>Free offer</span>
        </button>

        {/* Language switch button */}
        <button
          onClick={onToggleLanguage}
          title="Toggle Language (English / Ikinyarwanda)"
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
          className="chatgpt-icon-hover"
        >
          {language === "rw" ? "RW" : "EN"}
        </button>

        {/* Circle profile / user arc swirl icon from screenshot */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "1.5px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="OpenAI / FarmerAI Account"
        >
          {/* Swirl Arc SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      </div>
    </header>
  );
}
