/** @format */

import React from "react";
import {
  Sprout,
  ShieldCheck,
  Cpu,
  Mic,
  AlertTriangle,
  Globe,
  Bell,
  MapPin,
  Phone,
  PanelLeft,
  PanelRight,
  Sparkles,
  ChevronDown,
  Box,
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
        background: "rgba(255, 255, 255, 0.94)",
        borderBottom: "1px solid var(--border-grid)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 16px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        userSelect: "none",
      }}>
      {/* Left: Brand Logo + Sidebar Toggle + Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={toggleSidebar}
          style={{
            background:
              sidebarOpen ? "var(--qoder-violet-subtle)" : "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: 6,
            color: sidebarOpen ? "var(--primary)" : "var(--text-muted)",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title='Toggle Left Explorer & Context'>
          <PanelLeft size={16} />
        </button>

        {/* Qoder Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(47, 125, 74, 0.2)",
            }}>
            <Sparkles size={16} color='#ffffff' />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "1.05rem",
                letterSpacing: "-0.02em",
                color: "var(--text-main)",
              }}>
              FarmerAI
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--primary)",
                padding: "2px 7px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}>
              AgriMind Rwanda 🇷🇼
            </span>
          </div>
        </div>

        {/* Breadcrumb path */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.74rem",
            color: "var(--text-subtle)",
            fontFamily: "var(--font-mono)",
            marginLeft: 8,
            paddingLeft: 12,
            borderLeft: "1px solid var(--border-subtle)",
          }}>
          <span>FarmerAI</span>
          <span>/</span>
          <span style={{ color: "#e2e8f0" }}>{district}</span>
          <span>/</span>
          <span style={{ color: "#38bdf8" }}>Season A</span>
        </div>
      </div>

      {/* Center: Model Selector & District Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Model Engine Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#f7f9f6",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 10px",
            fontSize: "0.78rem",
          }}>
          <span className='qoder-dot qoder-dot-violet' />
          <span style={{ color: "var(--text-muted)" }}>Engine:</span>
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary)",
              fontSize: "0.78rem",
              fontWeight: 700,
              padding: 0,
              cursor: "pointer",
              width: "auto",
              fontFamily: "var(--font-mono)",
            }}>
            <option value='DeepSeek-V3' style={{ background: "#0e1117" }}>
              DeepSeek-V3 (671B MoE)
            </option>
            <option value='EfficientNetV2-S' style={{ background: "#0e1117" }}>
              EfficientNetV2-S (ONNX 38ms)
            </option>
            <option value='YOLOv11n' style={{ background: "#0e1117" }}>
              YOLOv11n (Spatial BBoxes)
            </option>
            <option value='Llama-3.2-3B' style={{ background: "#0e1117" }}>
              Llama-3.2 (RAG Local)
            </option>
          </select>
        </div>

        {/* District Selector Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#f7f9f6",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 10px",
            fontSize: "0.78rem",
          }}>
          <MapPin size={13} color='#38bdf8' />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value as RwandaDistrict)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-main)",
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: 0,
              cursor: "pointer",
              width: "auto",
            }}>
            <option value='Muhanga' style={{ background: "#0e1117" }}>
              Muhanga (Southern)
            </option>
            <option value='Musanze' style={{ background: "#0e1117" }}>
              Musanze (Northern)
            </option>
            <option value='Ruhango' style={{ background: "#0e1117" }}>
              Ruhango (Southern)
            </option>
            <option value='Huye' style={{ background: "#0e1117" }}>
              Huye (Southern)
            </option>
            <option value='Nyabihu' style={{ background: "#0e1117" }}>
              Nyabihu (Western)
            </option>
            <option value='Rubavu' style={{ background: "#0e1117" }}>
              Rubavu (Western)
            </option>
            <option value='Nyagatare' style={{ background: "#0e1117" }}>
              Nyagatare (Eastern)
            </option>
            <option value='Bugesera' style={{ background: "#0e1117" }}>
              Bugesera (Eastern)
            </option>
          </select>
        </div>

        {/* Outbreak alert button */}
        <button
          onClick={onOpenOutbreaks}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#fff8f5",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fb7185",
            borderRadius: "var(--radius-sm)",
            padding: "4px 10px",
            fontSize: "0.76rem",
            fontWeight: 600,
            cursor: "pointer",
          }}>
          <AlertTriangle size={13} />
          <span>{activeOutbreakCount} Outbreaks</span>
        </button>
      </div>

      {/* Right side: Role selector, Offline USSD, Voice, Co-Pilot Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Role switcher */}
        <div
          style={{
            display: "flex",
            background: "#f7f9f6",
            borderRadius: 6,
            padding: 2,
            border: "1px solid var(--border-subtle)",
          }}>
          {(["farmer", "agronomist", "developer"] as const).map((r) => {
            const isActive = currentRole === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  background:
                    isActive ?
                      r === "farmer" ? "var(--primary)"
                      : r === "agronomist" ? "#287ca8"
                      : "#66716a"
                    : "transparent",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}>
                {r === "farmer" ?
                  "Farmer"
                : r === "agronomist" ?
                  "Agronomist"
                : "ML Dev"}
              </button>
            );
          })}
        </div>

        {/* Offline USSD feature phone launcher */}
        <button
          onClick={onOpenUssdModal}
          className='btn btn-secondary btn-sm'
          style={{
            gap: 5,
            padding: "4px 9px",
            fontSize: "0.76rem",
            borderRadius: 6,
          }}
          title='Launch *844# Offline Feature Phone USSD Simulator'>
          <Phone size={12} color='#10b981' />
          <span>*844# USSD</span>
        </button>

        {/* Voice Assistant launcher */}
        <button
          onClick={onOpenVoiceModal}
          className='btn btn-outline-gold btn-sm'
          style={{
            gap: 5,
            padding: "4px 9px",
            fontSize: "0.76rem",
            borderRadius: 6,
          }}
          title='Launch Voice Farming Assistant'>
          <Mic size={12} />
          <span>{isRw ? "Ijwi" : "Voice"}</span>
        </button>

        {/* Language selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "#f7f9f6",
            borderRadius: 6,
            padding: "3px 6px",
            border: "1px solid var(--border-subtle)",
          }}>
          <Globe size={12} color='var(--text-muted)' />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-main)",
              fontSize: "0.74rem",
              padding: 0,
              cursor: "pointer",
              width: "auto",
            }}>
            <option value='rw' style={{ background: "#0e1117" }}>
              RW
            </option>
            <option value='en' style={{ background: "#0e1117" }}>
              EN
            </option>
            <option value='fr' style={{ background: "#0e1117" }}>
              FR
            </option>
          </select>
        </div>

        {/* Co-Pilot Toggle Button */}
        <button
          onClick={toggleCopilot}
          style={{
            background:
              copilotOpen ? "var(--qoder-violet-subtle)" : "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: 6,
            color: copilotOpen ? "var(--primary)" : "var(--text-muted)",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title='Toggle Qoder Agentic Co-Pilot'>
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
};
