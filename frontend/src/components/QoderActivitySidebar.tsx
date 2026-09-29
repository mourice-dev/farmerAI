/** @format */

import React, { useState } from "react";
import {
  FolderTree,
  FileCode,
  Box,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FileText,
  Activity,
} from "lucide-react";
import { FarmProfile, Language, RwandaDistrict } from "../types";

interface QoderActivitySidebarProps {
  currentDistrict: RwandaDistrict;
  onSelectDistrict: (district: RwandaDistrict) => void;
  farm: FarmProfile;
  language: Language;
  onSelectTab: (tabId: string) => void;
}

export const QoderActivitySidebar: React.FC<QoderActivitySidebarProps> = ({
  currentDistrict,
  onSelectDistrict,
  farm,
  language,
  onSelectTab,
}) => {
  const isRw = language === "rw";

  const [repoOpen, setRepoOpen] = useState<boolean>(true);
  const [parcelsOpen, setParcelsOpen] = useState<boolean>(true);
  const [questsOpen, setQuestsOpen] = useState<boolean>(true);

  return (
    <aside
      style={{
        width: 270,
        background: "#000000",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        userSelect: "none",
        overflowY: "auto",
        fontFamily: "var(--font-family-aeonik)",
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.72rem",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.5)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: "var(--font-family-mono)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FolderTree size={14} color="#ffffff" />
          <span style={{ color: "#ffffff", fontWeight: 500 }}>
            CONTEXT & ASSETS
          </span>
        </div>
        <span
          style={{
            fontSize: "0.65rem",
            background: "rgba(255, 255, 255, 0.08)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "1px 6px",
            borderRadius: 100,
          }}
        >
          STARCLOUD
        </span>
      </div>

      {/* SECTION 1: AGRIMIND REPO & MODEL ASSETS */}
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <button
          onClick={() => setRepoOpen(!repoOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "transparent",
            border: "none",
            color: "#ffffff",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-family-mono)",
            letterSpacing: "0.04em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {repoOpen ? <ChevronDown size={12} color="rgba(255, 255, 255, 0.6)" /> : <ChevronRight size={12} color="rgba(255, 255, 255, 0.6)" />}
            <span>WORKSPACE ASSETS</span>
          </div>
          <span style={{ fontSize: "0.65rem", color: "rgba(255, 255, 255, 0.4)" }}>6 files</span>
        </button>

        {repoOpen && (
          <div
            style={{
              padding: "0 10px 10px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              fontSize: "0.76rem",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            <div
              onClick={() => onSelectTab("ml-workbench")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 4,
              }}
              title="Cloned MoE LLM Repository"
            >
              <Box size={13} color="#ffffff" />
              <span>DeepSeek-V3/</span>
            </div>

            <div
              onClick={() => onSelectTab("ml-workbench")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 4,
              }}
              title="80.6 MB Quantized ONNX Model"
            >
              <FileCode size={13} color="#ffffff" />
              <span>efficientnet_v2_s.onnx</span>
            </div>

            <div
              onClick={() => onSelectTab("ml-workbench")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 4,
              }}
              title="74.7 MB PyTorch Checkpoint"
            >
              <FileCode size={13} color="rgba(255, 255, 255, 0.5)" />
              <span>best_model.pth</span>
            </div>

            <div
              onClick={() => onSelectTab("ml-workbench")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 4,
              }}
              title="38 Plant Disease Classes"
            >
              <FileText size={13} color="rgba(255, 255, 255, 0.5)" />
              <span>classes.json (38 cl)</span>
            </div>

            <div
              onClick={() => onSelectTab("ml-workbench")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 4,
              }}
              title="FastAPI Microservice Bridge"
            >
              <FileCode size={13} color="rgba(255, 255, 255, 0.5)" />
              <span>backend_bridge.py</span>
            </div>

            <div
              onClick={() => onSelectTab("crop-doctor")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 4,
              }}
              title="Grad-CAM Explainable AI Heatmap"
            >
              <Activity size={13} color="#ffffff" />
              <span>sample_gradcam.png</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: RWANDA AGRO PARCELS */}
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <button
          onClick={() => setParcelsOpen(!parcelsOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "transparent",
            border: "none",
            color: "#ffffff",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-family-mono)",
            letterSpacing: "0.04em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {parcelsOpen ? <ChevronDown size={12} color="rgba(255, 255, 255, 0.6)" /> : <ChevronRight size={12} color="rgba(255, 255, 255, 0.6)" />}
            <span>ACTIVE PARCELS & REGIONS</span>
          </div>
          <span style={{ fontSize: "0.65rem", color: "rgba(255, 255, 255, 0.4)" }}>Rwanda 🇷🇼</span>
        </button>

        {parcelsOpen && (
          <div style={{ padding: "0 10px 10px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
            {[
              { district: "Muhanga", alt: "1,820m", crop: "Tomatoes" },
              { district: "Musanze", alt: "2,200m", crop: "Irish Potato (Kinigi)" },
              { district: "Nyabihu", alt: "2,350m", crop: "Irish Potato" },
              { district: "Nyagatare", alt: "1,400m", crop: "Hybrid Maize" },
              { district: "Bugesera", alt: "1,350m", crop: "Cassava / Beans" },
            ].map((p) => {
              const isSelected = currentDistrict === p.district;
              return (
                <div
                  key={p.district}
                  onClick={() => onSelectDistrict(p.district as RwandaDistrict)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: isSelected ? "rgba(255, 255, 255, 0.12)" : "transparent",
                    border: isSelected ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid transparent",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={12} color={isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.4)"} />
                    <span style={{ fontWeight: isSelected ? 500 : 400 }}>
                      {p.district}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.4)" }}>{p.alt}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: AGENTIC QUESTS */}
      <div style={{ flex: 1, paddingBottom: 16 }}>
        <button
          onClick={() => setQuestsOpen(!questsOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "transparent",
            border: "none",
            color: "#ffffff",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-family-mono)",
            letterSpacing: "0.04em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {questsOpen ? <ChevronDown size={12} color="rgba(255, 255, 255, 0.6)" /> : <ChevronRight size={12} color="rgba(255, 255, 255, 0.6)" />}
            <span>ACTIVE PIPELINES</span>
          </div>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 6px #ffffff",
            }}
          />
        </button>

        {questsOpen && (
          <div style={{ padding: "0 10px 12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Quest 1 */}
            <div
              onClick={() => onSelectTab("crop-doctor")}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: "0.7rem", color: "#ffffff", fontFamily: "var(--font-family-mono)", textTransform: "uppercase" }}>
                  Pipeline #101 • Running
                </span>
                <span style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.4)" }}>3/4 Steps</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: 500 }}>
                Mitigate Early Blight Fungal Threat
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.55)", marginTop: 3 }}>
                Rain forecasted; postpone spray 24h & prune lower canopy.
              </div>
            </div>

            {/* Quest 2 */}
            <div
              onClick={() => onSelectTab("soil-advisor")}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: "0.7rem", color: "#ffffff", fontFamily: "var(--font-family-mono)", textTransform: "uppercase" }}>
                  Pipeline #102 • Completed
                </span>
                <CheckCircle2 size={12} color="#ffffff" />
              </div>
              <div style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: 500 }}>
                Soil Acidity Liming (pH 5.1 &rarr; 6.2)
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.55)", marginTop: 3 }}>
                Applied 150 kg/ha travertine before Season A sowing.
              </div>
            </div>

            {/* Quest 3 */}
            <div
              onClick={() => onSelectTab("marketplace")}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: "0.7rem", color: "#ffffff", fontFamily: "var(--font-family-mono)", textTransform: "uppercase" }}>
                  Pipeline #103 • Queued
                </span>
                <Clock size={12} color="rgba(255, 255, 255, 0.5)" />
              </div>
              <div style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: 500 }}>
                Forward Contract Locking (950 RWF/kg)
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.55)", marginTop: 3 }}>
                Lock 1,200 kg Grade A tomato produce with Kigali buyer.
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
