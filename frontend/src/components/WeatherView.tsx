import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Droplets, MapPin, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { getWeather, WeatherData } from '../services/apiService';

interface WeatherViewProps {
  currentDistrict: string;
  onSelectDistrict: (district: string) => void;
  onAskChatWithWeather: (weatherSummary: string) => void;
}

const RWANDA_DISTRICTS = [
  'Musanze',
  'Huye',
  'Kigali',
  'Rubavu',
  'Nyagatare',
  'Muhanga',
  'Rusizi',
  'Karongi',
  'Ngoma',
  'Kayonza'
];

export const WeatherView: React.FC<WeatherViewProps> = ({
  currentDistrict,
  onSelectDistrict,
  onAskChatWithWeather
}) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistrictWeather(currentDistrict);
  }, [currentDistrict]);

  const fetchDistrictWeather = async (district: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const wx = await getWeather(district);
      setData(wx);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute fungal/blight risk based on humidity and 24h rain
  const computeRisk = (humidity: number, rain24h: number) => {
    if (humidity >= 75 && rain24h >= 2.0) {
      return {
        level: 'HIGH',
        color: '#f87171',
        bg: 'rgba(239, 68, 68, 0.15)',
        text: 'High Fungal Spore & Blight Spread Risk. Cool, wet leaves foster rapid pathogen germination.'
      };
    }
    if (humidity >= 60 || rain24h > 0) {
      return {
        level: 'MODERATE',
        color: '#facc15',
        bg: 'rgba(234, 179, 8, 0.15)',
        text: 'Moderate Disease Risk. Monitor lower leaves and apply preventive organic fungicides.'
      };
    }
    return {
      level: 'LOW',
      color: '#34d399',
      bg: 'rgba(16, 163, 127, 0.15)',
      text: 'Low Blight Risk. Dry weather inhibits fungal spread; ensure adequate drip irrigation.'
    };
  };

  const risk = data ? computeRisk(data.humidity_percent, data.precipitation_mm_next_24h) : null;

  return (
    <div className="secondary-tool-view" style={{ overflowY: 'auto', height: '100%', paddingBottom: '60px' }}>
      <div className="tool-header-card">
        <h2>Rwanda Agro-Meteorological Radar</h2>
        <p>Live district weather from Open-Meteo analyzed for crop disease spread and optimal spraying windows.</p>
      </div>

      {/* District Pill Selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {RWANDA_DISTRICTS.map(district => (
          <button
            key={district}
            onClick={() => onSelectDistrict(district)}
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              border: district === currentDistrict ? '1px solid #10a37f' : '1px solid rgba(255, 255, 255, 0.1)',
              background: district === currentDistrict ? 'rgba(16, 163, 127, 0.18)' : '#282828',
              color: district === currentDistrict ? '#fff' : '#b4b4b4',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
          >
            📍 {district}
          </button>
        ))}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px' }}>
          <Loader2 size={24} className="animate-spin" color="#10a37f" />
          <span style={{ fontSize: '14px', color: '#b4b4b4' }}>Fetching live satellite data for {currentDistrict}...</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '14px',
          color: '#f87171',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {data && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Weather Card */}
          <div style={{
            background: '#282828',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#8e8e8e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> District Coordinates: {data.latitude}, {data.longitude}
                </span>
                <h3 style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                  {data.temperature_c}°C
                </h3>
                <span style={{ fontSize: '15px', color: '#b4b4b4' }}>{data.weather_description}</span>
              </div>

              {risk && (
                <div style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: risk.bg,
                  border: `1px solid ${risk.color}40`,
                  textAlign: 'right'
                }}>
                  <span style={{ fontSize: '11px', color: '#8e8e8e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Fungal Infection Risk
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: risk.color }}>
                    {risk.level}
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginTop: '22px'
            }}>
              <div style={{ background: '#303030', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8e8e8e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Droplets size={14} color="#60a5fa" /> Humidity
                </span>
                <strong style={{ fontSize: '18px', color: '#fff', marginTop: '4px', display: 'block' }}>
                  {data.humidity_percent}%
                </strong>
              </div>

              <div style={{ background: '#303030', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8e8e8e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CloudRain size={14} color="#34d399" /> Current Precip
                </span>
                <strong style={{ fontSize: '18px', color: '#fff', marginTop: '4px', display: 'block' }}>
                  {data.precipitation_mm_now} mm
                </strong>
              </div>

              <div style={{ background: '#303030', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8e8e8e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CloudRain size={14} color="#a78bfa" /> 24h Rain Forecast
                </span>
                <strong style={{ fontSize: '18px', color: '#fff', marginTop: '4px', display: 'block' }}>
                  ~{data.precipitation_mm_next_24h} mm
                </strong>
              </div>
            </div>

            {/* Agronomic Risk Summary */}
            {risk && (
              <div style={{
                marginTop: '18px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#1f1f1f',
                fontSize: '13px',
                color: '#b4b4b4',
                lineHeight: 1.5
              }}>
                <strong style={{ color: '#fff' }}>Agronomic Impact: </strong>{risk.text}
              </div>
            )}

            {/* Action button */}
            <button
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                background: '#10a37f',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={() => onAskChatWithWeather(data.summary)}
            >
              <span>Ask AI Advisor for spraying & field advice in {currentDistrict}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
