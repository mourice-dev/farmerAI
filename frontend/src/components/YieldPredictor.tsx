import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Sprout,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { CropType, FarmProfile, Language } from '../types';

interface YieldPredictorProps {
  farm: FarmProfile;
  language: Language;
}

export const YieldPredictor: React.FC<YieldPredictorProps> = ({ farm, language }) => {
  const isRw = language === 'rw';

  const [fieldArea, setFieldArea] = useState<number>(farm.fieldSizeHectares);
  const [selectedCrop, setSelectedCrop] = useState<CropType>(farm.crop);
  const [fertilizerLevel, setFertilizerLevel] = useState<'optimal' | 'moderate' | 'minimal'>('optimal');
  const [irrigation, setIrrigation] = useState<'drip' | 'rain-fed' | 'manual'>('manual');
  const [diseaseDamagePenalty, setDiseaseDamagePenalty] = useState<number>(10); // 10% penalty

  // Baseline yields in Rwanda (kg per hectare) under optimal conditions
  const baselineYieldsKgHa: Record<CropType, { min: number; max: number; avgPriceRwf: number }> = {
    Tomatoes: { min: 25000, max: 35000, avgPriceRwf: 880 },
    'Irish Potatoes': { min: 18000, max: 26000, avgPriceRwf: 500 },
    Maize: { min: 4500, max: 7000, avgPriceRwf: 460 },
    'Climbing Beans': { min: 2500, max: 4000, avgPriceRwf: 1100 },
    Cassava: { min: 15000, max: 28000, avgPriceRwf: 380 },
    Coffee: { min: 3000, max: 5500, avgPriceRwf: 2200 },
  };

  const cropData = baselineYieldsKgHa[selectedCrop];

  // Modifiers
  let fertilityMod = fertilizerLevel === 'optimal' ? 1.0 : fertilizerLevel === 'moderate' ? 0.8 : 0.6;
  let irrigationMod = irrigation === 'drip' ? 1.15 : irrigation === 'manual' ? 0.95 : 0.85;
  let healthMod = 1 - diseaseDamagePenalty / 100;

  const totalMod = fertilityMod * irrigationMod * healthMod;

  const estimatedMinKg = Math.round(cropData.min * fieldArea * totalMod);
  const estimatedMaxKg = Math.round(cropData.max * fieldArea * totalMod);
  const estimatedRevenueMinRwf = Math.round(estimatedMinKg * cropData.avgPriceRwf);
  const estimatedRevenueMaxRwf = Math.round(estimatedMaxKg * cropData.avgPriceRwf);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
        }}>
          MODULE 6
        </span>
        <h2 style={{ fontSize: '1.4rem' }}>
          {isRw ? 'Iteganyamururo n\'Icyitegererezo cy\'Amafaranga (Yield & Revenue AI)' : 'AI Crop Yield & Revenue Forecaster'}
        </h2>
      </div>
      <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>
        {isRw
          ? 'Kubara umusaruro ugereranyije ukurikije ubuso bw\'umurima, uburyo bwo kuhira, ifumbire, n\'ubuzima bw\'ibihingwa.'
          : 'Multi-variable yield estimation combining acreage, agronomic inputs, phenology, and pathology dampening factors.'}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
      }}>
        {/* Left Inputs */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 14 }}>
            {isRw ? 'Ibyinjizwa mu Iteganyamururo' : 'Model Simulation Inputs'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Crop</label>
              <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value as CropType)}>
                <option value="Tomatoes">Tomatoes (Inyanya)</option>
                <option value="Irish Potatoes">Irish Potatoes (Ibirayi)</option>
                <option value="Maize">Maize (Ibigori)</option>
                <option value="Climbing Beans">Climbing Beans (Ibishyimbo)</option>
                <option value="Cassava">Cassava (Imyumbati)</option>
                <option value="Coffee">Coffee (Ikawa)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                Field Area: <strong>{fieldArea} ha</strong> ({Math.round(fieldArea * 100)} are)
              </label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.05"
                value={fieldArea}
                onChange={(e) => setFieldArea(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Fertilizer Regime</label>
                <select value={fertilizerLevel} onChange={(e) => setFertilizerLevel(e.target.value as any)}>
                  <option value="optimal">Optimal (DAP + Urea)</option>
                  <option value="moderate">Moderate (Standard)</option>
                  <option value="minimal">Minimal (Low)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Water Management</label>
                <select value={irrigation} onChange={(e) => setIrrigation(e.target.value as any)}>
                  <option value="drip">Drip Irrigation (+15%)</option>
                  <option value="manual">Manual Watering</option>
                  <option value="rain-fed">Rain-fed Only</option>
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Disease Pressure Loss: <strong>-{diseaseDamagePenalty}%</strong>
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>Early Blight Impact</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={diseaseDamagePenalty}
                onChange={(e) => setDiseaseDamagePenalty(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>
          </div>
        </div>

        {/* Right Outputs */}
        <div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.25) 100%)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-md)',
            padding: 22,
            marginBottom: 16,
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isRw ? 'Umusaruro Uteganyijwe (Yield Range)' : 'Forecasted Yield Range'}
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '4px 0 8px 0' }}>
              {estimatedMinKg.toLocaleString()} – {estimatedMaxKg.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#a7f3d0' }}>kg</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ({Math.round((estimatedMinKg / fieldArea) / 1000 * 10) / 10} – {Math.round((estimatedMaxKg / fieldArea) / 1000 * 10) / 10} tons per hectare)
            </div>

            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isRw ? 'Amafaranga Ateganyijwe (Gross Revenue)' : 'Estimated Market Gross Revenue'}
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: 2 }}>
                {estimatedRevenueMinRwf.toLocaleString()} – {estimatedRevenueMaxRwf.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fef3c7' }}>RWF</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Calculated at current Kimironko/Nyabugogo wholesale price (~{cropData.avgPriceRwf} RWF/kg)
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>
              {isRw
                ? 'Ibi bipimo ni igereranya rishingiye ku bihe bisanzwe by\'u Rwanda. Imvura nyinshi cyangwa izuba rikabije bishobora guhindura umusaruro.'
                : 'Estimates provided for planning purposes. Local agronomic extension advice should be consulted before major farm financial commitments.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
