import React, { useState } from 'react';
import {
  FolderTree,
  FileCode,
  Box,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Flame,
  FileText,
  Activity,
} from 'lucide-react';
import { FarmProfile, Language, RwandaDistrict } from '../types';

interface QoderActivitySidebarProps {
  currentDistrict: RwandaDistrict;
  onSelectDistrict: (district: RwandaDistrict) => void;
  farm: FarmProfile;
  language: Language;
  onSelectTab: (tabId: string) => void;
}

export const QoderActivitySidebar: React.FC<QoderActivitySidebarProps> = ({
  currentDistrict,
  onSelectDistrict,
  farm,
  language,
  onSelectTab,
}) => {
  const isRw = language === 'rw';

  const [repoOpen, setRepoOpen] = useState<boolean>(true);
  const [parcelsOpen, setParcelsOpen] = useState<boolean>(true);
  const [questsOpen, setQuestsOpen] = useState<boolean>(true);

  return (
    <aside
      style={{
        width: 270,
        background: '#0a0d12',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
        overflowY: 'auto',
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FolderTree size={14} color="#8b5cf6" />
          <span>Qoder Context & Quests</span>
        </div>
        <span style={{ fontSize: '0.65rem', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', padding: '1px 6px', borderRadius: 4 }}>
          Agentic
        </span>
      </div>

      {/* SECTION 1: AGRIMIND REPO & MODEL ASSETS */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setRepoOpen(!repoOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {repoOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>WORKSPACE REPO & MODELS</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>6 files</span>
        </button>

        {repoOpen && (
          <div style={{ padding: '0 8px 8px 24px', display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}>
            <div
              onClick={() => onSelectTab('ml-workbench')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', cursor: 'pointer', padding: '3px 6px', borderRadius: 4 }}
              title="Cloned MoE LLM Repository"
            >
              <Box size={13} color="#38bdf8" />
              <span>DeepSeek-V3/</span>
            </div>

            <div
              onClick={() => onSelectTab('ml-workbench')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', cursor: 'pointer', padding: '3px 6px', borderRadius: 4 }}
              title="80.6 MB Quantized ONNX Model"
            >
              <FileCode size={13} color="#10b981" />
              <span>efficientnet_v2_s.onnx</span>
            </div>

            <div
              onClick={() => onSelectTab('ml-workbench')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', cursor: 'pointer', padding: '3px 6px', borderRadius: 4 }}
              title="74.7 MB PyTorch Checkpoint"
            >
              <FileCode size={13} color="#f59e0b" />
              <span>best_model.pth</span>
            </div>

            <div
              onClick={() => onSelectTab('ml-workbench')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c084fc', cursor: 'pointer', padding: '3px 6px', borderRadius: 4 }}
              title="38 Plant Disease Classes"
            >
              <FileText size={13} color="#c084fc" />
              <span>classes.json (38 cl)</span>
            </div>

            <div
              onClick={() => onSelectTab('ml-workbench')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', cursor: 'pointer', padding: '3px 6px', borderRadius: 4 }}
              title="FastAPI Microservice Bridge"
            >
              <FileCode size={13} color="#94a3b8" />
              <span>backend_bridge.py</span>
            </div>

            <div
              onClick={() => onSelectTab('crop-doctor')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ec4899', cursor: 'pointer', padding: '3px 6px', borderRadius: 4 }}
              title="Grad-CAM Explainable AI Heatmap"
            >
              <Activity size={13} color="#ec4899" />
              <span>sample_gradcam.png</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: RWANDA AGRO PARCELS */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setParcelsOpen(!parcelsOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {parcelsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>ACTIVE PARCELS & SECTORS</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>Rwanda 🇷🇼</span>
        </button>

        {parcelsOpen && (
          <div style={{ padding: '0 8px 8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { district: 'Muhanga', alt: '1,820m', crop: 'Tomatoes', staple: true },
              { district: 'Musanze', alt: '2,200m', crop: 'Irish Potato (Kinigi)', staple: true },
              { district: 'Nyabihu', alt: '2,350m', crop: 'Irish Potato', staple: true },
              { district: 'Nyagatare', alt: '1,400m', crop: 'Hybrid Maize', staple: false },
              { district: 'Bugesera', alt: '1,350m', crop: 'Cassava / Beans', staple: false },
            ].map((p) => {
              const isSelected = currentDistrict === p.district;
              return (
                <div
                  key={p.district}
                  onClick={() => onSelectDistrict(p.district as RwandaDistrict)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 6,
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={12} color={isSelected ? '#8b5cf6' : 'var(--text-subtle)'} />
                    <span style={{ fontWeight: isSelected ? 600 : 400 }}>{p.district}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>{p.alt}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: AGENTIC QUESTS */}
      <div style={{ flex: 1 }}>
        <button
          onClick={() => setQuestsOpen(!questsOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {questsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>AGENTIC QUESTS</span>
          </div>
          <span className="qoder-dot qoder-dot-violet" style={{ width: 6, height: 6 }} />
        </button>

        {questsOpen && (
          <div style={{ padding: '0 8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Quest 1 */}
            <div
              onClick={() => onSelectTab('crop-doctor')}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fb7185' }}>Quest #101 • Active</span>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-subtle)' }}>3/4 Steps</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 600 }}>
                Mitigate Early Blight Fungal Threat
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Rain forecasted; postpone spray 24h & prune lower canopy.
              </div>
            </div>

            {/* Quest 2 */}
            <div
              onClick={() => onSelectTab('soil-advisor')}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399' }}>Quest #102 • Completed</span>
                <CheckCircle2 size={11} color="#10b981" />
              </div>
              <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 600 }}>
                Soil Acidity Liming (pH 5.1 &rarr; 6.2)
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Applied 150 kg/ha travertine before Season A sowing.
              </div>
            </div>

            {/* Quest 3 */}
            <div
              onClick={() => onSelectTab('marketplace')}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24' }}>Quest #103 • Queued</span>
                <Clock size={11} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 600 }}>
                Forward Contract Locking (950 RWF/kg)
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Lock 1,200 kg Grade A tomato produce with Kigali buyer.
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
