/** @format */

import React, { useState } from "react";
import {
  Sprout,
  Calendar,
  Layers,
  CloudRain,
  Droplets,
  Thermometer,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Box,
  User,
  Users,
  CreditCard,
  Database,
  LineChart,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Radio,
} from "lucide-react";
import { DecisionFusionAdvice, FarmProfile, Language, WeatherData } from "../types";

interface HeroFarmStatusProps {
  farm: FarmProfile;
  weather: WeatherData;
  advice: DecisionFusionAdvice;
  language: Language;
  onScanLeafClick: () => void;
}

export const HeroFarmStatus: React.FC<HeroFarmStatusProps> = ({
  farm,
  weather,
  advice,
  language,
  onScanLeafClick,
}) => {
  const isRw = language === "rw";
  const [activeTab, setActiveTab] = useState<"overview" | "why">("overview");

  return (
    <div style={{ marginBottom: 36, fontFamily: "var(--font-family-aeonik)" }}>
      {/* 1. Starcloud Hero Section */}
      <section
        style={{
          paddingTop: 32,
          paddingBottom: 40,
          position: "relative",
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "260px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Hero Tag Badge */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 14px",
              borderRadius: 100,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "0.8rem",
              fontFamily: "var(--font-family-mono)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 0 8px #ffffff",
              }}
            />
            <span>THE FUTURE OF AGRONOMIC AI IS AUTONOMOUS</span>
          </div>
        </div>

        {/* Big Headline in Starcloud Aeonik Style */}
        <h1
          style={{
            fontSize: "3.75rem",
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            fontWeight: 500,
            color: "#ffffff",
            maxWidth: 900,
            marginBottom: 18,
          }}
        >
          Data-Driven Agriculture from Space to Soil.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.15rem",
            lineHeight: 1.6,
            color: "rgba(255, 255, 255, 0.65)",
            maxWidth: 680,
            marginBottom: 28,
            fontWeight: 400,
          }}
        >
          Starcloud AgriMind unites orbital satellite climate synthesis with on-device neural vision, offering 90% lower crop loss and 24/7 autonomous precision farming.
        </p>

        {/* Hero CTA Button Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
          <button
            onClick={onScanLeafClick}
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "none",
              borderRadius: 100,
              padding: "12px 28px",
              fontSize: "0.92rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(255, 255, 255, 0.25)",
            }}
          >
            <Sprout size={16} />
            <span>{isRw ? "Gusuzuma Ibibabi (AI Scan)" : "Scan Crop Leaf"}</span>
          </button>

          <a
            href="https://minagri.gov.rw"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 100,
              padding: "12px 24px",
              fontSize: "0.92rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            <span>View White Paper</span>
            <ArrowUpRight size={15} />
          </a>
        </div>

        {/* 2. Starcloud Metric Counters Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "2.4rem",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              99.89%
            </div>
            <div
              style={{
                fontSize: "0.74rem",
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "var(--font-family-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 4,
              }}
            >
              Model Validation Accuracy
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "2.4rem",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              38ms
            </div>
            <div
              style={{
                fontSize: "0.74rem",
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "var(--font-family-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 4,
              }}
            >
              ONNX Edge Inference Latency
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "2.4rem",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              30 / 30
            </div>
            <div
              style={{
                fontSize: "0.74rem",
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "var(--font-family-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 4,
              }}
            >
              Rwanda Districts Covered
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "2.4rem",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              24/7
            </div>
            <div
              style={{
                fontSize: "0.74rem",
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "var(--font-family-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 4,
              }}
            >
              Autonomous Weather Fusion
            </div>
          </div>
        </div>

        {/* 3. Live Active Field Operations Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Sprout size={18} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1rem", fontWeight: 500, color: "#ffffff" }}>
                  {farm.farmerName} • {farm.district}, {farm.sector}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                    fontFamily: "var(--font-family-mono)",
                  }}
                >
                  ACTIVE FIELD
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)", marginTop: 2 }}>
                {farm.crop} ({farm.variety}) • {farm.fieldSizeHectares} ha • {farm.altitudeMeters}m alt • {farm.soilType} Soil
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: 100,
                fontSize: "0.8rem",
              }}
            >
              <Thermometer size={13} color="#ffffff" />
              <span style={{ fontWeight: 500, color: "#ffffff" }}>{weather.tempCelsius}°C</span>
              <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.74rem" }}>Temp</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: 100,
                fontSize: "0.8rem",
              }}
            >
              <Droplets size={13} color="#ffffff" />
              <span style={{ fontWeight: 500, color: "#ffffff" }}>{weather.humidityPercentage}%</span>
              <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.74rem" }}>Humidity</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: 100,
                fontSize: "0.8rem",
              }}
            >
              <CloudRain size={13} color="#ffffff" />
              <span style={{ fontWeight: 500, color: "#ffffff" }}>{weather.rainChance24h}%</span>
              <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.74rem" }}>Rain Prob</span>
            </div>
          </div>
        </div>

        {/* 4. Starcloud Feature Grid: "Why Autonomous Agronomy" */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-family-mono)",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                PLATFORM CAPABILITIES
              </div>
              <h2
                style={{
                  fontSize: "1.85rem",
                  fontWeight: 500,
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                }}
              >
                Why Data Centers in Space power Agriculture
              </h2>
            </div>

            <span
              style={{
                fontSize: "0.82rem",
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              ARCHITECTURE SPECIFICATION
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16,
            }}
          >
            {/* Card 1: Full-Stack Vision Support */}
            <div
              className="starcloud-card"
              style={{
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <Layers size={18} />
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "#ffffff" }}>
                Full-Stack Vision Inference
              </div>
              <div style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6 }}>
                Quantized ONNX pipeline executing sub-38ms plant pathology scans on low-power devices with Grad-CAM neural attention heatmaps.
              </div>
            </div>

            {/* Card 2: Diverse Agentic Decision Modes */}
            <div
              className="starcloud-card"
              style={{
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <Cpu size={18} />
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "#ffffff" }}>
                DeepSeek-V3 MoE Architecture
              </div>
              <div style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6 }}>
                671B Mixture-of-Experts engine routing 37B active parameters per token to fuse live Meteo microclimates with Rwanda Agriculture Board protocols.
              </div>
            </div>

            {/* Card 3: Enhanced Context Analysis Engine */}
            <div
              className="starcloud-card"
              style={{
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <TrendingUp size={18} />
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "#ffffff" }}>
                Hyperlocal Climate Radar
              </div>
              <div style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6 }}>
                Synthesizes relative humidity, leaf wetness hours, and district mineral horizon data to prevent rain washout and calculate travertine lime requirements.
              </div>
            </div>

            {/* Card 4: Customizable Extension Capabilities */}
            <div
              className="starcloud-card"
              style={{
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <Radio size={18} />
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "#ffffff" }}>
                Sub-Saharan 2G USSD Distribution
              </div>
              <div style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6 }}>
                Zero-bandwidth cellular access via *844# USSD simulation, empowering rural smallholders without internet to receive verified AI prescriptions.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
