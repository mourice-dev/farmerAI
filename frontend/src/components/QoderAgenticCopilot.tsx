import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  Bot,
  User,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Zap,
  HelpCircle,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { DiseaseDetectionResult, FarmProfile, Language, WeatherData } from '../types';
import { AIPipelineService, ChatMessage } from '../services/aiPipelineService';
import { VoiceAssistantService } from '../services/speechService';

interface QoderAgenticCopilotProps {
  farm: FarmProfile;
  weather: WeatherData;
  recentDiagnosis: DiseaseDetectionResult | null;
  language: Language;
  isOpen: boolean;
  onToggle: () => void;
  activeModel: string;
}

export const QoderAgenticCopilot: React.FC<QoderAgenticCopilotProps> = ({
  farm,
  weather,
  recentDiagnosis,
  language,
  isOpen,
  onToggle,
  activeModel,
}) => {
  const isRw = language === 'rw';

  const [inputVal, setInputVal] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-01',
      sender: 'ai',
      text: isRw
        ? `Muraho ${farm.farmerName}! Ndi Qoder Agentic Co-Pilot ufashijwe na ${activeModel}. Ikirere cy'i ${farm.district} kiragaragaza ubuhehere bwa ${weather.humidityPercentage}% n'amahirwe y'imvura ya ${weather.rainChance24h}%. Ushobora kumpa amategeko yo gusesengura amababi, kubara ifumbire, cyangwa gutegura ihinga ry'igihembwe.`
        : `Hello ${farm.farmerName}! I am your Qoder Agentic Co-Pilot running on ${activeModel}. District ${farm.district} has ${weather.humidityPercentage}% humidity and ${weather.rainChance24h}% rain chance. Delegate autonomous farming tasks, ask for disease remedies, or execute agro-calendar planning.`,
      timestamp: 'Now',
      suggestedActions: isRw
        ? ['/ikirere (Weather Washout Risk)', '/gusuzuma (Run Vision Model)', '/ifumbire (Lime & Fertilizer)']
        : ['/weather (Rain & Washout)', '/diagnose (Run Vision ONNX)', '/lime (Calculate Soil Travertine)'],
    },
  ]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)',
          color: '#fff',
          border: 'none',
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          padding: '12px 6px',
          cursor: 'pointer',
          boxShadow: '-4px 0 16px rgba(139, 92, 246, 0.4)',
          zIndex: 85,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
        title="Open Qoder Agentic Co-Pilot"
      >
        <Sparkles size={16} />
        <span style={{ writingMode: 'vertical-rl', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1 }}>
          AGENTIC CO-PILOT
        </span>
      </button>
    );
  }

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'farmer',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsProcessing(true);

    const response = await AIPipelineService.queryAgriAssistant(
      query,
      farm,
      recentDiagnosis,
      weather,
      language
    );

    setMessages((prev) => [...prev, response]);
    setIsProcessing(false);
  };

  const handleQuickCommand = (cmd: string) => {
    if (cmd.includes('weather') || cmd.includes('ikirere')) {
      handleSend(isRw ? 'Ese imvura iragwa ejo i Muhanga?' : 'Will it rain tomorrow in Muhanga?');
    } else if (cmd.includes('diagnose') || cmd.includes('gusuzuma')) {
      handleSend(isRw ? 'Ndashaka gusuzuma ibibabi by\'inyanya' : 'Diagnose tomato leaf spots');
    } else if (cmd.includes('lime') || cmd.includes('ifumbire')) {
      handleSend(isRw ? 'Urugereko rwo gushyira ingwa (chaux) mu butaka' : 'Calculate travertine lime for acidic soil');
    }
  };

  return (
    <aside
      style={{
        width: 340,
        background: '#0a0d12',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 80,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="qoder-dot qoder-dot-violet" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            QODER AGENTIC CO-PILOT
          </span>
          <span style={{ fontSize: '0.66rem', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', padding: '1px 6px', borderRadius: 4 }}>
            {activeModel}
          </span>
        </div>

        <button
          onClick={onToggle}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Minimize Co-Pilot"
        >
          <X size={15} />
        </button>
      </div>

      {/* Message Stream */}
      <div
        style={{
          flex: 1,
          padding: '14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAI ? 'flex-start' : 'flex-end',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                {isAI ? <Bot size={12} color="#8b5cf6" /> : <User size={12} />}
                <span>{isAI ? `Qoder Agent (${activeModel})` : 'You'}</span>
                <span>• {m.timestamp}</span>
              </div>

              <div
                style={{
                  background: isAI ? 'rgba(255, 255, 255, 0.04)' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  border: isAI ? '1px solid var(--border-subtle)' : 'none',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  color: '#fff',
                  maxWidth: '92%',
                }}
              >
                {m.text}

                {/* Suggested actions chips */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {m.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickCommand(act)}
                        style={{
                          background: 'rgba(139, 92, 246, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: 6,
                          color: '#c084fc',
                          padding: '4px 8px',
                          fontSize: '0.74rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <ChevronRight size={11} />
                        <span>{act}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#c084fc' }}>
            <Sparkles size={14} className="qoder-pulse" />
            <span>Qoder Agent generating agronomic reasoning...</span>
          </div>
        )}
      </div>

      {/* Quick Action Commands */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { label: '/weather', action: 'weather' },
          { label: '/diagnose', action: 'diagnose' },
          { label: '/lime', action: 'lime' },
        ].map((chip) => (
          <button
            key={chip.action}
            onClick={() => handleQuickCommand(chip.action)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              padding: '2px 6px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Prompt Box */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.4)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <input
            type="text"
            placeholder={isRw ? 'Andika ubutumwa cyangwa /ikirere...' : 'Delegate task or ask in Kinyarwanda/EN...'}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '7px 10px',
              fontSize: '0.8rem',
              color: '#fff',
            }}
          />
          <button
            type="submit"
            className="btn btn-qoder-primary"
            style={{ padding: '7px 10px', borderRadius: 6 }}
            disabled={!inputVal.trim() || isProcessing}
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </aside>
  );
};
