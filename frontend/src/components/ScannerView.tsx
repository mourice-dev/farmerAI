import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Leaf, ArrowRight, Loader2 } from 'lucide-react';
import { diagnoseLeaf, DiagnoseResponse, DiagnosisData } from '../services/apiService';

interface ScannerViewProps {
  onApplyDiagnosisToChat: (diagnosis: DiagnosisData) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onApplyDiagnosisToChat }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setIsLoading(true);

    try {
      const data = await diagnoseLeaf(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Diagnosis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="secondary-tool-view" style={{ overflowY: 'auto', height: '100%', paddingBottom: '60px' }}>
      <div className="tool-header-card">
        <h2>Leaf Doctor — EfficientNet Neural Scanner</h2>
        <p>Upload a clear photo of an infected leaf to run ONNX neural classification across 38 crop disease classes.</p>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        className="leaf-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById('scanner-file-input')?.click()}
      >
        <input 
          id="scanner-file-input"
          type="file" 
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
        />

        {previewUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <img 
              src={previewUrl} 
              alt="Leaf Preview" 
              style={{ maxHeight: '220px', borderRadius: '12px', objectFit: 'contain' }} 
            />
            <span style={{ fontSize: '13px', color: '#10a37f' }}>Click or drop another leaf to re-scan</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 163, 127, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10a37f'
            }}>
              <UploadCloud size={28} />
            </div>
            <strong style={{ fontSize: '16px', color: '#ececec' }}>Click to upload or drag & drop leaf image</strong>
            <span style={{ fontSize: '13px', color: '#8e8e8e' }}>Supports JPG, PNG, WebP up to 10MB</span>
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '30px' }}>
          <Loader2 size={24} className="animate-spin" color="#10a37f" />
          <span style={{ fontSize: '14px', color: '#b4b4b4' }}>Running EfficientNetV2-S ONNX inference...</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '14px',
          marginTop: '20px',
          color: '#f87171',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Diagnosis Results Card */}
      {result && !isLoading && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#282828',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '22px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#8e8e8e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {result.diagnosis.crop} Crop
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                  {result.diagnosis.disease}
                </h3>
                <span style={{ fontSize: '13px', color: '#b4b4b4' }}>{result.diagnosis.scientific_label}</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  background: result.diagnosis.confidence >= 85 ? 'rgba(16, 163, 127, 0.18)' : 'rgba(234, 179, 8, 0.18)',
                  color: result.diagnosis.confidence >= 85 ? '#34d399' : '#facc15',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {result.diagnosis.confidence}% Confidence
                </span>
                <p style={{ fontSize: '11px', color: '#8e8e8e', marginTop: '4px' }}>
                  Inference: {result.meta.inference_time_ms} ms ({result.meta.inference_mode})
                </p>
              </div>
            </div>

            {/* Low confidence warning if < 60% */}
            {result.diagnosis.low_confidence && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginTop: '16px',
                fontSize: '13px',
                color: '#facc15'
              }}>
                <AlertTriangle size={18} />
                <span>{result.diagnosis.confidence_note}</span>
              </div>
            )}

            {/* Top 5 Predictions Bar Chart */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '13px', color: '#8e8e8e', textTransform: 'uppercase', marginBottom: '10px' }}>
                Top Neural Predictions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.top5_predictions.map(pred => (
                  <div key={pred.rank} style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: pred.rank === 1 ? '#fff' : '#b4b4b4' }}>
                        #{pred.rank} {pred.crop} — {pred.condition}
                      </span>
                      <strong style={{ color: pred.rank === 1 ? '#10a37f' : '#8e8e8e' }}>{pred.confidence}%</strong>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: '#383838', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pred.confidence}%`,
                        background: pred.rank === 1 ? '#10a37f' : '#6b7280',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Button to transfer to ChatGPT Advisor */}
            <button
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                background: '#10a37f',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s ease'
              }}
              onClick={() => onApplyDiagnosisToChat(result.diagnosis)}
            >
              <span>Consult FarmerAI Chat Advisor on this diagnosis</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
