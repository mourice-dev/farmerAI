/** @format */

import React from 'react';
import {
  Droplets,
  Wind,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DecisionFusionAdvice, FarmProfile, Language, WeatherData } from '../types';

interface AgronomicAdvisorCardProps {
  advice: DecisionFusionAdvice;
  weather: WeatherData;
  farm: FarmProfile;
  language: Language;
}

export const AgronomicAdvisorCard: React.FC<AgronomicAdvisorCardProps> = ({
  advice,
  weather,
  farm,
  language,
}) => {
  const isRw = language === 'rw';

  return (
    <div
      style={{
        padding: '28px',
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 16,
        fontFamily: 'var(--font-family-aeonik)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          fontSize: '0.72rem',
          fontWeight: 500,
          padding: '2px 10px',
          borderRadius: 100,
          fontFamily: 'var(--font-family-mono)',
          letterSpacing: '0.04em',
        }}>
          DECISION FUSION
        </span>
        <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 500, letterSpacing: '-0.03em' }}>
          {isRw ? 'Umujyanama w\'Imyanzuro y\'Ubuhinzi (Decision Fusion)' : 'Autonomous Decision Fusion Engine'}
        </h2>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: 24 }}>
        {isRw
          ? 'Guhuza ibyavuye mu isuzuma ry\'indwara + Iteganyagihe + Uko ibihingwa bikuze + Ubutaka bwawe.'
          : 'Synthesizing Vision diagnosis + Live atmospheric microclimate + Phenological growth stage + Rwanda agro-ecological zone.'}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* Card A: Irrigation Prescription */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: 12,
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Droplets size={16} />
            </div>
            <h4 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 500 }}>
              {isRw ? 'Imyanzuro yo Kuhira (Irrigation)' : "Today's Irrigation Protocol"}
            </h4>
          </div>

          <div
            style={{
              fontSize: '1.15rem',
              color: '#ffffff',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            {isRw ? advice.irrigationAdvice.headlineRw : advice.irrigationAdvice.headline}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
            {advice.irrigationAdvice.reason}
          </p>

          <div style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            display: 'flex',
            justifyContent: 'space-between',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--font-family-mono)',
          }}>
            <span>Soil Moisture: <strong style={{ color: '#ffffff' }}>{weather.soilMoisturePercentage}%</strong></span>
            <span>24h Rain: <strong style={{ color: '#ffffff' }}>{weather.expectedRainfallMm} mm</strong></span>
          </div>
        </div>

        {/* Card B: Spray & Fungicide Window */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: 12,
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Wind size={16} />
            </div>
            <h4 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 500 }}>
              {isRw ? 'Igihe cyo Gutera Umuti (Spray Window)' : 'Fungicide & Spray Window'}
            </h4>
          </div>

          <div
            style={{
              fontSize: '1.15rem',
              color: '#ffffff',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            {isRw ? advice.sprayAdvice.headlineRw : advice.sprayAdvice.headline}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
            {advice.sprayAdvice.explanation}
          </p>

          <div style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#ffffff',
            fontFamily: 'var(--font-family-mono)',
          }}>
            <Clock size={13} color="#ffffff" />
            <span>Window: <strong>{advice.sprayAdvice.bestWindow}</strong></span>
          </div>
        </div>

        {/* Card C: Drainage & Field Sanitation */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: 12,
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <ShieldCheck size={16} />
            </div>
            <h4 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 500 }}>
              {isRw ? 'Ubugenzuzi bw\'Umurima (Drainage & Hygiene)' : 'Field Drainage & Sanitation'}
            </h4>
          </div>

          <div
            style={{
              fontSize: '1.15rem',
              color: '#ffffff',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            {advice.drainageWarning
              ? (isRw ? 'Icyago cy\'Amazi Adasohoka!' : 'High Stagnant Water Risk!')
              : (isRw ? 'Imirongo y\'amazi imeze neza' : 'Drainage Conditions Normal')}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
            {advice.drainageWarning
              ? (isRw
                  ? 'Imvura ikomeye ishobora gutuma amazi yidika mu murima wawe, bigateza kubora kw\'imizi no gukura kw\'ibihumyo (fungi). Sukura imiferege y\'amazi ubu!'
                  : 'Expected heavy downpour threatens waterlogging. Clear perimeter drainage trenches to avoid root rot and collar rot.')
              : (isRw
                  ? 'Ihindagurika ry\'amazi riragenzurika. Komeza isuku y\'umurima no gukura ibyatsi bibisi bibangamira umusaruro.'
                  : 'Maintain grass mulching around beds to shield topsoil from erosion.')}
          </p>

          <div style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--font-family-mono)',
          }}>
            Soil Type: <strong style={{ color: '#ffffff' }}>{farm.soilType}</strong> • Altitude: <strong style={{ color: '#ffffff' }}>{farm.altitudeMeters}m</strong>
          </div>
        </div>
      </div>

      {/* Comprehensive Fused Summary Note */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '16px 20px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <Sparkles size={18} color="#ffffff" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
          {isRw ? advice.agronomicSummaryRw : advice.agronomicSummary}
        </div>
      </div>
    </div>
  );
};
