import React from 'react';
import {
  Droplets,
  Wind,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Compass,
  ArrowRight,
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
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
        }}>
          MODULE 2
        </span>
        <h2 style={{ fontSize: '1.4rem' }}>
          {isRw ? 'Umujyanama w\'Imyanzuro y\'Ubuhinzi (Decision Fusion)' : 'Agronomic Decision Fusion Engine'}
        </h2>
      </div>
      <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>
        {isRw
          ? 'Guhuza ibyavuye mu isuzuma ry\'indwara + Iteganyagihe + Uko ibihingwa bikuze + Ubutaka bwawe.'
          : 'Synthesizing Vision diagnosis + Live microclimate + Phenological growth stage + Rwanda agro-ecological zone.'}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* Card A: Irrigation Prescription */}
        <div style={{
          background: advice.irrigationAdvice.action === 'DO_NOT_IRRIGATE'
            ? 'rgba(239, 68, 68, 0.08)'
            : 'rgba(16, 185, 129, 0.08)',
          border: `1px solid ${advice.irrigationAdvice.action === 'DO_NOT_IRRIGATE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Droplets size={18} color={advice.irrigationAdvice.action === 'DO_NOT_IRRIGATE' ? '#f87171' : '#34d399'} />
            <h4 style={{ fontSize: '1rem', color: '#fff' }}>
              {isRw ? 'Imyanzuro yo Kuhira (Irrigation)' : "Today's Irrigation Protocol"}
            </h4>
          </div>

          <div style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: advice.irrigationAdvice.action === 'DO_NOT_IRRIGATE' ? '#f87171' : '#34d399',
            marginBottom: 8,
          }}>
            {isRw ? advice.irrigationAdvice.headlineRw : advice.irrigationAdvice.headline}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {advice.irrigationAdvice.reason}
          </p>

          <div style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--text-muted)',
          }}>
            <span>Soil Moisture: <strong>{weather.soilMoisturePercentage}%</strong></span>
            <span>24h Rain: <strong>{weather.expectedRainfallMm} mm</strong></span>
          </div>
        </div>

        {/* Card B: Spray & Fungicide Window */}
        <div style={{
          background: !advice.sprayAdvice.isSafeToSpray
            ? 'rgba(245, 158, 11, 0.08)'
            : 'rgba(16, 185, 129, 0.08)',
          border: `1px solid ${!advice.sprayAdvice.isSafeToSpray ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Wind size={18} color={!advice.sprayAdvice.isSafeToSpray ? '#fbbf24' : '#34d399'} />
            <h4 style={{ fontSize: '1rem', color: '#fff' }}>
              {isRw ? 'Igihe cyo Gutera Umuti (Spray Window)' : 'Fungicide & Pesticide Window'}
            </h4>
          </div>

          <div style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: !advice.sprayAdvice.isSafeToSpray ? '#fbbf24' : '#34d399',
            marginBottom: 8,
          }}>
            {isRw ? advice.sprayAdvice.headlineRw : advice.sprayAdvice.headline}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {advice.sprayAdvice.explanation}
          </p>

          <div style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--accent-gold)',
          }}>
            <Clock size={13} />
            <span>Optimal Window: <strong>{advice.sprayAdvice.bestWindow}</strong></span>
          </div>
        </div>

        {/* Card C: Drainage & Field Hygiene Warning */}
        <div style={{
          background: advice.drainageWarning ? 'rgba(239, 68, 68, 0.12)' : 'rgba(0, 0, 0, 0.3)',
          border: `1px solid ${advice.drainageWarning ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertOctagon size={18} color={advice.drainageWarning ? '#ef4444' : '#10b981'} />
            <h4 style={{ fontSize: '1rem', color: '#fff' }}>
              {isRw ? 'Ubugenzuzi bw\'Umurima (Drainage & Hygiene)' : 'Field Drainage & Sanitation'}
            </h4>
          </div>

          <div style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: advice.drainageWarning ? '#f87171' : '#34d399',
            marginBottom: 8,
          }}>
            {advice.drainageWarning
              ? (isRw ? 'Icyago cy\'Amazi Adasohoka!' : 'High Stagnant Water Risk!')
              : (isRw ? 'Imirongo y\'amazi imeze neza' : 'Drainage Conditions Normal')}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {advice.drainageWarning
              ? (isRw
                  ? 'Imvura ikomeye ishobora gutuma amazi yidika mu murima wawe, bigateza kubora kw\'imizi no gukura kw\'ibihumyo (fungi). Sukura imiferege y\'amazi ubu!'
                  : 'Expected heavy downpour threatens waterlogging. Clear perimeter drainage trenches to avoid root rot and collar rot.')
              : (isRw
                  ? 'Ihindagurika ry\'amazi riragenzurika. Komeza isuku y\'umurima no gukura ibyatsi bibisi bibangamira umusaruro.'
                  : 'Maintain grass mulching around beds to shield topsoil from erosion.')}
          </p>

          <div style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}>
            Soil Type: <strong>{farm.soilType}</strong> • Altitude: <strong>{farm.altitudeMeters}m</strong>
          </div>
        </div>
      </div>

      {/* Comprehensive Fused Summary Note */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        padding: '14px 18px',
        borderRadius: 'var(--radius-sm)',
        borderLeft: '4px solid var(--primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <Sparkles size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.88rem', color: '#f3f4f6' }}>
          {isRw ? advice.agronomicSummaryRw : advice.agronomicSummary}
        </div>
      </div>
    </div>
  );
};
