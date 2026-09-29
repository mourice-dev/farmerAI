import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  Bot,
  User,
} from 'lucide-react';
import { DiseaseDetectionResult, FarmProfile, Language, WeatherData } from '../types';
import { AIPipelineService, ChatMessage } from '../services/aiPipelineService';
import { VoiceAssistantService } from '../services/speechService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
  weather: WeatherData;
  recentDiagnosis: DiseaseDetectionResult | null;
  language: Language;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  farm,
  weather,
  recentDiagnosis,
  language,
}) => {
  if (!isOpen) return null;

  const isRw = language === 'rw';

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'ai',
      text: isRw
        ? `Muraho neza Jean-Pierre! Ndi umufasha wawe mu buhinzi bwa ${farm.crop} i ${farm.district}. Ushobora kumbaza mu Kinyarwanda ukoresheje ijwi cyangwa ukandika. Ni iki wagira ngo tuganireho uyu munsi?`
        : `Hello Jean-Pierre! I am your AI Agronomic Assistant for your ${farm.crop} farm in ${farm.district}. Ask me about tomorrow's weather, disease remedies, or fertilizer timing.`,
      timestamp: 'Now',
      suggestedActions: isRw
        ? ['Ese imvura iragwa ejo?', 'Ibibabi by\'inyanya birimo kwijima', 'Bara umufumbire wa NPK']
        : ['Will it rain tomorrow?', 'My leaves are turning brown', 'Fertilizer dose for potatoes'],
    },
  ]);

  const quickQuestionsRw = [
    'Ese imvura iragwa ejo i Muhanga?',
    'Ibibabi by\'inyanya birimo kwijima no kugwa',
    'Ni ryari nkwiriye gutera umuti wa Mancozeb?',
    'Urugereko rwo gutera ifumbire ya Urea',
  ];

  const quickQuestionsEn = [
    'Will it rain tomorrow in Muhanga?',
    'Leaves have brown target rings',
    'When should I spray fungicide?',
    'Recommended fertilizer split for tomatoes',
  ];

  const quickList = isRw ? quickQuestionsRw : quickQuestionsEn;

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'farmer',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Fetch response from AI Pipeline
    const aiResponse = await AIPipelineService.queryAgriAssistant(
      queryText,
      farm,
      recentDiagnosis,
      weather,
      language
    );

    setMessages((prev) => [...prev, aiResponse]);

    // Read aloud automatically
    if (aiResponse.audioText && VoiceAssistantService.isSpeechSynthesisSupported()) {
      setIsSpeaking(true);
      VoiceAssistantService.speak(aiResponse.audioText, language);
      setTimeout(() => setIsSpeaking(false), 7000);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      VoiceAssistantService.stopSpeaking();
    } else {
      setIsListening(true);
      VoiceAssistantService.startListening(
        (transcript) => {
          setIsListening(false);
          setInputQuery(transcript);
          handleSendQuery(transcript);
        },
        (error) => {
          console.warn('[Speech Rec Error]:', error);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
    }
  };

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      VoiceAssistantService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      VoiceAssistantService.speak(text, language);
      setTimeout(() => setIsSpeaking(false), 8000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
    }}>
      <div className="glass-panel-elevated" style={{
        maxWidth: 680,
        width: '100%',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-bright)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--accent-gold-glow)',
            }}>
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>
                {isRw ? 'Umujyanama w\'Ijwi mu Buhinzi' : 'AgriMind Voice & RAG Assistant'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rwanda Agricultural Knowledge Base • Kinyarwanda & English
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isSpeaking && (
              <div className="voice-wave" title="Audio playing">
                <span /><span /><span /><span /><span />
              </div>
            )}

            <button
              onClick={() => {
                VoiceAssistantService.stopSpeaking();
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'farmer';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {!isUser && (
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 4,
                  }}>
                    <Bot size={16} color="#fff" />
                  </div>
                )}

                <div>
                  <div style={{
                    background: isUser ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                    color: '#fff',
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  }}>
                    {msg.text}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {msg.timestamp}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-gold)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.72rem',
                          padding: 0,
                        }}
                      >
                        <Volume2 size={12} />
                        <span>{isRw ? 'Umva Ijwi' : 'Listen'}</span>
                      </button>
                    )}
                  </div>

                  {/* Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendQuery(action)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: 'var(--accent-gold)',
                            borderRadius: 'var(--radius-full)',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 4,
                  }}>
                    <User size={16} color="#fff" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}>
          {quickList.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(q)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar with Microphone & Send */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(0, 0, 0, 0.45)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Big Voice Button */}
          <button
            onClick={handleToggleListening}
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: isListening
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              boxShadow: isListening ? '0 0 16px rgba(255, 255, 255, 0.12)' : '0 4px 12px var(--accent-gold-glow)',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            title={isListening ? 'Listening... click to stop' : 'Click to Speak'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(inputQuery)}
            placeholder={isListening ? (isRw ? 'Tega amatwi... vuga ubu' : 'Listening... speak now') : (isRw ? 'Andika ikibazo cy\'ubuhinzi cyangwa kanda kuri mikoro...' : 'Ask agricultural question or click mic...')}
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '12px 18px',
              fontSize: '0.9rem',
              color: '#fff',
            }}
          />

          <button
            onClick={() => handleSendQuery(inputQuery)}
            className="btn btn-primary"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
