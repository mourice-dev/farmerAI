import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Phone,
  Calendar,
  Send,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { AgronomistCase, Language } from '../types';

interface AgronomistPortalProps {
  cases: AgronomistCase[];
  language: Language;
  onVerifyCase: (caseId: string, verifiedDiagnosis: string, prescription: string) => void;
}

export const AgronomistPortal: React.FC<AgronomistPortalProps> = ({
  cases,
  language,
  onVerifyCase,
}) => {
  const isRw = language === 'rw';

  const [selectedCase, setSelectedCase] = useState<AgronomistCase>(cases[0]);
  const [agronomistNotes, setAgronomistNotes] = useState<string>(
    'Confirmed classic target rings on lower leaves. Rain expected; recommend holding systemic spray until tomorrow 07:00.'
  );
  const [verifiedDiagnosis, setVerifiedDiagnosis] = useState<string>(selectedCase?.aiSuggestedDiagnosis || 'Early Blight');
  const [issuedPrescription, setIssuedPrescription] = useState<string>(
    'Prune bottom 25cm of foliage. Apply Mancozeb 80% WP (50g / 20L water) once leaves dry. Pre-harvest interval: 7 days.'
  );
  const [successBadge, setSuccessBadge] = useState<boolean>(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onVerifyCase(selectedCase.id, verifiedDiagnosis, issuedPrescription);
    setSuccessBadge(true);
    setTimeout(() => setSuccessBadge(false), 2000);
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
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              MODULE 7
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>
              {isRw ? 'Urubuga rw\'Agronome w\'Akarere (Agronomist Verification Portal)' : 'Agronomist Triage & Digital Prescription Portal'}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {isRw
              ? 'Aho inzobere mu buhinzi (Agronomists) zisuzumira ibibazo by\'abahinzi byagaragaje icyizere giciriritse muri AI.'
              : 'Human-in-the-loop expert review pipeline for borderline AI scans, quarantine pests, and certified digital prescriptions.'}
          </p>
        </div>

        <div style={{
          background: 'rgba(2, 132, 199, 0.15)',
          border: '1px solid rgba(2, 132, 199, 0.35)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <ShieldCheck size={14} />
          <span>RAB Certified Agronomist Session Active</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
      }}>
        {/* Left: Pending Triage Case Queue */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
            {isRw ? 'Urutonde rw\'Ibisaba Isuzuma (Triage Queue):' : 'Pending Farmer Triage Queue:'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cases.map((c) => {
              const isSelected = selectedCase.id === c.id;
              const isPending = c.status === 'PENDING_REVIEW';
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c);
                    setVerifiedDiagnosis(c.aiSuggestedDiagnosis);
                  }}
                  style={{
                    background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'rgba(0,0,0,0.3)',
                    border: isSelected ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
                      {c.farmerName} • {c.crop}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: isPending ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                      color: isPending ? '#ffffff' : '#ffffff',
                    }}>
                      {c.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    AI Suggestion: <strong style={{ color: '#f3f4f6' }}>{c.aiSuggestedDiagnosis}</strong> ({Math.round(c.aiConfidence * 100)}%)
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{c.district} District</span>
                    <span>{c.submissionDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Case Inspection & Digital Prescription Issuance */}
        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>
              Case Review: #{selectedCase.id}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Phone: {selectedCase.farmerPhone}
            </span>
          </div>

          {/* Image & Symptoms */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 110, height: 110, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#0a0f0d' }}>
              <img
                src={selectedCase.imageUrl}
                alt="Case scan"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crop & District:</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                {selectedCase.crop} in {selectedCase.district}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>AI Preliminary Flag:</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                {selectedCase.aiSuggestedDiagnosis} ({Math.round(selectedCase.aiConfidence * 100)}% conf)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Status: <strong style={{ color: selectedCase.status === 'VERIFIED' ? '#ffffff' : '#ffffff' }}>{selectedCase.status}</strong>
              </div>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                Verified Agronomist Diagnosis
              </label>
              <input
                type="text"
                value={verifiedDiagnosis}
                onChange={(e) => setVerifiedDiagnosis(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                Agronomist Clinical Notes & Observations
              </label>
              <textarea
                rows={2}
                value={agronomistNotes}
                onChange={(e) => setAgronomistNotes(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                Certified Digital Prescription (Dosage, Treatment & Safety PHI)
              </label>
              <textarea
                rows={3}
                value={issuedPrescription}
                onChange={(e) => setIssuedPrescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              {successBadge ? (
                <span style={{ fontSize: '0.82rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={14} /> Prescription issued & sent via SMS to farmer!
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Will generate official RAB digital seal
                </span>
              )}

              <button type="submit" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                <FileText size={14} />
                <span>Sign & Issue Prescription</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
