import React, { useState } from 'react';
import { 
  MessageSquare, 
  Camera, 
  CloudSun, 
  BookOpen, 
  Plus, 
  PanelLeftClose, 
  PanelLeft, 
  Sparkles, 
  MapPin, 
  ChevronRight,
  Leaf
} from 'lucide-react';
import { ChatView } from './components/ChatView';
import { ScannerView } from './components/ScannerView';
import { WeatherView } from './components/WeatherView';
import { LibraryView } from './components/LibraryView';
import { DiagnosisData } from './services/apiService';

type ViewMode = 'chat' | 'scanner' | 'weather' | 'library';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [district, setDistrict] = useState('Musanze');
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosisData | null>(null);
  const [chatKey, setChatKey] = useState(1); // Increment to clear/restart chat

  const handleNewChat = () => {
    setActiveDiagnosis(null);
    setChatKey(prev => prev + 1);
    setViewMode('chat');
  };

  const handleApplyDiagnosisToChat = (diagnosis: DiagnosisData) => {
    setActiveDiagnosis(diagnosis);
    setViewMode('chat');
  };

  const handleAskWeatherInChat = (weatherSummary: string) => {
    setViewMode('chat');
    // We can let the ChatView naturally pick up the district
  };

  const handleAskAboutDisease = (crop: string, disease: string) => {
    setViewMode('chat');
    // User will see chat ready to ask
  };

  return (
    <div className="app-layout">
      {/* ChatGPT Collapsible Sidebar */}
      <aside className={`chat-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#10a37f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={13} color="#fff" />
              </div>
              <span>New Conversation</span>
            </div>
            <Plus size={16} />
          </button>
        </div>

        {/* Hierarchical Agronomy Options */}
        <div className="sidebar-nav-section">
          <span className="nav-section-title">Agronomy Tools</span>
          
          <button 
            className={`nav-item ${viewMode === 'chat' ? 'active' : ''}`}
            onClick={() => setViewMode('chat')}
          >
            <MessageSquare size={17} color={viewMode === 'chat' ? '#10a37f' : '#b4b4b4'} />
            <span>Chat Advisor</span>
          </button>

          <button 
            className={`nav-item ${viewMode === 'scanner' ? 'active' : ''}`}
            onClick={() => setViewMode('scanner')}
          >
            <Camera size={17} color={viewMode === 'scanner' ? '#10a37f' : '#b4b4b4'} />
            <span>Leaf Doctor (Scanner)</span>
            <span className="nav-badge">Vision NN</span>
          </button>

          <button 
            className={`nav-item ${viewMode === 'weather' ? 'active' : ''}`}
            onClick={() => setViewMode('weather')}
          >
            <CloudSun size={17} color={viewMode === 'weather' ? '#10a37f' : '#b4b4b4'} />
            <span>Climate & Radar</span>
          </button>

          <button 
            className={`nav-item ${viewMode === 'library' ? 'active' : ''}`}
            onClick={() => setViewMode('library')}
          >
            <BookOpen size={17} color={viewMode === 'library' ? '#10a37f' : '#b4b4b4'} />
            <span>Disease Library</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#8e8e8e' }}>38 crops</span>
          </button>
        </div>

        {/* District Selector Pill inside Sidebar */}
        <div style={{ padding: '8px 12px' }}>
          <span className="nav-section-title">Farm Location</span>
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ececec' }}>
              <MapPin size={14} color="#10a37f" />
              <span>{district}, Rwanda</span>
            </div>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10a37f',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Musanze" style={{ background: '#212121' }}>Musanze</option>
              <option value="Huye" style={{ background: '#212121' }}>Huye</option>
              <option value="Kigali" style={{ background: '#212121' }}>Kigali</option>
              <option value="Rubavu" style={{ background: '#212121' }}>Rubavu</option>
              <option value="Nyagatare" style={{ background: '#212121' }}>Nyagatare</option>
              <option value="Muhanga" style={{ background: '#212121' }}>Muhanga</option>
              <option value="Rusizi" style={{ background: '#212121' }}>Rusizi</option>
            </select>
          </div>
        </div>

        <div className="sidebar-chat-list">
          <span className="nav-section-title">Recent Topics</span>
          <button className="chat-history-item active" onClick={() => setViewMode('chat')}>
            <span>🍃 Tomato late blight prevention</span>
          </button>
          <button className="chat-history-item" onClick={() => setViewMode('chat')}>
            <span>🥔 Musanze potato seed spacing</span>
          </button>
          <button className="chat-history-item" onClick={() => setViewMode('chat')}>
            <span>🌽 Maize rust fungicide safety</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className="status-dot" />
            <span>Dual Engine: EfficientNet + Groq 120B</span>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        {/* Top Minimal Navigation Bar */}
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="icon-action-btn"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>

            <button className="model-badge-dropdown" onClick={() => setViewMode('chat')}>
              <span>FarmerAI</span>
              <span style={{ fontSize: '11px', color: '#10a37f', background: 'rgba(16, 163, 127, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                4.0 Groq
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {viewMode !== 'chat' && (
              <button
                onClick={() => setViewMode('chat')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 163, 127, 0.15)',
                  border: '1px solid rgba(16, 163, 127, 0.3)',
                  color: '#34d399',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={14} />
                <span>Return to Chat</span>
              </button>
            )}

            <button 
              className="icon-action-btn"
              onClick={handleNewChat}
              title="Start a new chat"
            >
              <Plus size={18} />
            </button>
          </div>
        </header>

        {/* Hierarchical View Content */}
        {viewMode === 'chat' && (
          <ChatView
            key={chatKey}
            district={district}
            onDistrictChange={setDistrict}
            activeDiagnosis={activeDiagnosis}
            onClearActiveDiagnosis={() => setActiveDiagnosis(null)}
            onSwitchToScanner={() => setViewMode('scanner')}
          />
        )}

        {viewMode === 'scanner' && (
          <ScannerView 
            onApplyDiagnosisToChat={handleApplyDiagnosisToChat} 
          />
        )}

        {viewMode === 'weather' && (
          <WeatherView
            currentDistrict={district}
            onSelectDistrict={setDistrict}
            onAskChatWithWeather={handleAskWeatherInChat}
          />
        )}

        {viewMode === 'library' && (
          <LibraryView
            onAskAboutDisease={handleAskAboutDisease}
          />
        )}
      </main>
    </div>
  );
};

export default App;
