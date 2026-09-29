import React, { useState } from 'react';
import {
  FlaskConical,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calculator,
  RotateCcw,
} from 'lucide-react';
import { FarmProfile, Language, RwandaDistrict } from '../types';

interface SoilAdvisorProps {
  farm: FarmProfile;
  language: Language;
}

export const SoilAdvisor: React.FC<SoilAdvisorProps> = ({ farm, language }) => {
  const isRw = language === 'rw';

  // Soil parameters
  const [pH, setPH] = useState<number>(5.2);
  const [nitrogen, setNitrogen] = useState<number>(18); // Low-Med (mg/kg)
  const [phosphorus, setPhosphorus] = useState<number>(12); // Low (mg/kg)
  const [potassium, setPotassium] = useState<number>(185); // High (mg/kg)
  const [organicMatter, setOrganicMatter] = useState<number>(2.4); // %

  // Presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'acidic-muhanga') {
      setPH(5.1);
      setNitrogen(16);
      setPhosphorus(11);
      setPotassium(140);
      setOrganicMatter(2.1);
    } else if (presetName === 'volcanic-musanze') {
      setPH(5.7);
      setNitrogen(32);
      setPhosphorus(18);
      setPotassium(220);
      setOrganicMatter(4.5);
    } else if (presetName === 'nyagatare-savannah') {
      setPH(6.4);
      setNitrogen(24);
      setPhosphorus(22);
      setPotassium(190);
      setOrganicMatter(3.2);
    }
  };

  // Calculations based on MINAGRI / RAB Soil Health Guidelines
  // If pH < 5.5, soil is strongly acidic; requires Agricultural Lime (Travertine)
  const limeRequiredKgHa = pH < 5.5 ? Math.round((5.8 - pH) * 2200) : 0;
  
  // Basal DAP / NPK calculation
  const dapKgHa = phosphorus < 15 ? 100 : phosphorus < 25 ? 75 : 50;
  const npkKgHa = 150;
  
  // Top dressing Urea calculation
  const ureaKgHa = nitrogen < 20 ? 80 : nitrogen < 35 ? 60 : 40;

  // Convert to farmer's field size
  const fieldLime = Math.round(limeRequiredKgHa * farm.fieldSizeHectares);
  const fieldDap = Math.round(dapKgHa * farm.fieldSizeHectares);
  const fieldUrea = Math.round(ureaKgHa * farm.fieldSizeHectares);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              MODULE 4
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>
              {isRw ? 'Umujyanama mu Bumenyi bw\'Ubutaka (RAB Soil Advisor)' : 'AI Soil Intelligence & RAB Fertilizer Calculator'}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {isRw
              ? 'Isuzuma ry\'ubusharire (pH) n\'imyunyu ngugu y\'ubutaka (N-P-K) n\'ifumbire ikwiye umurima wawe.'
              : 'Precision macronutrient analysis and Rwanda Agricultural Board (RAB) lime and fertilizer prescriptions.'}
          </p>
        </div>

        {/* Quick Regional Presets */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => applyPreset('acidic-muhanga')}
            className="btn btn-secondary btn-sm"
          >
            Muhanga (Acidic Ferralsol)
          </button>
          <button
            onClick={() => applyPreset('volcanic-musanze')}
            className="btn btn-secondary btn-sm"
          >
            Musanze (Volcanic Rich)
          </button>
          <button
            onClick={() => applyPreset('nyagatare-savannah')}
            className="btn btn-secondary btn-sm"
          >
            Nyagatare (Savannah Loam)
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
      }}>
        {/* Left: Interactive Soil Sliders */}
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16, color: '#fff' }}>
            {isRw ? 'Injiza Ibipimo by\'Ubutaka (Soil Test Inputs)' : 'Soil Lab Test Parameters'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* pH Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Soil pH: <strong style={{ color: pH < 5.5 ? '#ffffff' : '#ffffff' }}>{pH.toFixed(1)}</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: pH < 5.5 ? '#ffffff' : 'var(--text-muted)' }}>
                  {pH < 5.2 ? 'Strongly Acidic (Gusharira cyane)' : pH < 5.8 ? 'Moderately Acidic' : 'Optimal (6.0 - 7.0)'}
                </span>
              </div>
              <input
                type="range"
                min="4.2"
                max="8.0"
                step="0.1"
                value={pH}
                onChange={(e) => setPH(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: pH < 5.5 ? '#ffffff' : '#ffffff' }}
              />
            </div>

            {/* Nitrogen (N) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Nitrogen (N): <strong style={{ color: '#ffffff' }}>{nitrogen} mg/kg</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {nitrogen < 20 ? 'Low (Gicye)' : nitrogen < 40 ? 'Medium' : 'High'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={nitrogen}
                onChange={(e) => setNitrogen(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ffffff' }}
              />
            </div>

            {/* Phosphorus (P) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Phosphorus (P): <strong style={{ color: '#ffffff' }}>{phosphorus} mg/kg</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {phosphorus < 15 ? 'Deficient (Bikabije)' : phosphorus < 30 ? 'Adequate' : 'Rich'}
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                value={phosphorus}
                onChange={(e) => setPhosphorus(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ffffff' }}
              />
            </div>

            {/* Potassium (K) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Potassium (K): <strong style={{ color: '#ffffff' }}>{potassium} mg/kg</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {potassium < 100 ? 'Low' : 'Optimal'}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="350"
                value={potassium}
                onChange={(e) => setPotassium(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ffffff' }}
              />
            </div>

            {/* Organic Matter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Organic Matter: <strong style={{ color: '#ffffff' }}>{organicMatter.toFixed(1)}%</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {organicMatter < 3.0 ? 'Needs Compost / Manure' : 'Healthy Organic Layer'}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.1"
                value={organicMatter}
                onChange={(e) => setOrganicMatter(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ffffff' }}
              />
            </div>
          </div>
        </div>

        {/* Right: Calculated RAB Prescription for this specific farmer's plot */}
        <div>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>
                {isRw ? 'Urugereko rw\'Ifumbire kuri Ha ' : 'Prescription for '}{farm.fieldSizeHectares} ha ({farm.crop})
              </h3>
              <span className="badge badge-risk-low">RAB Certified Formula</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {/* Agricultural Lime */}
              <div style={{
                background: limeRequiredKgHa > 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                padding: '12px',
                borderRadius: 8,
                textAlign: 'center',
                border: `1px solid ${limeRequiredKgHa > 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isRw ? 'Ingwa / Chaux (Lime)' : 'Agri-Lime (Travertine)'}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: limeRequiredKgHa > 0 ? '#ffffff' : '#ffffff' }}>
                  {fieldLime} kg
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {limeRequiredKgHa > 0 ? 'To correct pH' : 'Not needed'}
                </div>
              </div>

              {/* Basal DAP / NPK */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '12px',
                borderRadius: 8,
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isRw ? 'DAP / NPK (Itangiriro)' : 'Basal DAP / NPK'}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  {fieldDap} kg
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  At planting ridge
                </div>
              </div>

              {/* Top-Dressing Urea */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '12px',
                borderRadius: 8,
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isRw ? 'Urea (Gufumbira hejuru)' : 'Top-Dress Urea'}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  {fieldUrea} kg
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Split into 2 applications
                </div>
              </div>
            </div>

            {/* Application Instructions */}
            <div style={{ fontSize: '0.85rem', color: '#f3f4f6', lineHeight: 1.6 }}>
              {pH < 5.5 ? (
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '10px 12px', borderRadius: 6, marginBottom: 8 }}>
                  ⚠️ <strong>{isRw ? 'Ubutaka bwawe burasharira (pH ' + pH.toFixed(1) + '):' : 'Soil Acidity Alert (pH ' + pH.toFixed(1) + '):'}</strong>{' '}
                  {isRw
                    ? `Shyiramo ibiro ${fieldLime} by'ingwa y'ifu (Agricultural Lime) ibyumweru 2 mbere yo gutera, maze uyingingize mu butaka kugira ngo ifumbire ya DAP n'ifumbire mvaruganda biticwa n'ubusharire.`
                    : `Apply ${fieldLime} kg of agricultural travertine (lime) 2 weeks before planting. Strongly acidic soils tie up phosphorus and hinder root uptake.`}
                </div>
              ) : null}

              <div style={{ color: 'var(--text-muted)' }}>
                🌱 <strong>{isRw ? 'Ibihingwa bibereye ubu butaka' : 'Optimal Crops for this Soil'}:</strong>{' '}
                {pH < 5.6
                  ? 'Irish Potatoes (Kinigi/Victoria), Sweet Potatoes, Tea, Cassava'
                  : 'Tomatoes (Anna F1), Climbing Beans (RWV), Hybrid Maize, Vegetables'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
