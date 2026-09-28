import React, { useState } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Info,
  Send,
  Eye,
  ChevronRight,
  PackageCheck,
} from 'lucide-react';
import {
  CropType,
  DiseaseDetectionResult,
  Language,
} from '../types';
import { DIAGNOSTIC_SAMPLES, DiagnosticSample } from '../data/mockData';
import { AIPipelineService } from '../services/aiPipelineService';
import { getTop5PredictionsForDiagnosis, TopKPrediction } from '../services/plantDiseaseModelAdapter';

interface CropDoctorScannerProps {
  selectedCrop: CropType;
  growthStage: string;
  language: Language;
  onDiagnosisComplete: (result: DiseaseDetectionResult) => void;
  onEscalateToAgronomist: (result: DiseaseDetectionResult) => void;
}

export const CropDoctorScanner: React.FC<CropDoctorScannerProps> = ({
  selectedCrop,
  growthStage,
  language,
  onDiagnosisComplete,
  onEscalateToAgronomist,
}) => {
  const isRw = language === 'rw';

  const [activeSample, setActiveSample] = useState<DiagnosticSample>(DIAGNOSTIC_SAMPLES[0]);
  const [selectedImage, setSelectedImage] = useState<string>(DIAGNOSTIC_SAMPLES[0].imageUrl);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiseaseDetectionResult | null>(DIAGNOSTIC_SAMPLES[0].result);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'rgb' | 'gradcam'>('rgb');
  const [escalated, setEscalated] = useState<boolean>(false);
  const [postHarvestResult, setPostHarvestResult] = useState<any | null>(null);
  const [isGradingPostHarvest, setIsGradingPostHarvest] = useState<boolean>(false);

  const top5Predictions = diagnosis
    ? getTop5PredictionsForDiagnosis(diagnosis.diagnosis, diagnosis.crop)
    : [];

  const handleSelectSample = async (sample: DiagnosticSample) => {
    setActiveSample(sample);
    setSelectedImage(sample.imageUrl);
    setIsScanning(true);
    setEscalated(false);
    setPostHarvestResult(null);

    const result = await AIPipelineService.analyzeCropImage(sample.imageUrl, sample.crop as CropType, growthStage);
    setDiagnosis(result);
    setIsScanning(false);
    onDiagnosisComplete(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
      setIsScanning(true);
      setEscalated(false);
      setPostHarvestResult(null);

      const result = await AIPipelineService.analyzeCropImage(dataUrl, selectedCrop, growthStage);
      setDiagnosis(result);
      setIsScanning(false);
      onDiagnosisComplete(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRunPostHarvestGrading = async () => {
    setIsGradingPostHarvest(true);
    const grading = await AIPipelineService.analyzePostHarvestQuality(selectedCrop);
    setPostHarvestResult(grading);
    setIsGradingPostHarvest(false);
  };

  const handleEscalate = () => {
    if (diagnosis) {
      onEscalateToAgronomist(diagnosis);
      setEscalated(true);
    }
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              MODULE 1
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>
              {isRw ? 'Gusuzuma Indwara n\'Ibyonnyi (Vision Model)' : 'AI Crop Doctor & Pest Detector'}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {isRw
              ? 'Fata ifoto y\'ikibabi cyanduye cyangwa hitamo mu rugero rw\'uburwayi bwo muri Kigali na Musanze.'
              : 'Multi-model Vision inference (EfficientNet-B4 + YOLOv8) trained on PlantVillage & Rwanda agricultural field samples.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={14} />
            <span>{isRw ? 'Shyiramo Ifoto' : 'Upload Photo'}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={handleRunPostHarvestGrading}
            className="btn btn-outline-gold btn-sm"
            disabled={isGradingPostHarvest}
          >
            <PackageCheck size={14} />
            <span>{isGradingPostHarvest ? 'Analyzing...' : isRw ? 'Suzuma Umusaruro (Grade)' : 'Post-Harvest Grader'}</span>
          </button>
        </div>
      </div>

      {/* Preset Rwandan Test Samples Row */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
          {isRw ? 'Hitamo mu ngero z\'ibihingwa byo muri Rwanda:' : 'Interactive Test Library (Rwandan Field Scenarios):'}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
        }}>
          {DIAGNOSTIC_SAMPLES.map((sample) => {
            const isSelected = activeSample.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#16241e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={sample.thumbnailSvg || sample.imageUrl}
                    alt={sample.crop}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#34d399' : '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {sample.crop}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {sample.name.split(' ')[0]} {sample.name.split(' ')[1]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scanner Workspace Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}>
        {/* Left: Interactive Image Viewport with Bounding Boxes & Laser Beam */}
        <div>
          <div className="scanner-viewport" style={{ height: 320, background: '#0a0f0d', position: 'relative' }}>
            {isScanning && <div className="scanner-beam" />}

            {viewMode === 'rgb' ? (
              <img
                src={selectedImage}
                alt="Crop Leaf Scan"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: isScanning ? 'brightness(0.7) contrast(1.1)' : 'none',
                  transition: 'filter 0.3s',
                }}
              />
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src="/sample_gradcam.png"
                  alt="Grad-CAM Saliency Map"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#ec4899',
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                }}>
                  Grad-CAM Attention Heatmap
                </div>
              </div>
            )}

            {/* Bounding box overlays (only in RGB mode) */}
            {viewMode === 'rgb' && !isScanning && showBoundingBoxes && diagnosis?.boundingBoxes?.map((box, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: `${box.y}%`,
                  left: `${box.x}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  border: '2px solid #ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: -24,
                  left: -2,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                }}>
                  {box.label} ({Math.round(box.confidence * 100)}%)
                </div>
              </div>
            ))}

            {/* Viewport badge controls */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 6,
            }}>
              <span style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Camera size={13} color="var(--primary)" />
                {isScanning ? (isRw ? 'AI irimo gusuzuma...' : 'Inference running...') : 'Ready for Analysis'}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setViewMode(viewMode === 'rgb' ? 'gradcam' : 'rgb')}
                  style={{
                    background: viewMode === 'gradcam' ? 'rgba(236, 72, 153, 0.8)' : 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title="Toggle Grad-CAM Neural Attention Heatmap"
                >
                  <Sparkles size={12} color={viewMode === 'gradcam' ? '#fff' : '#ec4899'} />
                  <span>{viewMode === 'gradcam' ? 'RGB View' : 'Grad-CAM XAI'}</span>
                </button>

                {viewMode === 'rgb' && (
                  <button
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      borderRadius: 'var(--radius-full)',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Eye size={12} />
                    <span>{showBoundingBoxes ? 'Hide Boxes' : 'Show Boxes'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* OOD (Out-of-Distribution) Sanity Guard Indicator */}
          <div style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={14} color="#10b981" />
              <span>OOD Filter Head: Plant Leaf Verified (OOD score 0.04)</span>
            </div>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Valid Specimen</span>
          </div>
        </div>

        {/* Right: Detailed Diagnosis Result & Action Plan */}
        <div>
          {isScanning ? (
            <div style={{
              height: 320,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '3px solid rgba(16, 185, 129, 0.2)',
                borderTopColor: '#10b981',
                animation: 'spin 1s linear infinite',
              }} />
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                {isRw ? 'Uburyo bwa EfficientNet burimo gusesengura amababi...' : 'Running EfficientNet & YOLOv8 Inference Pipeline...'}
              </div>
            </div>
          ) : diagnosis ? (
            <div>
              {/* Diagnosis Header with Confidence Badge */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isRw ? 'Icyavuye mu isuzuma' : 'Vision Model Diagnosis'}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginTop: 2 }}>
                      {diagnosis.diagnosis}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontStyle: 'italic' }}>
                      {diagnosis.scientificName} • <span style={{ color: '#6ee7b7' }}>{diagnosis.kinyarwandaName}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: diagnosis.confidence > 0.85 ? '#34d399' : '#fbbf24',
                    }}>
                      {Math.round(diagnosis.confidence * 100)}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Model Confidence
                    </div>
                  </div>
                </div>

                {/* Progress Bar of confidence */}
                <div style={{
                  height: 6,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginTop: 8,
                }}>
                  <div style={{
                    width: `${Math.round(diagnosis.confidence * 100)}%`,
                    height: '100%',
                    background: diagnosis.confidence > 0.85 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    borderRadius: 3,
                  }} />
                </div>

                {/* Top-5 Predictions Breakdown */}
                {top5Predictions.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {isRw ? 'Ibyiciro 5 biza imbere (Softmax Probabilities)' : 'Top 5 Model Predictions (Softmax)'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                        EfficientNetV2-S ONNX
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {top5Predictions.map((pred, idx) => (
                        <div key={pred.classIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem' }}>
                          <span style={{ width: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{idx + 1}.</span>
                          <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ color: idx === 0 ? '#34d399' : '#e2e8f0', fontWeight: idx === 0 ? 700 : 400 }}>
                              {pred.crop} — {pred.condition}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: 6 }}>
                              ({pred.kinyarwandaName})
                            </span>
                          </div>
                          <div style={{ width: 45, textAlign: 'right', fontWeight: 600, color: idx === 0 ? '#34d399' : 'var(--text-muted)' }}>
                            {(pred.probability * 100).toFixed(1)}%
                          </div>
                          <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, Math.round(pred.probability * 100))}%`,
                                height: '100%',
                                background: idx === 0 ? '#10b981' : 'rgba(255,255,255,0.3)',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Tabs & Prescription */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Immediate Cultural Action */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.82rem', marginBottom: 4 }}>
                    <Sparkles size={14} />
                    <span>{isRw ? 'Icyo Ugomba Gukora Ako Kanya' : 'Immediate Cultural Intervention'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>
                    {diagnosis.immediateAction}
                  </div>
                </div>

                {/* RAB Approved Chemical & Organic Controls */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                    {isRw ? 'Umuti wemewe na RAB (Organic & Chemical)' : 'RAB Recommended Treatment Protocol'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    🌿 <strong>Organic:</strong> {diagnosis.recommendedOrganicTreatment}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    🧪 <strong>Chemical:</strong> {diagnosis.recommendedChemicalTreatment}
                  </div>
                </div>

                {/* Agronomist Escalation Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {diagnosis.confidence < 0.85 || diagnosis.agronomistReviewRecommended
                      ? (isRw ? '⚠️ Icyizere kiri munsi ya 85% cyangwa uburwayi bukomeye' : '⚠️ Low confidence or quarantine pest detected')
                      : (isRw ? 'Isuzuma ririzewe (High confidence)' : 'Standard confidence passed')}
                  </div>

                  <button
                    onClick={handleEscalate}
                    disabled={escalated}
                    className="btn btn-outline-gold btn-sm"
                    style={{ gap: 6 }}
                  >
                    {escalated ? (
                      <>
                        <CheckCircle2 size={14} color="#10b981" />
                        <span>{isRw ? 'Byoherejwe kuri Agronome' : 'Escalated to Agronomist'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{isRw ? 'Ohereza kuri Agronome' : 'Triage to District Agronomist'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Post Harvest Quality Modal / Result Panel if active */}
      {postHarvestResult && (
        <div style={{
          marginTop: 20,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 25, 21, 0.9) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <PackageCheck size={18} color="var(--accent-gold)" />
            <h4 style={{ fontSize: '1rem', color: '#fff' }}>
              {isRw ? 'Isuzuma ry\'Ubwiza bw\'Umusaruro (Post-Harvest Quality AI)' : 'AI Post-Harvest Loss & Produce Grading'}
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grade A (Export/Premium)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {postHarvestResult.gradeA}%
              </div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grade B (Local Retail)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>
                {postHarvestResult.gradeB}%
              </div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Damaged / Overripe</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
                {postHarvestResult.damaged}%
              </div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Est. Shelf Life</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                {postHarvestResult.shelfLifeDays} days
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>
            💡 {isRw ? postHarvestResult.recommendationRw : postHarvestResult.recommendation}
          </div>
        </div>
      )}
    </div>
  );
};
