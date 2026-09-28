import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  Radio,
  PlusCircle,
  Filter,
  Users,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { Language, OutbreakAlert, RwandaDistrict, CropType } from '../types';

interface SurveillanceMapProps {
  outbreaks: OutbreakAlert[];
  currentDistrict: RwandaDistrict;
  language: Language;
  onSelectDistrict: (district: RwandaDistrict) => void;
  onReportOutbreak: (newOutbreak: OutbreakAlert) => void;
}

export const SurveillanceMap: React.FC<SurveillanceMapProps> = ({
  outbreaks,
  currentDistrict,
  language,
  onSelectDistrict,
  onReportOutbreak,
}) => {
  const isRw = language === 'rw';

  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('ALL');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportDistrict, setReportDistrict] = useState<RwandaDistrict>(currentDistrict);
  const [reportCrop, setReportCrop] = useState<CropType>('Tomatoes');
  const [reportDisease, setReportDisease] = useState<string>('Early Blight (Alternaria solani)');
  const [reportSeverity, setReportSeverity] = useState<'high' | 'moderate' | 'critical'>('high');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportedSuccess, setReportedSuccess] = useState<boolean>(false);

  const filteredOutbreaks = outbreaks.filter((o) => {
    if (selectedCropFilter === 'ALL') return true;
    return o.crop === selectedCropFilter;
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: OutbreakAlert = {
      id: `outbreak-${Date.now()}`,
      district: reportDistrict,
      coordinates: [-2.0, 29.8], // Central approx
      crop: reportCrop,
      diseaseOrPest: reportDisease,
      severity: reportSeverity,
      reportedCasesCount: 1,
      lastReportedHoursAgo: 0,
      radiusKm: 15,
      advisoryNote: reportNotes || `Verified community sighting reported by farmer/agronomist in ${reportDistrict}.`,
    };

    onReportOutbreak(newAlert);
    setReportedSuccess(true);
    setTimeout(() => {
      setReportedSuccess(false);
      setShowReportModal(false);
      setReportNotes('');
    }, 1500);
  };

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
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              MODULE 3
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>
              {isRw ? 'Ikarita yo Gukurikirana Ibyago by\'Indwara mu Rwanda' : 'Rwanda Outbreak Surveillance Radar'}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {isRw
              ? 'Isuzuma ry\'imiyoboro y\'indwara n\'ibyonnyi byatanzwe n\'abahinzi mu turere 30 tw\'u Rwanda.'
              : 'Epidemiological cluster surveillance tracking disease spread across Rwanda districts with perimeter alert radii.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Crop Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedCropFilter}
              onChange={(e) => setSelectedCropFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.82rem', padding: 0, width: 'auto' }}
            >
              <option value="ALL" style={{ background: '#111a16' }}>All Crops</option>
              <option value="Tomatoes" style={{ background: '#111a16' }}>Tomatoes</option>
              <option value="Irish Potatoes" style={{ background: '#111a16' }}>Irish Potatoes</option>
              <option value="Maize" style={{ background: '#111a16' }}>Maize</option>
              <option value="Cassava" style={{ background: '#111a16' }}>Cassava</option>
              <option value="Coffee" style={{ background: '#111a16' }}>Coffee</option>
            </select>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-danger btn-sm"
            style={{ gap: 6 }}
          >
            <PlusCircle size={14} />
            <span>{isRw ? 'Tanga Raporo y\'Icyorezo' : 'Report Outbreak Sighting'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Map Visualizer on Left & Outbreak Cards on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
      }}>
        {/* Interactive Stylized Rwanda Outbreak Vector Map */}
        <div style={{
          background: '#090e0c',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          minHeight: 340,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <Radio size={14} color="#ef4444" className="pulse-icon" />
              <span>Live Perimeter Radar (15km radius)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 999 }}>
              {filteredOutbreaks.length} Active Hotspots
            </span>
          </div>

          {/* Rwanda District Node Representation */}
          <div style={{
            position: 'relative',
            height: 250,
            width: '100%',
            background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}>
            {/* Compass rose */}
            <div style={{ position: 'absolute', top: 8, right: 10, opacity: 0.4, fontSize: '0.7rem' }}>
              ▲ North (Musanze)
            </div>

            {/* District Hotspot Pins */}
            {filteredOutbreaks.map((outbreak) => {
              const isSelected = outbreak.district === currentDistrict;
              // Positioning mapped relative to Rwanda geography
              const positions: Record<string, { top: string; left: string }> = {
                Musanze: { top: '15%', left: '38%' },
                Nyabihu: { top: '25%', left: '26%' },
                Rubavu: { top: '30%', left: '15%' },
                Muhanga: { top: '48%', left: '42%' },
                Ruhango: { top: '62%', left: '45%' },
                Huye: { top: '78%', left: '40%' },
                Nyamagabe: { top: '72%', left: '28%' },
                Nyagatare: { top: '16%', left: '78%' },
                Bugesera: { top: '65%', left: '65%' },
                Kicukiro: { top: '45%', left: '60%' },
              };

              const pos = positions[outbreak.district] || { top: '50%', left: '50%' };
              const color = outbreak.severity === 'critical' ? '#ef4444' : outbreak.severity === 'high' ? '#f97316' : '#fbbf24';

              return (
                <button
                  key={outbreak.id}
                  onClick={() => onSelectDistrict(outbreak.district)}
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%, -50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: isSelected ? 20 : 10,
                  }}
                >
                  <div style={{
                    width: isSelected ? 34 : 26,
                    height: isSelected ? 34 : 26,
                    borderRadius: '50%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 ${isSelected ? 20 : 10}px ${color}`,
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}>
                    <MapPin size={isSelected ? 18 : 14} color="#fff" />
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        width: '200%',
                        height: '200%',
                        borderRadius: '50%',
                        border: `1.5px solid ${color}`,
                        animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
                      }} />
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                  }}>
                    {outbreak.district} ({outbreak.reportedCasesCount})
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Click any hotspot pin to inspect district</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Critical
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} /> High
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} /> Moderate
              </span>
            </div>
          </div>
        </div>

        {/* Right: Active Hotspot Incident List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 340, overflowY: 'auto' }}>
          {filteredOutbreaks.map((outbreak) => {
            const isCurrent = outbreak.district === currentDistrict;
            return (
              <div
                key={outbreak.id}
                onClick={() => onSelectDistrict(outbreak.district)}
                style={{
                  background: isCurrent ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 0, 0, 0.3)',
                  border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {outbreak.crop} • {outbreak.district} District
                    </span>
                    <h4 style={{ fontSize: '0.98rem', color: '#fff', marginTop: 2 }}>
                      {outbreak.diseaseOrPest}
                    </h4>
                  </div>
                  <span className={`badge badge-risk-${outbreak.severity}`}>
                    {outbreak.severity.toUpperCase()}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {outbreak.advisoryNote}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} color="var(--primary)" />
                    <strong>{outbreak.reportedCasesCount}</strong> farmer reports
                  </span>
                  <span>{outbreak.lastReportedHoursAgo}h ago</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div className="glass-panel" style={{ maxWidth: 520, width: '100%', padding: 24, position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>
              {isRw ? 'Tanga Raporo y\'Uburwayi bw\'Ibihingwa' : 'Report Disease/Pest Outbreak'}
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>
              {isRw
                ? 'Gira uruhare mu kumenyesha abahinzi baturanye nawe kugira ngo birinde hakiri kare.'
                : 'Help build the national epidemiological early warning radar. Nearby farmers within 15km will receive alerts.'}
            </p>

            {reportedSuccess ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  {isRw ? 'Raporo Yakiriwe Neza!' : 'Outbreak Report Logged!'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Broadcasted to agricultural extension officers in {reportDistrict}.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>District</label>
                  <select value={reportDistrict} onChange={(e) => setReportDistrict(e.target.value as RwandaDistrict)}>
                    <option value="Muhanga">Muhanga</option>
                    <option value="Musanze">Musanze</option>
                    <option value="Ruhango">Ruhango</option>
                    <option value="Huye">Huye</option>
                    <option value="Nyabihu">Nyabihu</option>
                    <option value="Nyagatare">Nyagatare</option>
                    <option value="Bugesera">Bugesera</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Crop</label>
                    <select value={reportCrop} onChange={(e) => setReportCrop(e.target.value as CropType)}>
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Irish Potatoes">Irish Potatoes</option>
                      <option value="Maize">Maize</option>
                      <option value="Climbing Beans">Climbing Beans</option>
                      <option value="Cassava">Cassava</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Observed Severity</label>
                    <select value={reportSeverity} onChange={(e) => setReportSeverity(e.target.value as any)}>
                      <option value="high">High (Spreading quickly)</option>
                      <option value="critical">Critical (Crop death)</option>
                      <option value="moderate">Moderate (Isolated spots)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Disease or Pest Observed</label>
                  <input
                    type="text"
                    value={reportDisease}
                    onChange={(e) => setReportDisease(e.target.value)}
                    placeholder="e.g. Early Blight, Fall Armyworm, Leaf Rust"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Field Observations & Symptoms</label>
                  <textarea
                    rows={3}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="e.g. Spotted brown target rings on 10 rows of Anna F1 tomatoes after rain."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm">
                    Submit & Broadcast Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
