import React from 'react';
import {
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  Calendar,
  Layers,
  Sprout,
  ShieldAlert,
} from 'lucide-react';
import { DecisionFusionAdvice, FarmProfile, Language, WeatherData } from '../types';

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
  const isRw = language === 'rw';

  return (
    <div className="glass-panel-elevated" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        alignItems: 'center',
      }}>
        {/* Left Column: Farm Profile & Growth Status */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-risk-low" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Sprout size={13} />
              {isRw ? 'Umurima Wanjye' : 'Active Field'} • {farm.district}, {farm.sector}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {farm.altitudeMeters}m alt
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', marginBottom: 6, fontWeight: 800 }}>
            {farm.crop} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1.2rem' }}>({farm.variety})</span>
          </h1>

          <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>
            {isRw ? 'Umuhinzi' : 'Farmer'}: <strong style={{ color: '#fff' }}>{farm.farmerName}</strong> • {farm.fieldSizeHectares} ha • {farm.soilType} Soil
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <Calendar size={14} color="var(--primary)" />
              <span>{isRw ? 'Iminsi itewe' : 'Planted'}: 45 {isRw ? 'iminsi' : 'days ago'}</span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <Layers size={14} color="var(--accent-gold)" />
              <span>{farm.growthStage}</span>
            </div>

            <button
              onClick={onScanLeafClick}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 16px', gap: 6 }}
            >
              <Sprout size={14} />
              <span>{isRw ? 'Gusuzuma Ibibabi (AI Scan)' : 'Scan Crop Leaf'}</span>
            </button>
          </div>
        </div>

        {/* Center Column: Hyperlocal Agro-Weather */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudRain size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                {isRw ? 'Iteganyagihe ry\'Ubuhinzi' : 'Hyperlocal Agro-Weather'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Open-Meteo Live API
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isRw ? 'Ubushyuhe' : 'Temp'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {weather.tempCelsius}°C
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isRw ? 'Ubuhehere' : 'Humidity'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                {weather.humidityPercentage}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isRw ? 'Amahirwe y\'Imvura' : 'Rain Prob'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: weather.rainChance24h > 50 ? '#f87171' : '#34d399' }}>
                {weather.rainChance24h}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isRw ? 'Ubuhehere bw\'Ubutaka' : 'Soil Moist.'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a7f3d0' }}>
                {weather.soilMoisturePercentage}%
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Droplets size={14} color="var(--primary)" />
            <span>{weather.forecastSummary}</span>
          </div>
        </div>

        {/* Right Column: AI Disease Risk & Daily Decision */}
        <div style={{
          background: advice.riskLevel === 'high' || advice.riskLevel === 'critical'
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(153, 27, 27, 0.25) 100%)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.15) 100%)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${advice.riskLevel === 'high' || advice.riskLevel === 'critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              {isRw ? 'Ibyago by\'Indwara (Spore Risk)' : 'Disease Spore Pressure'}
            </span>
            <span className={`badge badge-risk-${advice.riskLevel}`}>
              <AlertTriangle size={13} />
              {advice.riskLevel.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {weather.sporeGerminationIndex}%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {isRw ? 'Ubuhehere ku mababi' : 'Leaf wetness'}: ~{weather.leafWetnessHours}h
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <ShieldAlert size={16} color={advice.riskLevel === 'high' ? '#f87171' : '#fbbf24'} />
            <span>{isRw ? advice.irrigationAdvice.headlineRw : advice.irrigationAdvice.headline}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
