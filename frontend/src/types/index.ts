export type Language = 'en' | 'rw' | 'fr';

export type UserRole = 'farmer' | 'agronomist' | 'developer';

export type RwandaDistrict =
  | 'Muhanga'
  | 'Musanze'
  | 'Ruhango'
  | 'Huye'
  | 'Nyabihu'
  | 'Rubavu'
  | 'Nyagatare'
  | 'Bugesera'
  | 'Kicukiro'
  | 'Gakenke'
  | 'Nyamagabe'
  | 'Rwamagana';

export type CropType =
  | 'Tomatoes'
  | 'Maize'
  | 'Irish Potatoes'
  | 'Climbing Beans'
  | 'Cassava'
  | 'Coffee';

export type GrowthStage =
  | 'Germination'
  | 'Vegetative'
  | 'Flowering'
  | 'Fruit Setting / Tubering'
  | 'Maturity / Ripening'
  | 'Harvest Ready';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface FarmProfile {
  id: string;
  farmerName: string;
  farmerPhone: string;
  district: RwandaDistrict;
  sector: string;
  altitudeMeters: number;
  crop: CropType;
  variety: string;
  plantingDate: string;
  fieldSizeHectares: number;
  growthStage: GrowthStage;
  soilType: 'Volcanic' | 'Ferralsol' | 'Clay Loam' | 'Sandy Loam';
  irrigationMethod: 'Rain-fed' | 'Drip' | 'Furrow' | 'Manual Watering';
}

export interface DiseaseDetectionResult {
  id: string;
  crop: CropType;
  diagnosis: string;
  scientificName: string;
  kinyarwandaName: string;
  confidence: number; // 0 to 1
  isOOD: boolean; // Out of distribution / non-leaf image
  oodScore: number;
  category: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency' | 'healthy';
  symptoms: string[];
  immediateAction: string;
  preventativeMeasures: string[];
  recommendedOrganicTreatment: string;
  recommendedChemicalTreatment: string;
  safetyAdvice: string;
  agronomistReviewRecommended: boolean;
  boundingBoxes?: Array<{ x: number; y: number; width: number; height: number; label: string; confidence: number }>;
}

export interface PestDetectionResult {
  pestName: string;
  scientificName: string;
  kinyarwandaName: string;
  severity: 'mild' | 'moderate' | 'severe';
  affectedAreaPercentage: number;
  recommendedIntervention: string;
  trapLureType?: string;
}

export interface WeatherData {
  district: RwandaDistrict;
  tempCelsius: number;
  humidityPercentage: number;
  rainChance24h: number;
  expectedRainfallMm: number;
  windSpeedKmh: number;
  soilMoisturePercentage: number;
  soilTempCelsius: number;
  uvIndex: number;
  forecastSummary: string;
  sporeGerminationIndex: number; // 0 - 100
  leafWetnessHours: number;
  isRainExpectedNext24h: boolean;
}

export interface DecisionFusionAdvice {
  riskLevel: RiskLevel;
  irrigationAdvice: {
    action: 'DO_NOT_IRRIGATE' | 'IRRIGATE_LIGHTLY' | 'NORMAL_IRRIGATION' | 'DELAY_24H';
    headline: string;
    headlineRw: string;
    reason: string;
  };
  sprayAdvice: {
    isSafeToSpray: boolean;
    headline: string;
    headlineRw: string;
    explanation: string;
    bestWindow: string;
  };
  drainageWarning: boolean;
  agronomicSummary: string;
  agronomicSummaryRw: string;
}

export interface OutbreakAlert {
  id: string;
  district: RwandaDistrict;
  coordinates: [number, number]; // [lat, lng]
  crop: CropType;
  diseaseOrPest: string;
  severity: RiskLevel;
  reportedCasesCount: number;
  lastReportedHoursAgo: number;
  radiusKm: number;
  advisoryNote: string;
}

export interface AgronomistCase {
  id: string;
  farmerName: string;
  farmerPhone: string;
  district: RwandaDistrict;
  crop: CropType;
  submissionDate: string;
  imageUrl: string;
  aiSuggestedDiagnosis: string;
  aiConfidence: number;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  agronomistNotes?: string;
  verifiedDiagnosis?: string;
  issuedPrescription?: string;
  agronomistName?: string;
}

export interface SoilTestRecord {
  pH: number;
  nitrogenMgKg: number;
  phosphorusMgKg: number;
  potassiumMgKg: number;
  organicMatterPct: number;
  recommendations: {
    limeRequiredKgHa: number;
    dapKgHa: number;
    ureaKgHa: number;
    npkKgHa: number;
    suitableCrops: string[];
    soilHealthRating: 'Acidic - High Need of Lime' | 'Optimal' | 'Depleted N' | 'Balanced';
  };
}

export interface MarketPriceItem {
  commodity: string;
  variety: string;
  marketName: string;
  district: RwandaDistrict;
  pricePerKgRwf: number;
  previousPriceRwf: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  lastUpdated: string;
}

export interface ForwardContractListing {
  id: string;
  farmerName: string;
  district: RwandaDistrict;
  crop: CropType;
  variety: string;
  availableKg: number;
  harvestDate: string;
  askingPricePerKgRwf: number;
  contactNumber: string;
  isVerifiedSmallholder: boolean;
}
