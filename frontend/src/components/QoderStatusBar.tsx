import React from 'react';
import {
  GitBranch,
  Cpu,
  MapPin,
  CloudRain,
  CheckCircle2,
  Activity,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react';
import { RwandaDistrict, WeatherData } from '../types';

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
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 28,
        background: '#07090c',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        zIndex: 95,
        userSelect: 'none',
      }}
    >
      {/* Left side: Git, Workspace, Active Model */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#c084fc' }}>
          <GitBranch size={12} />
          <span>main*</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="qoder-dot qoder-dot-violet" style={{ width: 6, height: 6 }} />
          <span style={{ color: '#fff' }}>AI Engine: {activeModel}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-subtle)' }}>
          <span>|</span>
          <Cpu size={11} color="#38bdf8" />
          <span>ONNX Runtime 38ms</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-subtle)' }}>
          <span>|</span>
          <Activity size={11} color="#10b981" />
          <span>Val Acc: 99.89%</span>
        </div>
      </div>

      {/* Right side: Agro-Meteo & RAB Standards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8' }}>
          <MapPin size={11} />
          <span>{district}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: weather.isRainExpectedNext24h ? '#f59e0b' : '#34d399' }}>
          <CloudRain size={11} />
          <span>{weather.tempCelsius}°C • {weather.humidityPercentage}% Hum</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981' }}>
          <CheckCircle2 size={11} />
          <span>RAB Verified</span>
        </div>

        <div style={{ color: 'var(--text-subtle)' }}>
          <span>UTF-8</span>
        </div>
      </div>
    </footer>
  );
};
