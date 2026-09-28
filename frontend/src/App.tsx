/** @format */

import React, { useState, useEffect } from "react";
import {
  Sprout,
  Activity,
  CloudRain,
  ShieldAlert,
  Radio,
  FlaskConical,
  Store,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Mic,
  MessageSquare,
  CheckCircle,
  Calendar,
  FileCode,
  Box,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  AgronomistCase,
  CropType,
  DecisionFusionAdvice,
  DiseaseDetectionResult,
  FarmProfile,
  ForwardContractListing,
  Language,
  MarketPriceItem,
  OutbreakAlert,
  RwandaDistrict,
  UserRole,
  WeatherData,
} from "./types";
import {
  DISTRICT_COORDINATES,
  INITIAL_FARM,
  MOCK_AGRONOMIST_CASES,
  MOCK_FORWARD_CONTRACTS,
  MOCK_MARKET_PRICES,
  MOCK_OUTBREAKS,
} from "./data/mockData";
import { fetchAgroWeather } from "./services/weatherService";
import { AIPipelineService } from "./services/aiPipelineService";
import { Navbar } from "./components/Navbar";
import { HeroFarmStatus } from "./components/HeroFarmStatus";
import { CropDoctorScanner } from "./components/CropDoctorScanner";
import { AgronomicAdvisorCard } from "./components/AgronomicAdvisorCard";
import { SurveillanceMap } from "./components/SurveillanceMap";
import { VoiceAssistantModal } from "./components/VoiceAssistantModal";
import { SoilAdvisor } from "./components/SoilAdvisor";
import { Marketplace } from "./components/Marketplace";
import { YieldPredictor } from "./components/YieldPredictor";
import { AgronomistPortal } from "./components/AgronomistPortal";
import { MLWorkbench } from "./components/MLWorkbench";
import { SeasonalAgroPlanner } from "./components/SeasonalAgroPlanner";
import { UssdFeaturePhoneModal } from "./components/UssdFeaturePhoneModal";
import { QoderActivitySidebar } from "./components/QoderActivitySidebar";
import { QoderAgenticCopilot } from "./components/QoderAgenticCopilot";
import { QoderStatusBar } from "./components/QoderStatusBar";

export function App() {
  // Global App State
  const [language, setLanguage] = useState<Language>("en");
  const [currentRole, setRole] = useState<UserRole>("farmer");
  const [district, setDistrict] = useState<RwandaDistrict>("Muhanga");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeModel, setActiveModel] = useState<string>("DeepSeek-V3");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(true);

  // Farm Profile
  const [farm, setFarm] = useState<FarmProfile>({
    ...INITIAL_FARM,
    district: "Muhanga",
  });

  // Weather & Agronomic Decision State
  const [weather, setWeather] = useState<WeatherData>({
    district: "Muhanga",
    tempCelsius: 24,
    humidityPercentage: 82,
    rainChance24h: 70,
    expectedRainfallMm: 12.4,
    windSpeedKmh: 8,
    soilMoisturePercentage: 34,
    soilTempCelsius: 22,
    uvIndex: 6,
    forecastSummary: "Rain expected tomorrow. High relative humidity.",
    sporeGerminationIndex: 78,
    leafWetnessHours: 8,
    isRainExpectedNext24h: true,
  });

  const [recentDiagnosis, setRecentDiagnosis] =
    useState<DiseaseDetectionResult | null>(null);
  const [advice, setAdvice] = useState<DecisionFusionAdvice>({
    riskLevel: "high",
    irrigationAdvice: {
      action: "DO_NOT_IRRIGATE",
      headline: "Don't Irrigate Today (Rain Expected)",
      headlineRw: "Ntukuhire Uyu Munsi (Imvura Iraza)",
      reason:
        "Rainfall expected within 24h will supply sufficient moisture. Over-irrigation promotes fungal blight.",
    },
    sprayAdvice: {
      isSafeToSpray: false,
      headline: "Avoid Spraying Today (Rain Washout Risk)",
      headlineRw: "Wikoresha Umuti Uyu Munsi (Imvura Yawuhagira)",
      explanation:
        "Rain showers will wash off chemical foliar protection before absorption.",
      bestWindow: "Wait 24h until rain clears and leaves dry.",
    },
    drainageWarning: false,
    agronomicSummary:
      "District Muhanga: Conditions are warm & damp. Fungal spore germination pressure is elevated.",
    agronomicSummaryRw:
      "Akarere ka Muhanga: Ikirere gifite ubuhehere bwo hejuru. Witera umuti uyu munsi kubera imvura.",
  });

  // Outbreaks, Market, and Agronomist Queues
  const [outbreaks, setOutbreaks] = useState<OutbreakAlert[]>(MOCK_OUTBREAKS);
  const [marketPrices, setMarketPrices] =
    useState<MarketPriceItem[]>(MOCK_MARKET_PRICES);
  const [contracts, setContracts] = useState<ForwardContractListing[]>(
    MOCK_FORWARD_CONTRACTS,
  );
  const [agronomistCases, setAgronomistCases] = useState<AgronomistCase[]>(
    MOCK_AGRONOMIST_CASES,
  );
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [ussdModalOpen, setUssdModalOpen] = useState<boolean>(false);

  // Fetch real weather when district changes
  useEffect(() => {
    let isMounted = true;
    fetchAgroWeather(district).then((w) => {
      if (isMounted) {
        setWeather(w);
        const coords = DISTRICT_COORDINATES[district];
        setFarm((prev) => ({
          ...prev,
          district,
          altitudeMeters: coords?.altitude || prev.altitudeMeters,
          soilType: coords?.soilDefault || prev.soilType,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [district]);

  // Re-compute decision fusion when weather, diagnosis, or farm updates
  useEffect(() => {
    const dummyDiagnosis: DiseaseDetectionResult = recentDiagnosis || {
      id: "default",
      crop: farm.crop,
      diagnosis: "Early Blight (Alternaria solani)",
      scientificName: "Alternaria solani",
      kinyarwandaName: "Uburwayi bw'Inyanya",
      confidence: 0.88,
      isOOD: false,
      oodScore: 0.04,
      category: "fungal",
      symptoms: ["Target spots"],
      immediateAction: "Prune lower leaves",
      preventativeMeasures: ["Mulch"],
      recommendedOrganicTreatment: "Copper Hydroxide",
      recommendedChemicalTreatment: "Mancozeb",
      safetyAdvice: "7 days PHI",
      agronomistReviewRecommended: false,
    };

    const newAdvice = AIPipelineService.computeDecisionFusion(
      dummyDiagnosis,
      weather,
      farm,
    );
    setAdvice(newAdvice);
  }, [weather, recentDiagnosis, farm]);

  const handleDiagnosisComplete = (result: DiseaseDetectionResult) => {
    setRecentDiagnosis(result);
  };

  const handleEscalateToAgronomist = (result: DiseaseDetectionResult) => {
    const newCase: AgronomistCase = {
      id: `case-${Date.now().toString().slice(-4)}`,
      farmerName: farm.farmerName,
      farmerPhone: farm.farmerPhone,
      district: farm.district,
      crop: result.crop,
      submissionDate: new Date().toISOString().split("T")[0],
      imageUrl:
        "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a49?auto=format&fit=crop&w=600&q=80",
      aiSuggestedDiagnosis: result.diagnosis,
      aiConfidence: result.confidence,
      status: "PENDING_REVIEW",
      agronomistNotes:
        "Farmer initiated high-priority escalation via AgriMind App.",
    };

    setAgronomistCases((prev) => [newCase, ...prev]);
  };

  const handleVerifyCase = (
    caseId: string,
    verifiedDiagnosis: string,
    prescription: string,
  ) => {
    setAgronomistCases((prev) =>
      prev.map((c) =>
        c.id === caseId ?
          {
            ...c,
            status: "VERIFIED",
            verifiedDiagnosis,
            issuedPrescription: prescription,
            agronomistName: "Dr. Alexis Kayiranga (RAB Certified)",
          }
        : c,
      ),
    );
  };

  const handleAddContract = (listing: ForwardContractListing) => {
    setContracts((prev) => [listing, ...prev]);
  };

  const handleReportOutbreak = (newAlert: OutbreakAlert) => {
    setOutbreaks((prev) => [newAlert, ...prev]);
  };

  const isRw = language === "rw";

  return (
    <div
      className='farmer-app-shell'
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--qoder-bg-base)",
        paddingBottom: 28,
      }}>
      {/* FarmerAI workspace navigation */}
      <Navbar
        currentRole={currentRole}
        setRole={(role) => {
          setRole(role);
          if (role === "agronomist") setActiveTab("agronomist");
          else if (role === "developer") setActiveTab("ml-workbench");
          else setActiveTab("dashboard");
        }}
        language={language}
        setLanguage={setLanguage}
        district={district}
        setDistrict={setDistrict}
        activeOutbreakCount={outbreaks.length}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenOutbreaks={() => setActiveTab("surveillance")}
        onOpenUssdModal={() => setUssdModalOpen(true)}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        copilotOpen={copilotOpen}
        toggleCopilot={() => setCopilotOpen(!copilotOpen)}
      />

      {/* Main FarmerAI workspace */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Activity Sidebar (Context & Quests Explorer) */}
        {sidebarOpen && (
          <QoderActivitySidebar
            currentDistrict={district}
            onSelectDistrict={setDistrict}
            farm={farm}
            language={language}
            onSelectTab={setActiveTab}
          />
        )}

        {/* Center Main Editor / Canvas Area */}
        <main
          className='farmer-main'
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            minWidth: 0,
          }}>
          {/* Workspace module tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 16,
              overflowX: "auto",
              paddingBottom: 4,
              borderBottom: "1px dashed var(--border-grid)",
              whiteSpace: "nowrap",
            }}>
            {[
              {
                id: "dashboard",
                fileName: "FarmOverview.tsx",
                label: isRw ? "Ikaze & Incamake" : "Farm Overview",
                icon: Sprout,
              },
              {
                id: "crop-doctor",
                fileName: "CropDoctor.vision",
                label: isRw ? "Gusuzuma Indwara" : "AI Crop Doctor",
                icon: Activity,
              },
              {
                id: "decision-fusion",
                fileName: "DecisionFusion.py",
                label: isRw ? "Umujyanama mu Myanzuro" : "Decision Fusion",
                icon: CloudRain,
              },
              {
                id: "seasonal-planner",
                fileName: "AgroCalendar.season",
                label: isRw ? "Iteganyamurimo (A,B,C)" : "Agro-Calendar",
                icon: Calendar,
              },
              {
                id: "surveillance",
                fileName: "OutbreakRadar.map",
                label: isRw ? "Ikarita y'Ibyorezo" : "Outbreak Radar",
                icon: Radio,
              },
              {
                id: "soil-advisor",
                fileName: "SoilAdvisor.sql",
                label: isRw ? "Ubutaka n'Ifumbire" : "Soil & Lime Advisor",
                icon: FlaskConical,
              },
              {
                id: "marketplace",
                fileName: "MarketPrices.json",
                label: isRw ? "Amasoko n'Ibiciro" : "Market Intelligence",
                icon: Store,
              },
              {
                id: "yield-predictor",
                fileName: "YieldPredictor.py",
                label: isRw ? "Iteganyamururo" : "Yield AI",
                icon: TrendingUp,
              },
              {
                id: "agronomist",
                fileName: "AgronomistTriage.ts",
                label: isRw ? "Agronome Portal" : "Agronomist Triage",
                icon: ShieldCheck,
              },
              {
                id: "ml-workbench",
                fileName: "DeepSeekWorkbench.py",
                label: "ML Architecture",
                icon: Cpu,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: "0",
                    border: "1px solid",
                    borderColor:
                      isActive ? "var(--border-bright)" : "transparent",
                    borderBottomColor:
                      isActive ? "var(--qoder-bg-base)" : "transparent",
                    background: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "var(--text-main)" : "var(--text-muted)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    position: "relative",
                    marginBottom: -1,
                  }}>
                  <Icon
                    size={14}
                    color={isActive ? "var(--primary)" : "currentColor"}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.74rem",
                      color: isActive ? "var(--primary)" : "var(--text-subtle)",
                    }}>
                    {tab.fileName}
                  </span>
                  <span>•</span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className='qoder-dot qoder-dot-violet'
                      style={{ width: 5, height: 5, marginLeft: 4 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hero Farm Status Banner */}
          <HeroFarmStatus
            farm={farm}
            weather={weather}
            advice={advice}
            language={language}
            onScanLeafClick={() => setActiveTab("crop-doctor")}
          />

          {/* Tab Content Rendering */}
          {activeTab === "dashboard" && (
            <div>
              <CropDoctorScanner
                selectedCrop={farm.crop}
                growthStage={farm.growthStage}
                language={language}
                onDiagnosisComplete={handleDiagnosisComplete}
                onEscalateToAgronomist={handleEscalateToAgronomist}
              />

              <AgronomicAdvisorCard
                advice={advice}
                weather={weather}
                farm={farm}
                language={language}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 20,
                }}>
                <SurveillanceMap
                  outbreaks={outbreaks}
                  currentDistrict={district}
                  language={language}
                  onSelectDistrict={setDistrict}
                  onReportOutbreak={handleReportOutbreak}
                />
              </div>
            </div>
          )}

          {activeTab === "crop-doctor" && (
            <CropDoctorScanner
              selectedCrop={farm.crop}
              growthStage={farm.growthStage}
              language={language}
              onDiagnosisComplete={handleDiagnosisComplete}
              onEscalateToAgronomist={handleEscalateToAgronomist}
            />
          )}

          {activeTab === "decision-fusion" && (
            <AgronomicAdvisorCard
              advice={advice}
              weather={weather}
              farm={farm}
              language={language}
            />
          )}

          {activeTab === "seasonal-planner" && (
            <SeasonalAgroPlanner
              farm={farm}
              weather={weather}
              language={language}
            />
          )}

          {activeTab === "surveillance" && (
            <SurveillanceMap
              outbreaks={outbreaks}
              currentDistrict={district}
              language={language}
              onSelectDistrict={setDistrict}
              onReportOutbreak={handleReportOutbreak}
            />
          )}

          {activeTab === "soil-advisor" && (
            <SoilAdvisor farm={farm} language={language} />
          )}

          {activeTab === "marketplace" && (
            <Marketplace
              prices={marketPrices}
              contracts={contracts}
              language={language}
              onAddContract={handleAddContract}
            />
          )}

          {activeTab === "yield-predictor" && (
            <YieldPredictor farm={farm} language={language} />
          )}

          {activeTab === "agronomist" && (
            <AgronomistPortal
              cases={agronomistCases}
              language={language}
              onVerifyCase={handleVerifyCase}
            />
          )}

          {activeTab === "ml-workbench" && <MLWorkbench language={language} />}
        </main>

        {/* Right Sidebar: Qoder Agentic Co-Pilot */}
        <QoderAgenticCopilot
          farm={farm}
          weather={weather}
          recentDiagnosis={recentDiagnosis}
          language={language}
          isOpen={copilotOpen}
          onToggle={() => setCopilotOpen(!copilotOpen)}
          activeModel={activeModel}
        />
      </div>

      {/* Qoder IDE Bottom Status Bar */}
      <QoderStatusBar
        district={district}
        weather={weather}
        activeModel={activeModel}
      />

      {/* Floating Voice Assistant Trigger button */}
      <button
        onClick={() => setVoiceModalOpen(true)}
        style={{
          position: "fixed",
          bottom: 40,
          right: copilotOpen ? 355 : 24,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
          border: "none",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.45)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 90,
          transition: "all 0.2s",
        }}
        title='Open Voice Agricultural Assistant'
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}>
        <Mic size={22} />
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        farm={farm}
        weather={weather}
        recentDiagnosis={recentDiagnosis}
        language={language}
      />

      {/* Offline USSD Feature Phone Simulator Modal */}
      <UssdFeaturePhoneModal
        isOpen={ussdModalOpen}
        onClose={() => setUssdModalOpen(false)}
        farm={farm}
        weather={weather}
        language={language}
      />
    </div>
  );
}

export default App;
