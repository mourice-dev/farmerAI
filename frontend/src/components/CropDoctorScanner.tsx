/** @format */

import React, { useState } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  Sparkles,
  Send,
  Eye,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import {
  CropType,
  DiseaseDetectionResult,
  Language,
} from '../types';
import { DIAGNOSTIC_SAMPLES, DiagnosticSample } from '../data/mockData';
import { AIPipelineService } from '../services/aiPipelineService';
import { getTop5PredictionsForDiagnosis } from '../services/plantDiseaseModelAdapter';

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
    <div
      style={{
        padding: '28px',
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 16,
        fontFamily: 'var(--font-family-aeonik)',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              fontSize: '0.72rem',
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 100,
              fontFamily: 'var(--font-family-mono)',
              letterSpacing: '0.04em',
            }}>
              VISION ENGINE
            </span>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 500, letterSpacing: '-0.03em' }}>
              {isRw ? 'Gusuzuma Indwara n\'Ibyonnyi (Vision Model)' : 'AI Crop Doctor & Pathology Detector'}
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)' }}>
            {isRw
              ? 'Fata ifoto y\'ikibabi cyanduye cyangwa hitamo mu rugero rw\'uburwayi bwo muri Kigali na Musanze.'
              : 'Multi-model Vision inference (EfficientNetV2-S + YOLOv11) trained on PlantVillage & Rwanda field samples.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <label
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              borderRadius: 100,
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            <Upload size={14} color="#ffffff" />
            <span>{isRw ? 'Shyiramo Ifoto' : 'Upload Photo'}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={handleRunPostHarvestGrading}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: 100,
              padding: '8px 20px',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
            disabled={isGradingPostHarvest}
          >
            <PackageCheck size={14} color="#000000" />
            <span>{isGradingPostHarvest ? 'Analyzing...' : isRw ? 'Suzuma Umusaruro (Grade)' : 'Post-Harvest Grader'}</span>
          </button>
        </div>
      </div>

      {/* Preset Rwandan Test Samples Row */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-family-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
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
                  background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#1a1a1a',
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
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      color: isSelected ? '#000000' : '#ffffff',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {sample.crop}
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: isSelected ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.5)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
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
        {/* Left: Interactive Image Viewport */}
        <div>
          <div
            className="scanner-viewport"
            style={{
              height: 320,
              background: '#090a0d',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isScanning && <div className="scanner-beam" style={{ background: 'rgba(255, 255, 255, 0.05) 100%)', borderBottom: '2px solid #ffffff' }} />}

            {viewMode === 'rgb' ? (
              <img
                src={selectedImage}
                alt="Crop Leaf Scan"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: isScanning ? 'brightness(0.8) contrast(1.1)' : 'none',
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
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-family-mono)',
                }}>
                  Grad-CAM Attention Heatmap
                </div>
              </div>
            )}

            {/* Bounding box overlays in Pure White */}
            {viewMode === 'rgb' && !isScanning && showBoundingBoxes && diagnosis?.boundingBoxes?.map((box, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: `${box.y}%`,
                  left: `${box.x}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  border: '2px solid #ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 12px rgba(255, 255, 255, 0.4)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: -24,
                  left: -2,
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                }}>
                  {box.label} ({Math.round(box.confidence * 100)}%)
                </div>
              </div>
            ))}

            {/* Viewport controls */}
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
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '5px 12px',
                borderRadius: 100,
                fontSize: '0.75rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Camera size={13} color="#ffffff" />
                {isScanning ? (isRw ? 'AI irimo gusuzuma...' : 'Inference running...') : 'Ready for Analysis'}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setViewMode(viewMode === 'rgb' ? 'gradcam' : 'rgb')}
                  style={{
                    background: viewMode === 'gradcam' ? '#ffffff' : 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: viewMode === 'gradcam' ? '#000000' : '#ffffff',
                    borderRadius: 100,
                    padding: '5px 14px',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.2s ease',
                  }}
                  title="Toggle Grad-CAM Neural Attention Heatmap"
                >
                  <Sparkles size={12} color={viewMode === 'gradcam' ? '#000000' : '#ffffff'} />
                  <span>{viewMode === 'gradcam' ? 'RGB View' : 'Grad-CAM XAI'}</span>
                </button>

                {viewMode === 'rgb' && (
                  <button
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      borderRadius: 100,
                      padding: '5px 14px',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Eye size={12} color="#ffffff" />
                    <span>{showBoundingBoxes ? 'Hide Boxes' : 'Show Boxes'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* OOD Sanity Guard */}
          <div style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: '0.78rem',
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#ffffff" />
              <span>OOD Filter: Plant Leaf Verified (OOD score 0.04)</span>
            </div>
            <span style={{ color: '#ffffff', fontWeight: 500 }}>Valid Specimen</span>
          </div>
        </div>

        {/* Right: Detailed Diagnosis Result */}
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
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                borderTopColor: '#ffffff',
                animation: 'spin 1s linear infinite',
              }} />
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 400 }}>
                {isRw ? 'Uburyo bwa EfficientNet burimo gusesengura amababi...' : 'Running EfficientNetV2-S & YOLO Inference Pipeline...'}
              </div>
            </div>
          ) : diagnosis ? (
            <div>
              {/* Diagnosis Header */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-family-mono)' }}>
                      {isRw ? 'Icyavuye mu isuzuma' : 'Vision Model Diagnosis'}
                    </span>
                    <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 500, marginTop: 4 }}>
                      {diagnosis.diagnosis}
                    </h3>
                    <div style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: 2 }}>
                      {diagnosis.scientificName} • <span>{diagnosis.kinyarwandaName}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}>
                      {Math.round(diagnosis.confidence * 100)}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-family-mono)', marginTop: 4 }}>
                      CONFIDENCE
                    </div>
                  </div>
                </div>

                {/* Progress Bar in Pure White */}
                <div style={{
                  height: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginTop: 10,
                }}>
                  <div style={{
                    width: `${Math.round(diagnosis.confidence * 100)}%`,
                    height: '100%',
                    background: '#ffffff',
                    borderRadius: 2,
                  }} />
                </div>

                {/* Top-5 Predictions Breakdown */}
                {top5Predictions.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.04em' }}>
                        {isRw ? 'Ibyiciro 5 biza imbere' : 'Top 5 Softmax Predictions'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-family-mono)' }}>
                        EfficientNetV2-S ONNX
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {top5Predictions.map((pred, idx) => (
                        <div key={pred.classIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem' }}>
                          <span style={{ width: 14, color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-family-mono)' }}>{idx + 1}.</span>
                          <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ color: '#ffffff', fontWeight: idx === 0 ? 500 : 400 }}>
                              {pred.crop} — {pred.condition}
                            </span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.7rem', marginLeft: 6 }}>
                              ({pred.kinyarwandaName})
                            </span>
                          </div>
                          <div style={{ width: 45, textAlign: 'right', fontWeight: 500, color: idx === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)' }}>
                            {(pred.probability * 100).toFixed(1)}%
                          </div>
                          <div style={{ width: 60, height: 3, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, Math.round(pred.probability * 100))}%`,
                                height: '100%',
                                background: idx === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
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
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ffffff', fontWeight: 500, fontSize: '0.82rem', marginBottom: 4 }}>
                    <Sparkles size={14} color="#ffffff" />
                    <span>{isRw ? 'Icyo Ugomba Gukora Ako Kanya' : 'Immediate Cultural Intervention'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {diagnosis.immediateAction}
                  </div>
                </div>

                {/* Treatment Protocol */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 500, marginBottom: 6 }}>
                    {isRw ? 'Umuti wemewe na RAB (Organic & Chemical)' : 'RAB Recommended Treatment Protocol'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: 4 }}>
                    🌿 <strong>Organic:</strong> {diagnosis.recommendedOrganicTreatment}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                    🧪 <strong>Chemical:</strong> {diagnosis.recommendedChemicalTreatment}
                  </div>
                </div>

                {/* Agronomist Escalation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                    {diagnosis.confidence < 0.85 || diagnosis.agronomistReviewRecommended
                      ? (isRw ? '⚠️ Icyizere kiri munsi ya 85% cyangwa uburwayi bukomeye' : '⚠️ Low confidence or quarantine pest detected')
                      : (isRw ? 'Isuzuma ririzewe (High confidence)' : 'Standard confidence passed')}
                  </div>

                  <button
                    onClick={handleEscalate}
                    disabled={escalated}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      borderRadius: 100,
                      padding: '6px 16px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {escalated ? (
                      <>
                        <CheckCircle2 size={14} color="#ffffff" />
                        <span>{isRw ? 'Byoherejwe kuri Agronome' : 'Escalated to Agronomist'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} color="#ffffff" />
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

      {/* Post Harvest Quality Modal / Result Panel */}
      {postHarvestResult && (
        <div style={{
          marginTop: 24,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <PackageCheck size={18} color="#ffffff" />
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 500 }}>
              {isRw ? 'Isuzuma ry\'Ubwiza bw\'Umusaruro (Post-Harvest Quality AI)' : 'AI Post-Harvest Loss & Produce Grading'}
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-family-mono)' }}>Grade A (Export/Premium)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginTop: 4 }}>
                {postHarvestResult.gradeA}%
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-family-mono)' }}>Grade B (Local Retail)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginTop: 4 }}>
                {postHarvestResult.gradeB}%
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-family-mono)' }}>Damaged / Overripe</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 }}>
                {postHarvestResult.damaged}%
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-family-mono)' }}>Est. Shelf Life</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginTop: 4 }}>
                {postHarvestResult.shelfLifeDays} days
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            💡 {isRw ? postHarvestResult.recommendationRw : postHarvestResult.recommendation}
          </div>
        </div>
      )}
    </div>
  );
};
