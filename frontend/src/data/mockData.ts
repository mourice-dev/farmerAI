import {
  DiseaseDetectionResult,
  FarmProfile,
  MarketPriceItem,
  OutbreakAlert,
  AgronomistCase,
  ForwardContractListing,
} from '../types';

export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; altitude: number; soilDefault: 'Volcanic' | 'Ferralsol' | 'Clay Loam' }> = {
  Muhanga: { lat: -2.0833, lng: 29.7500, altitude: 1820, soilDefault: 'Clay Loam' },
  Musanze: { lat: -1.5000, lng: 29.6333, altitude: 2200, soilDefault: 'Volcanic' },
  Ruhango: { lat: -2.2167, lng: 29.7833, altitude: 1750, soilDefault: 'Ferralsol' },
  Huye: { lat: -2.6000, lng: 29.7400, altitude: 1720, soilDefault: 'Ferralsol' },
  Nyabihu: { lat: -1.6500, lng: 29.5000, altitude: 2350, soilDefault: 'Volcanic' },
  Rubavu: { lat: -1.6800, lng: 29.3500, altitude: 1500, soilDefault: 'Volcanic' },
  Nyagatare: { lat: -1.3000, lng: 30.3200, altitude: 1400, soilDefault: 'Ferralsol' },
  Bugesera: { lat: -2.1800, lng: 30.0800, altitude: 1350, soilDefault: 'Clay Loam' },
  Kicukiro: { lat: -1.9800, lng: 30.1200, altitude: 1520, soilDefault: 'Clay Loam' },
  Gakenke: { lat: -1.7000, lng: 29.7800, altitude: 1950, soilDefault: 'Clay Loam' },
  Nyamagabe: { lat: -2.4700, lng: 29.5600, altitude: 2100, soilDefault: 'Ferralsol' },
  Rwamagana: { lat: -1.9500, lng: 30.4300, altitude: 1480, soilDefault: 'Ferralsol' },
};

export const INITIAL_FARM: FarmProfile = {
  id: 'farm-rw-001',
  farmerName: 'Jean-Pierre Habimana',
  farmerPhone: '+250 788 123 456',
  district: 'Muhanga',
  sector: 'Nyamabuye',
  altitudeMeters: 1820,
  crop: 'Tomatoes',
  variety: 'Anna F1 Hybrid',
  plantingDate: '2026-08-15',
  fieldSizeHectares: 0.75,
  growthStage: 'Fruit Setting / Tubering',
  soilType: 'Clay Loam',
  irrigationMethod: 'Manual Watering',
};

export interface DiagnosticSample {
  id: string;
  name: string;
  crop: string;
  imageUrl: string;
  thumbnailSvg: string;
  result: DiseaseDetectionResult;
}

export const DIAGNOSTIC_SAMPLES: DiagnosticSample[] = [
  {
    id: 'sample-early-blight',
    name: 'Tomato Leaf with Brown Concentric Rings',
    crop: 'Tomatoes',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a49?auto=format&fit=crop&w=800&q=80',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="%2322c55e"><path d="M60 10 C30 40 20 80 60 110 C100 80 90 40 60 10 Z"/><circle cx="50" cy="55" r="14" fill="%2378350f" opacity="0.85"/><circle cx="50" cy="55" r="8" fill="%23451a03"/><circle cx="70" cy="75" r="10" fill="%2378350f" opacity="0.8"/></svg>`,
    result: {
      id: 'diag-001',
      crop: 'Tomatoes',
      diagnosis: 'Early Blight (Alternaria solani)',
      scientificName: 'Alternaria solani',
      kinyarwandaName: 'Uburwayi bw\'Inyanya (Imvura y\'Umukara)',
      confidence: 0.91,
      isOOD: false,
      oodScore: 0.04,
      category: 'fungal',
      symptoms: [
        'Dark brown circular spots with characteristic concentric rings ("target board" pattern) on older lower leaves',
        'Yellow halo around necrotic lesions spreading outward',
        'Leaf drop leading to premature defoliation and sunscald on green tomato fruits'
      ],
      immediateAction: 'Immediately prune lower infected foliage (below 30cm) to restrict spore splash. Burn or bury infected leaves away from the plot.',
      preventativeMeasures: [
        'Mulch soil surface with clean dry grass to prevent rain-drop spore splashing',
        'Avoid overhead sprinkler or watering can splashing onto foliage; apply water strictly at base',
        'Practice a minimum 3-year crop rotation avoiding Solanaceae (potatoes, peppers, eggplants)'
      ],
      recommendedOrganicTreatment: 'Apply Copper Hydroxide (Kocide 2000) or Bacillus subtilis bio-fungicide once leaves are completely dry.',
      recommendedChemicalTreatment: 'Mancozeb 80% WP (Dithane M-45) or Chlorothalonil before heavy rain forecast, or Azoxystrobin for curative knockdown.',
      safetyAdvice: 'Wear rubber boots, gloves, and face mask when applying fungicides. Observe a 7-day pre-harvest interval (PHI).',
      agronomistReviewRecommended: false,
      boundingBoxes: [
        { x: 35, y: 40, width: 32, height: 30, label: 'Early Blight Target Spot', confidence: 0.94 },
        { x: 62, y: 65, width: 22, height: 24, label: 'Secondary Necrosis', confidence: 0.88 }
      ]
    }
  },
  {
    id: 'sample-maize-fall-armyworm',
    name: 'Maize Whorl with Window-Pane Chewing & Frass',
    crop: 'Maize',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="%2316a34a"><path d="M30 110 C40 60 70 30 100 20 C70 50 60 80 50 110 Z"/><ellipse cx="65" cy="55" rx="10" ry="16" fill="%23d97706" transform="rotate(25 65 55)"/><circle cx="68" cy="62" r="3" fill="%23451a03"/></svg>`,
    result: {
      id: 'diag-002',
      crop: 'Maize',
      diagnosis: 'Fall Armyworm Infestation (Spodoptera frugiperda)',
      scientificName: 'Spodoptera frugiperda',
      kinyarwandaName: 'Nkongwa Idasanzwe (Fall Armyworm)',
      confidence: 0.88,
      isOOD: false,
      oodScore: 0.05,
      category: 'pest',
      symptoms: [
        'Visible "window pane" skeletonized feeding holes on unfolding leaf blades',
        'Large ragged holes in inner whorl accompanied by moist sawdust-like granular frass excrement',
        'Caterpillar hiding deep in central funnel with distinctive inverted Y-mark on head'
      ],
      immediateAction: 'Hand-pick caterpillars in small plots or place a pinch of dry fine sand / wood ash mixed with chili powder into the central whorl.',
      preventativeMeasures: [
        'Intercrop maize with Desmodium (Push-Pull strategy) and Napier grass borders',
        'Scout 20 consecutive plants in 5 field locations twice weekly during vegetative stage',
        'Install pheromone traps to detect adult moth flight spikes across the sector'
      ],
      recommendedOrganicTreatment: 'Neem seed kernel extract (NSKE 5%) or Bacillus thuringiensis (Bt) sprayed directly into central whorls early morning.',
      recommendedChemicalTreatment: 'Emamectin benzoate (e.g., Attack, Spinetoram) or Flubendiamide applied directly into whorls under severe threshold (>20% damaged whorls).',
      safetyAdvice: 'High-risk quarantine pest for Rwanda. If unchecked, can cause up to 60% yield loss across Eastern & Southern Provinces.',
      agronomistReviewRecommended: true,
      boundingBoxes: [
        { x: 42, y: 35, width: 38, height: 42, label: 'Fall Armyworm Frass & Whorl Damage', confidence: 0.91 }
      ]
    }
  },
  {
    id: 'sample-potato-late-blight',
    name: 'Irish Potato Leaf with Water-Soaked Lesions',
    crop: 'Irish Potatoes',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="%2322c55e"><path d="M20 60 C40 20 80 20 100 60 C80 100 40 100 20 60 Z"/><path d="M60 30 C75 45 75 75 60 90 C45 75 45 45 60 30 Z" fill="%231e293b" opacity="0.8"/></svg>`,
    result: {
      id: 'diag-003',
      crop: 'Irish Potatoes',
      diagnosis: 'Late Blight (Phytophthora infestans)',
      scientificName: 'Phytophthora infestans',
      kinyarwandaName: 'Kigori cy\'Ibirayi (Late Blight)',
      confidence: 0.95,
      isOOD: false,
      oodScore: 0.02,
      category: 'fungal',
      symptoms: [
        'Pale green irregular water-soaked spots enlarging rapidly into purplish-brown/black greasy necrotic blotches',
        'Delicate white fluffy mold growth visible on undersides of leaf lesions during high humidity/foggy mornings in Musanze/Nyabihu',
        'Stems developing dark brown lesions resulting in entire canopy collapse and rotten tuber odor'
      ],
      immediateAction: 'Destroy severely blighted foliage immediately before rain showers spread spores to healthy neighboring ridges. Do not throw into compost.',
      preventativeMeasures: [
        'Plant certified RAB resistant varieties (e.g., Kinigi, Victoria, Cruza) in high-altitude volcanic zones',
        'Hill up soil well over potato ridges to prevent spore wash-down onto developing tubers',
        'Avoid working in wet potato fields to prevent mechanical spore dispersal'
      ],
      recommendedOrganicTreatment: 'Copper oxychloride or Bordeaux mixture (1%) preventive sprays before fog/rain onset.',
      recommendedChemicalTreatment: 'Metalaxyl + Mancozeb (Ridomil Gold MZ) for curative systemic protection, alternating with Dimethomorph to prevent fungicide resistance.',
      safetyAdvice: 'In volcanic highlands (Musanze, Nyabihu), Late Blight can devastate a crop in 5-7 days under continuous humidity (>85%).',
      agronomistReviewRecommended: false,
      boundingBoxes: [
        { x: 25, y: 30, width: 45, height: 40, label: 'Late Blight Water-Soaked Blotch', confidence: 0.96 },
        { x: 55, y: 60, width: 30, height: 35, label: 'Leaf Margin Necrosis', confidence: 0.92 }
      ]
    }
  },
  {
    id: 'sample-bean-anthracnose',
    name: 'Climbing Bean Leaf with Dark Vein Necrosis',
    crop: 'Climbing Beans',
    imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="%234ade80"><path d="M60 15 C20 40 20 90 60 110 C100 90 100 40 60 15 Z"/><line x1="60" y1="20" x2="60" y2="105" stroke="%23831843" stroke-width="4"/><line x1="60" y1="50" x2="35" y2="40" stroke="%23831843" stroke-width="3"/><line x1="60" y1="70" x2="85" y2="60" stroke="%23831843" stroke-width="3"/></svg>`,
    result: {
      id: 'diag-004',
      crop: 'Climbing Beans',
      diagnosis: 'Bean Anthracnose (Colletotrichum lindemuthianum)',
      scientificName: 'Colletotrichum lindemuthianum',
      kinyarwandaName: 'Uburwayi bw\'Ibishyimbo (Anthracnose)',
      confidence: 0.89,
      isOOD: false,
      oodScore: 0.04,
      category: 'fungal',
      symptoms: [
        'Dark brick-red to purplish-black discoloration along veins on underside of bean leaves',
        'Sunken, circular cankers with dark reddish borders on pods, containing salmon-pink spore masses in wet conditions',
        'Stunted bean seedlings and blackened hypocotyls causing seedling death'
      ],
      immediateAction: 'Do not harvest or weed while vines are wet. Remove badly infested bean vines and burn them.',
      preventativeMeasures: [
        'Use clean, certified disease-free bean seed (RAB certified RWV climbing bean varieties)',
        'Ensure proper staking with bamboo or Pennisetum stakes to maximize sun penetration and air movement',
        'Rotate away from legumes for at least 2 consecutive agricultural seasons'
      ],
      recommendedOrganicTreatment: 'Hot water seed treatment (50°C for 15 minutes) before planting; spray neem or Trichoderma harzianum.',
      recommendedChemicalTreatment: 'Carbendazim or Mancozeb spray at first sign of flowering before pod formation.',
      safetyAdvice: 'Seed-borne fungal pathogen. Never save seed from infected bean pods for next season.',
      agronomistReviewRecommended: false,
      boundingBoxes: [
        { x: 30, y: 35, width: 40, height: 50, label: 'Vein Necrosis (Anthracnose)', confidence: 0.90 }
      ]
    }
  },
  {
    id: 'sample-healthy-crop',
    name: 'Vibrant Healthy Maize Leaf',
    crop: 'Maize',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="%2322c55e"><path d="M20 100 C30 50 60 20 100 20 C90 60 60 90 20 100 Z"/><line x1="20" y1="100" x2="100" y2="20" stroke="%2315803d" stroke-width="2"/></svg>`,
    result: {
      id: 'diag-005',
      crop: 'Maize',
      diagnosis: 'Healthy Crop (No Disease or Pest Detected)',
      scientificName: 'Zea mays (Normal Vigorous Tissue)',
      kinyarwandaName: 'Ibihingwa Bizima (Nta burwayi buhari)',
      confidence: 0.98,
      isOOD: false,
      oodScore: 0.01,
      category: 'healthy',
      symptoms: [
        'Even chlorophyll pigmentation across whole leaf surface with no chlorosis',
        'Strong turgidity and leaf structure with clean margins and no insect chewing',
        'Normal growth elongation matching planting timeline'
      ],
      immediateAction: 'No curative spray required. Continue routine scouting and standard fertilizer top-dressing schedule.',
      preventativeMeasures: [
        'Apply second Urea split top-dressing (50 kg/ha) at knee-high stage (4-6 leaves) right before light rain',
        'Maintain weed-free zone 1 meter around crop perimeter to reduce pest vector pressure',
        'Conserve soil moisture through shallow hoeing or organic mulching'
      ],
      recommendedOrganicTreatment: 'Apply well-decomposed farmyard manure or compost tea as organic foliar nourishment.',
      recommendedChemicalTreatment: 'None required. Avoid prophylactic chemical spraying to preserve beneficial predatory insects (ladybugs, parasitoid wasps).',
      safetyAdvice: 'Excellent crop vigor. Continue bi-weekly scouting.',
      agronomistReviewRecommended: false,
    }
  }
];

export const MOCK_OUTBREAKS: OutbreakAlert[] = [
  {
    id: 'outbreak-01',
    district: 'Muhanga',
    coordinates: [-2.0833, 29.7500],
    crop: 'Tomatoes',
    diseaseOrPest: 'Early Blight (Alternaria solani)',
    severity: 'high',
    reportedCasesCount: 19,
    lastReportedHoursAgo: 3,
    radiusKm: 15,
    advisoryNote: 'Cluster alert in Nyamabuye and Cyeza sectors. 85% relative humidity and night showers creating prime fungal spore dispersal. Inspect lower foliage within 24h.'
  },
  {
    id: 'outbreak-02',
    district: 'Musanze',
    coordinates: [-1.5000, 29.6333],
    crop: 'Irish Potatoes',
    diseaseOrPest: 'Late Blight (Phytophthora infestans)',
    severity: 'critical',
    reportedCasesCount: 34,
    lastReportedHoursAgo: 1,
    radiusKm: 25,
    advisoryNote: 'Volcanic foothills experiencing sustained morning mist and temperature between 16-21°C. High risk of epidemic defoliation on Kinigi variety. Apply protective fungicide promptly.'
  },
  {
    id: 'outbreak-03',
    district: 'Nyagatare',
    coordinates: [-1.3000, 30.3200],
    crop: 'Maize',
    diseaseOrPest: 'Fall Armyworm (Spodoptera frugiperda)',
    severity: 'high',
    reportedCasesCount: 27,
    lastReportedHoursAgo: 5,
    radiusKm: 20,
    advisoryNote: 'Moth flight spike recorded by sector traps. Second instar larvae migrating into maize whorls. Inspect central leaves for windowing.'
  },
  {
    id: 'outbreak-04',
    district: 'Ruhango',
    coordinates: [-2.2167, 29.7833],
    crop: 'Cassava',
    diseaseOrPest: 'Cassava Brown Streak Disease (CBSD)',
    severity: 'moderate',
    reportedCasesCount: 8,
    lastReportedHoursAgo: 12,
    radiusKm: 18,
    advisoryNote: 'Whitefly vector activity elevated in valley bottoms. Isolate symptomatic stems with feathery yellow vein chlorosis.'
  },
  {
    id: 'outbreak-05',
    district: 'Huye',
    coordinates: [-2.6000, 29.7400],
    crop: 'Coffee',
    diseaseOrPest: 'Coffee Leaf Rust (Hemileia vastatrix)',
    severity: 'moderate',
    reportedCasesCount: 14,
    lastReportedHoursAgo: 8,
    radiusKm: 16,
    advisoryNote: 'Orange powdery spots emerging on lower leaf surfaces of Bourbon coffee trees on hillsides.'
  }
];

export const MOCK_MARKET_PRICES: MarketPriceItem[] = [
  {
    commodity: 'Tomatoes (Fresh)',
    variety: 'Anna F1 / Roma',
    marketName: 'Kimironko Market',
    district: 'Kicukiro',
    pricePerKgRwf: 950,
    previousPriceRwf: 850,
    trend: 'up',
    unit: 'kg',
    lastUpdated: 'Today, 09:30'
  },
  {
    commodity: 'Tomatoes (Fresh)',
    variety: 'Anna F1',
    marketName: 'Nyabugogo Central',
    district: 'Kicukiro',
    pricePerKgRwf: 880,
    previousPriceRwf: 890,
    trend: 'stable',
    unit: 'kg',
    lastUpdated: 'Today, 08:45'
  },
  {
    commodity: 'Irish Potatoes',
    variety: 'Kinigi (Grade A)',
    marketName: 'Musanze Modern Market',
    district: 'Musanze',
    pricePerKgRwf: 520,
    previousPriceRwf: 480,
    trend: 'up',
    unit: 'kg',
    lastUpdated: 'Today, 10:15'
  },
  {
    commodity: 'Maize Grain',
    variety: 'White Hybrid (Grade 1)',
    marketName: 'Nyagatare Grain Hub',
    district: 'Nyagatare',
    pricePerKgRwf: 460,
    previousPriceRwf: 490,
    trend: 'down',
    unit: 'kg',
    lastUpdated: 'Yesterday'
  },
  {
    commodity: 'Climbing Beans',
    variety: 'RWV 1129 Red',
    marketName: 'Muhanga Market',
    district: 'Muhanga',
    pricePerKgRwf: 1100,
    previousPriceRwf: 1050,
    trend: 'up',
    unit: 'kg',
    lastUpdated: 'Today, 07:20'
  },
  {
    commodity: 'Cassava Fresh Roots',
    variety: 'Ndamirabana',
    marketName: 'Ruhango Market',
    district: 'Ruhango',
    pricePerKgRwf: 380,
    previousPriceRwf: 380,
    trend: 'stable',
    unit: 'kg',
    lastUpdated: 'Today, 06:50'
  }
];

export const MOCK_FORWARD_CONTRACTS: ForwardContractListing[] = [
  {
    id: 'fwd-001',
    farmerName: 'Jean-Pierre Habimana',
    district: 'Muhanga',
    crop: 'Tomatoes',
    variety: 'Anna F1',
    availableKg: 650,
    harvestDate: '2026-10-15',
    askingPricePerKgRwf: 850,
    contactNumber: '+250 788 123 456',
    isVerifiedSmallholder: true
  },
  {
    id: 'fwd-002',
    farmerName: 'Marie Claire Uwera',
    district: 'Musanze',
    crop: 'Irish Potatoes',
    variety: 'Kinigi Premium',
    availableKg: 2500,
    harvestDate: '2026-10-22',
    askingPricePerKgRwf: 500,
    contactNumber: '+250 783 999 111',
    isVerifiedSmallholder: true
  },
  {
    id: 'fwd-003',
    farmerName: 'Cooperative Tuzamurane',
    district: 'Nyagatare',
    crop: 'Maize',
    variety: 'Pannar White',
    availableKg: 8000,
    harvestDate: '2026-11-05',
    askingPricePerKgRwf: 440,
    contactNumber: '+250 781 555 777',
    isVerifiedSmallholder: true
  }
];

export const MOCK_AGRONOMIST_CASES: AgronomistCase[] = [
  {
    id: 'case-901',
    farmerName: 'Emile Ndayisaba',
    farmerPhone: '+250 788 444 333',
    district: 'Muhanga',
    crop: 'Tomatoes',
    submissionDate: '2026-09-28',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a49?auto=format&fit=crop&w=600&q=80',
    aiSuggestedDiagnosis: 'Early Blight (Alternaria solani)',
    aiConfidence: 0.67,
    status: 'PENDING_REVIEW',
    agronomistNotes: 'Low AI confidence flagged due to partial leaf occlusion. Awaiting agronomist confirmation.'
  },
  {
    id: 'case-902',
    farmerName: 'Vestine Mukamana',
    farmerPhone: '+250 782 121 212',
    district: 'Musanze',
    crop: 'Irish Potatoes',
    submissionDate: '2026-09-29',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    aiSuggestedDiagnosis: 'Late Blight (Phytophthora infestans)',
    aiConfidence: 0.94,
    status: 'VERIFIED',
    agronomistNotes: 'Confirmed classic Late Blight water-soaked margin. Issued official prescription for Ridomil Gold.',
    verifiedDiagnosis: 'Late Blight (Phytophthora infestans)',
    issuedPrescription: 'Apply Ridomil Gold MZ 68 WG at 2.5 kg/ha immediately. Re-inspect plot in 5 days. Ensure full ridge coverage.',
    agronomistName: 'Dr. Alexis Kayiranga (RAB Certified Agronomist)'
  }
];
