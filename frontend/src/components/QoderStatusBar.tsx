/** @format */

import React from "react";
import {
  GitBranch,
  Cpu,
  MapPin,
  CloudRain,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { RwandaDistrict, WeatherData } from "../types";

interface QoderStatusBarProps {
  district: RwandaDistrict;
  weather: WeatherData;
  activeModel: string;
}

export const QoderStatusBar: React.FC<QoderStatusBarProps> = ({
  district,
  weather,
  activeModel,
}) => {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 28,
        background: "#000000",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        fontSize: "0.72rem",
        color: "rgba(255, 255, 255, 0.45)",
        fontFamily: "var(--font-family-mono)",
        zIndex: 95,
        userSelect: "none",
      }}
    >
      {/* Left side: Git, Workspace, Active Model */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#ffffff", fontWeight: 500 }}>
          <GitBranch size={12} color="#ffffff" />
          <span>main</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 6px #ffffff",
            }}
          />
          <span style={{ color: "#ffffff" }}>Engine: {activeModel}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255, 255, 255, 0.45)" }}>
          <span>|</span>
          <Cpu size={11} color="#ffffff" />
          <span>ONNX 38ms</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255, 255, 255, 0.45)" }}>
          <span>|</span>
          <Activity size={11} color="#ffffff" />
          <span>Val Acc: 99.89%</span>
        </div>
      </div>

      {/* Right side: Agro-Meteo & Standards */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#ffffff" }}>
          <MapPin size={11} color="#ffffff" />
          <span>{district}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255, 255, 255, 0.7)" }}>
          <CloudRain size={11} color="#ffffff" />
          <span>{weather.tempCelsius}°C • {weather.humidityPercentage}% Hum</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#ffffff" }}>
          <CheckCircle2 size={11} color="#ffffff" />
          <span>RAB Verified</span>
        </div>

        <div style={{ color: "rgba(255, 255, 255, 0.3)" }}>
          <span>UTF-8</span>
        </div>
      </div>
    </footer>
  );
};
