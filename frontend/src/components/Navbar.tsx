/** @format */

import React from "react";
import {
  Sparkles,
  MapPin,
  Phone,
  Mic,
  PanelLeft,
  PanelRight,
  ChevronDown,
  ArrowUpRight,
  Cpu,
} from "lucide-react";
import { Language, UserRole, RwandaDistrict } from "../types";

interface NavbarProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  district: RwandaDistrict;
  setDistrict: (district: RwandaDistrict) => void;
  activeOutbreakCount: number;
  onOpenVoiceModal: () => void;
  onOpenOutbreaks: () => void;
  onOpenUssdModal: () => void;
  activeModel: string;
  setActiveModel: (model: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  copilotOpen: boolean;
  toggleCopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setRole,
  language,
  setLanguage,
  district,
  setDistrict,
  activeOutbreakCount,
  onOpenVoiceModal,
  onOpenOutbreaks,
  onOpenUssdModal,
  activeModel,
  setActiveModel,
  sidebarOpen,
  toggleSidebar,
  copilotOpen,
  toggleCopilot,
}) => {
  const isRw = language === "rw";

  return (
    <header
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 20px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        userSelect: "none",
        fontFamily: "var(--font-family-aeonik)",
      }}
    >
      {/* Left: Starcloud Geometric Brand Logo + Sidebar Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: sidebarOpen ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 100,
            color: "#ffffff",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="Toggle Left Context"
        >
          <PanelLeft size={14} />
        </button>

        {/* Brand Logo - Starcloud Style Geometric Emblem */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000000",
              boxShadow: "0 0 14px rgba(255, 255, 255, 0.35)",
            }}
          >
            <Sparkles size={15} color="#000000" />
          </div>

          <span
            style={{
              fontFamily: "var(--font-family-aeonik)",
              fontWeight: 600,
              fontSize: "1.12rem",
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            Starcloud
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "0.65rem",
              color: "rgba(255, 255, 255, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "1px 6px",
              borderRadius: 100,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Agri
          </span>
        </div>
      </div>

      {/* Center: Starcloud Signature Floating Nav Pill */}
      <div className="starcloud-nav-pill-container" style={{ padding: "2px 4px" }}>
        <a href="#platform" className="starcloud-nav-link active" style={{ padding: "5px 12px", fontSize: "0.82rem" }}>Platform</a>
        <a href="#models" className="starcloud-nav-link" style={{ padding: "5px 12px", fontSize: "0.82rem" }}>Models</a>
        <a href="#radar" className="starcloud-nav-link" style={{ padding: "5px 12px", fontSize: "0.82rem" }}>Radar</a>
        <a href="#soil" className="starcloud-nav-link" style={{ padding: "5px 12px", fontSize: "0.82rem" }}>Soil AI</a>
        <a href="#market" className="starcloud-nav-link" style={{ padding: "5px 12px", fontSize: "0.82rem" }}>Market</a>
      </div>

      {/* Right Controls: Role, District, Offline USSD, CTA Button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* District Selector Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 100,
            padding: "4px 10px",
            fontSize: "0.76rem",
            color: "#ffffff",
          }}
        >
          <MapPin size={11} color="#ffffff" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value as RwandaDistrict)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: "0.76rem",
              fontWeight: 500,
              padding: 0,
              cursor: "pointer",
            }}
          >
            <option value="Muhanga" style={{ background: "#000000" }}>Muhanga</option>
            <option value="Musanze" style={{ background: "#000000" }}>Musanze</option>
            <option value="Ruhango" style={{ background: "#000000" }}>Ruhango</option>
            <option value="Huye" style={{ background: "#000000" }}>Huye</option>
            <option value="Nyabihu" style={{ background: "#000000" }}>Nyabihu</option>
            <option value="Rubavu" style={{ background: "#000000" }}>Rubavu</option>
            <option value="Nyagatare" style={{ background: "#000000" }}>Nyagatare</option>
            <option value="Bugesera" style={{ background: "#000000" }}>Bugesera</option>
          </select>
        </div>

        {/* Model Engine Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 100,
            padding: "4px 10px",
            fontSize: "0.76rem",
            color: "#ffffff",
          }}
        >
          <Cpu size={11} color="#ffffff" />
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: "0.76rem",
              fontWeight: 500,
              padding: 0,
              cursor: "pointer",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            <option value="DeepSeek-V3" style={{ background: "#000000" }}>DeepSeek-V3</option>
            <option value="EfficientNetV2-S" style={{ background: "#000000" }}>ONNX 38ms</option>
            <option value="YOLOv11n" style={{ background: "#000000" }}>YOLOv11</option>
            <option value="Llama-3.2-3B" style={{ background: "#000000" }}>Llama-3.2</option>
          </select>
        </div>

        {/* Role Switcher Pill */}
        <div
          style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 100,
            padding: 2,
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {(["farmer", "agronomist", "developer"] as const).map((r) => {
            const isActive = currentRole === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  background: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#000000" : "rgba(255, 255, 255, 0.6)",
                  border: "none",
                  padding: "3px 8px",
                  borderRadius: 100,
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {r === "farmer" ? "Farmer" : r === "agronomist" ? "Agronomist" : "Dev"}
              </button>
            );
          })}
        </div>

        {/* Offline USSD Pill */}
        <button
          onClick={onOpenUssdModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            borderRadius: 100,
            padding: "5px 12px",
            fontSize: "0.76rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-family-mono)",
            transition: "all 0.2s ease",
          }}
          title="Launch *844# Offline Feature Phone USSD Simulator"
        >
          <Phone size={11} color="#ffffff" />
          <span>*844#</span>
        </button>

        {/* Starcloud Signature Primary CTA: Solid White Pill Button */}
        <button
          onClick={onOpenVoiceModal}
          style={{
            background: "#ffffff",
            color: "#000000",
            border: "none",
            borderRadius: 100,
            padding: "6px 18px",
            fontSize: "0.82rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-family-aeonik)",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 10px rgba(255, 255, 255, 0.25)",
            whiteSpace: "nowrap",
          }}
        >
          Get in touch
        </button>

        {/* Co-Pilot Toggle */}
        <button
          onClick={toggleCopilot}
          style={{
            background: copilotOpen ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 100,
            color: "#ffffff",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="Toggle Agentic Co-Pilot"
        >
          <PanelRight size={14} />
        </button>
      </div>
    </header>
  );
};
