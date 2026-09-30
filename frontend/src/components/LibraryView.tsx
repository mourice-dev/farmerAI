import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Leaf, AlertCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { searchDiseases, DiseaseSearchResult } from '../services/apiService';

interface LibraryViewProps {
  onAskAboutDisease: (crop: string, disease: string) => void;
}

const POPULAR_CROPS = ['All', 'Tomato', 'Potato', 'Corn', 'Apple', 'Grape'];

export const LibraryView: React.FC<LibraryViewProps> = ({ onAskAboutDisease }) => {
  const [query, setQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [results, setResults] = useState<DiseaseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Default search for common diseases if empty
    const searchTerm = query.trim() || (selectedCrop !== 'All' ? selectedCrop : 'blight');
    fetchResults(searchTerm);
  }, [query, selectedCrop]);

  const fetchResults = async (term: string) => {
    setIsLoading(true);
    try {
      const data = await searchDiseases(term);
      const filtered = selectedCrop === 'All' 
        ? data 
        : data.filter(d => d.crop.toLowerCase().includes(selectedCrop.toLowerCase()));
      setResults(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="secondary-tool-view" style={{ overflowY: 'auto', height: '100%', paddingBottom: '60px' }}>
      <div className="tool-header-card">
        <h2>Plant Disease Knowledge Library</h2>
        <p>Explore all 38 PlantVillage crop conditions with peer-reviewed prevention, causes, and approved treatment actions.</p>
      </div>

      {/* Search Input Bar */}
      <div style={{
        position: 'relative',
        marginBottom: '16px'
      }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8e8e8e' }} />
        <input 
          type="text"
          placeholder="Search crop, disease name, or symptom (e.g., late blight, rust, leaf spot)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px 14px 44px',
            borderRadius: '14px',
            background: '#282828',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ececec',
            fontSize: '14.5px',
            outline: 'none'
          }}
        />
      </div>

      {/* Crop Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {POPULAR_CROPS.map(crop => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: crop === selectedCrop ? '1px solid #10a37f' : '1px solid rgba(255, 255, 255, 0.1)',
              background: crop === selectedCrop ? 'rgba(16, 163, 127, 0.18)' : '#282828',
              color: crop === selectedCrop ? '#fff' : '#b4b4b4',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {results.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#282828',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              transition: 'background 0.15s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: '#10a37f', fontWeight: 600, textTransform: 'uppercase' }}>
                  {item.crop}
                </span>
                {item.severity && (
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                    color: item.severity === 'CRITICAL' ? '#f87171' : '#facc15'
                  }}>
                    {item.severity}
                  </span>
                )}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                {item.common_name}
              </h4>
              <span style={{ fontSize: '12px', color: '#8e8e8e' }}>{item.class_label}</span>
            </div>

            <button
              onClick={() => onAskAboutDisease(item.crop, item.common_name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ececec',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#383838')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
            >
              <span>Ask Advisor</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}

        {!isLoading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8e8e', fontSize: '14px' }}>
            No matching diseases found for "{query}". Try searching for tomato, potato, or rust.
          </div>
        )}
      </div>
    </div>
  );
};
