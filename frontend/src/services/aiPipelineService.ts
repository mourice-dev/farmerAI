import {
  CropType,
  DecisionFusionAdvice,
  DiseaseDetectionResult,
  FarmProfile,
  Language,
  RiskLevel,
  WeatherData,
} from '../types';
import { DIAGNOSTIC_SAMPLES } from '../data/mockData';

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  audioText?: string;
}

export class AIPipelineService {
  /**
   * Simulates inference of an EfficientNet-B4 / MobileNetV2 Vision model
   * with an Out-of-Distribution (OOD) filter head.
   */
  public static async analyzeCropImage(
    imageSrc: string,
    selectedCrop: CropType,
    growthStage: string
  ): Promise<DiseaseDetectionResult> {
    // Artificial latency simulating edge or server ONNX inference
    await new Promise((resolve) => setTimeout(resolve, 850));

    // Check if the user selected one of the curated diagnostic samples
    const matchedSample = DIAGNOSTIC_SAMPLES.find(
      (s) => s.imageUrl === imageSrc || imageSrc.includes(s.id)
    );

    if (matchedSample) {
      return {
        ...matchedSample.result,
        crop: selectedCrop || (matchedSample.result.crop as CropType),
      };
    }

    // Heuristic inference for custom uploaded images
    const isLikelyEarlyBlight = selectedCrop === 'Tomatoes';
    const isLikelyLateBlight = selectedCrop === 'Irish Potatoes';
    const isLikelyArmyworm = selectedCrop === 'Maize';
    const isLikelyAnthracnose = selectedCrop === 'Climbing Beans';

    if (isLikelyEarlyBlight) {
      return {
        id: `custom-diag-${Date.now()}`,
        crop: 'Tomatoes',
        diagnosis: 'Early Blight (Alternaria solani)',
        scientificName: 'Alternaria solani',
        kinyarwandaName: "Uburwayi bw'Inyanya (Imvura y'Umukara)",
        confidence: 0.88,
        isOOD: false,
        oodScore: 0.05,
        category: 'fungal',
        symptoms: [
          'Concentric dark rings resembling target spots on lower foliage',
          'Yellowing halo around necrotic spots indicating toxin diffusion',
          'Stem collar cankers near soil boundary',
        ],
        immediateAction:
          'Remove infected bottom leaves immediately. Ensure pruners are disinfected with 70% alcohol between cuts.',
        preventativeMeasures: [
          'Mulch with dry straw to eliminate soil-spore splashing during rainfall',
          'Adopt drip irrigation instead of splashing overhead watering',
        ],
        recommendedOrganicTreatment: 'Copper Hydroxide spray (Kocide 2000) or fermented stinging nettle bio-fungicide.',
        recommendedChemicalTreatment: 'Mancozeb 80% WP or Azoxystrobin (Amistar) at 7-day intervals.',
        safetyAdvice: 'Wear personal protective equipment (PPE). Do not harvest within 7 days of chemical spray.',
        agronomistReviewRecommended: false,
        boundingBoxes: [
          { x: 28, y: 32, width: 44, height: 38, label: 'Early Blight Spot', confidence: 0.89 },
        ],
      };
    }

    if (isLikelyLateBlight) {
      return {
        id: `custom-diag-${Date.now()}`,
        crop: 'Irish Potatoes',
        diagnosis: 'Late Blight (Phytophthora infestans)',
        scientificName: 'Phytophthora infestans',
        kinyarwandaName: "Kigori cy'Ibirayi (Late Blight)",
        confidence: 0.93,
        isOOD: false,
        oodScore: 0.03,
        category: 'fungal',
        symptoms: [
          'Water-soaked dark lesions rapidly expanding across leaflet tips',
          'Delicate white fungal sporulation under leaves during damp conditions',
        ],
        immediateAction: 'Urgently apply systemic fungicide. High epidemic potential under current humidity.',
        preventativeMeasures: [
          'Use certified RAB disease-tolerant seed (Kinigi / Victoria)',
          'Ensure high earthing-up of potato ridges to shield tubers',
        ],
        recommendedOrganicTreatment: 'Bordeaux mixture (copper sulfate + slaked lime) preventative spray.',
        recommendedChemicalTreatment: 'Ridomil Gold MZ (Metalaxyl-M + Mancozeb) curative treatment.',
        safetyAdvice: 'Extremely aggressive in Rwanda volcanic zones (Musanze, Nyabihu). Act within 24 hours.',
        agronomistReviewRecommended: false,
        boundingBoxes: [
          { x: 22, y: 25, width: 55, height: 50, label: 'Water-Soaked Lesion', confidence: 0.94 },
        ],
      };
    }

    if (isLikelyArmyworm) {
      return {
        id: `custom-diag-${Date.now()}`,
        crop: 'Maize',
        diagnosis: 'Fall Armyworm Damage (Spodoptera frugiperda)',
        scientificName: 'Spodoptera frugiperda',
        kinyarwandaName: 'Nkongwa Idasanzwe (Fall Armyworm)',
        confidence: 0.86,
        isOOD: false,
        oodScore: 0.06,
        category: 'pest',
        symptoms: [
          'Window-pane leaf skeletonizing and deep whorl chewing holes',
          'Fresh yellowish frass (caterpillar droppings) inside leaf funnel',
        ],
        immediateAction: 'Apply ash or sand mixed with chili in whorls, or targeted bio-pesticide.',
        preventativeMeasures: [
          'Push-Pull intercropping with Desmodium repelling moths',
          'Frequent field scouting during early vegetative stage',
        ],
        recommendedOrganicTreatment: 'Neem oil or Bacillus thuringiensis (Bt) direct whorl application.',
        recommendedChemicalTreatment: 'Emamectin Benzoate (Attack) or Spinetoram.',
        safetyAdvice: 'Government monitored pest. Report high infestation to sector agronomist.',
        agronomistReviewRecommended: true,
        boundingBoxes: [
          { x: 35, y: 30, width: 35, height: 40, label: 'Whorl Feeding Frass', confidence: 0.87 },
        ],
      };
    }

    // Generic healthy/mild leaf spot
    return {
      id: `custom-diag-${Date.now()}`,
      crop: selectedCrop,
      diagnosis: 'Cercospora Leaf Spot (Moderate)',
      scientificName: 'Cercospora spp.',
      kinyarwandaName: 'Ibibabi bifite ibibara bya Cercospora',
      confidence: 0.82,
      isOOD: false,
      oodScore: 0.07,
      category: 'fungal',
      symptoms: ['Small circular spots with light gray centers and dark reddish margins'],
      immediateAction: 'Improve canopy aeration and weed competition.',
      preventativeMeasures: ['Crop rotation and clean field sanitation'],
      recommendedOrganicTreatment: 'Copper Hydroxide or bio-fungicide',
      recommendedChemicalTreatment: 'Mancozeb preventative spray',
      safetyAdvice: 'Observe pre-harvest withholding intervals.',
      agronomistReviewRecommended: false,
      boundingBoxes: [
        { x: 30, y: 35, width: 40, height: 35, label: 'Cercospora Spot', confidence: 0.82 },
      ],
    };
  }

  /**
   * Post-Harvest Quality & Grading Analyzer
   */
  public static async analyzePostHarvestQuality(
    crop: CropType
  ): Promise<{
    gradeA: number;
    gradeB: number;
    damaged: number;
    shelfLifeDays: number;
    recommendation: string;
    recommendationRw: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (crop === 'Tomatoes') {
      return {
        gradeA: 65,
        gradeB: 25,
        damaged: 10,
        shelfLifeDays: 5,
        recommendation:
          'Sort immediately: Sell Grade A (firm, unblemished) to Kigali retail/restaurants for premium price (950 RWF/kg). Direct 10% damaged/overripe produce to tomato paste/sauce processing or local quick-sale.',
        recommendationRw:
          'Vangura ubu: Gura Grade A ku mahoteli n\'amasoko ya Kigali (950 RWF/kg). Ibyangiritse (10%) bihite bitunganywamo isosi cyangwa bigurishwe byihuse.',
      };
    }

    return {
      gradeA: 78,
      gradeB: 18,
      damaged: 4,
      shelfLifeDays: 28,
      recommendation:
        'Cure tubers in well-ventilated shade (15-20°C) for 10 days to allow skin hardening before sacking. Store on wooden pallets off bare ground.',
      recommendationRw:
        'Kanimba ibirayi mu gicucu kirimo umwuka iminsi 10 kugira ngo uruhu rukomere mbere yo kubipakira mu mifuka.',
    };
  }

  /**
   * The Agronomic Rule & Decision Fusion Engine
   * Combines: Vision Diagnosis + Weather Forecast + Farm Stage + Altitude + Soil.
   */
  public static computeDecisionFusion(
    diagnosis: DiseaseDetectionResult,
    weather: WeatherData,
    farm: FarmProfile
  ): DecisionFusionAdvice {
    const isFungal = diagnosis.category === 'fungal';
    const rainExpected = weather.isRainExpectedNext24h;
    const highHumidity = weather.humidityPercentage >= 78;
    const isFloweringOrFruiting =
      farm.growthStage === 'Flowering' || farm.growthStage === 'Fruit Setting / Tubering';

    // Risk evaluation
    let riskLevel: RiskLevel = 'low';
    if (isFungal && (rainExpected || highHumidity)) {
      riskLevel = 'high';
      if (weather.sporeGerminationIndex > 80 && isFloweringOrFruiting) {
        riskLevel = 'critical';
      }
    } else if (diagnosis.category === 'pest') {
      riskLevel = 'high';
    } else if (diagnosis.category === 'healthy') {
      riskLevel = 'low';
    } else {
      riskLevel = 'moderate';
    }

    // Irrigation logic
    let irrigationAction: DecisionFusionAdvice['irrigationAdvice']['action'] = 'NORMAL_IRRIGATION';
    let irrigationHeadline = 'Normal Irrigation Routine';
    let irrigationHeadlineRw = 'Kuhira Bisanzwe';
    let irrigationReason = 'Soil moisture is in balance with current evaporation rates.';

    if (rainExpected) {
      irrigationAction = 'DO_NOT_IRRIGATE';
      irrigationHeadline = "Don't Irrigate Today (Rain Expected)";
      irrigationHeadlineRw = 'Ntukuhire Uyu Munsi (Imvura Iraza)';
      irrigationReason = `Upcoming rainfall (${weather.expectedRainfallMm}mm) will supply sufficient root moisture. Over-watering will exacerbate ${diagnosis.diagnosis} and cause root asphyxiation.`;
    } else if (weather.soilMoisturePercentage < 25) {
      irrigationAction = 'IRRIGATE_LIGHTLY';
      irrigationHeadline = 'Light Morning Furrow/Drip Irrigation';
      irrigationHeadlineRw = 'Kuhira buhoro mu gitondo';
      irrigationReason = 'Soil moisture is depleted. Apply water directly to roots, never on leaf foliage.';
    }

    // Spray logic
    let isSafeToSpray = true;
    let sprayHeadline = 'Favorable Spray Window Open';
    let sprayHeadlineRw = 'Igihe cyo gutera umuti kirakwiye';
    let sprayExplanation = 'Winds are calm and foliage is dry. Ideal conditions for contact bio-fungicide.';
    let bestWindow = 'Tomorrow morning between 06:30 - 09:30 AM (after dew evaporates).';

    if (rainExpected && weather.rainChance24h > 60) {
      isSafeToSpray = false;
      sprayHeadline = 'Avoid Spraying Today (Rain Washout Risk)';
      sprayHeadlineRw = 'Wikoresha Umuti Uyu Munsi (Imvura Yawuhagira)';
      sprayExplanation = `Rainfall expected within 24h will wash off chemical/organic foliar treatments before uptake. Delay spray until tomorrow after rainfall ceases and leaves dry.`;
      bestWindow = 'Wait 18-24 hours until rain passes and canopy surface is dry.';
    }

    // Summary text
    const agronomicSummary = `District ${farm.district} (${farm.altitudeMeters}m alt): Conditions are ${
      highHumidity ? 'warm & humid' : 'mild'
    }. Fungal spore transmission risk is currently ${riskLevel.toUpperCase()}. Priority: Prune diseased lower canopy and protect clean growth.`;

    const agronomicSummaryRw = `Akarere ka ${farm.district} (${farm.altitudeMeters}m): Ikirere gifite ubuhehere bwo hejuru (${weather.humidityPercentage}%). Ibyago byo gukwirakwira kw'indwara ni ${
      riskLevel === 'high' || riskLevel === 'critical' ? 'BIHEJURU CYANE' : 'BILINGANIJE'
    }. Witera umuti uyu munsi kubera imvura, shyira imbaraga mu gusukura ibibabi byanduye.`;

    return {
      riskLevel,
      irrigationAdvice: {
        action: irrigationAction,
        headline: irrigationHeadline,
        headlineRw: irrigationHeadlineRw,
        reason: irrigationReason,
      },
      sprayAdvice: {
        isSafeToSpray,
        headline: sprayHeadline,
        headlineRw: sprayHeadlineRw,
        explanation: sprayExplanation,
        bestWindow,
      },
      drainageWarning: rainExpected && weather.expectedRainfallMm > 15,
      agronomicSummary,
      agronomicSummaryRw,
    };
  }

  /**
   * Context-Grounded Agricultural LLM / RAG Agent
   * Responds in Kinyarwanda, English, or French with localized agronomic rigor.
   */
  public static async queryAgriAssistant(
    userMessage: string,
    farm: FarmProfile,
    recentDiagnosis: DiseaseDetectionResult | null,
    weather: WeatherData,
    lang: Language
  ): Promise<ChatMessage> {
    await new Promise((resolve) => setTimeout(resolve, 750));

    const msgLower = userMessage.toLowerCase();
    let reply = '';
    let suggestedActions: string[] = [];

    // Kinyarwanda questions or responses
    if (lang === 'rw' || msgLower.includes('imvura') || msgLower.includes('ibigori') || msgLower.includes('inyanya') || msgLower.includes('umufumbire') || msgLower.includes('ibirayi')) {
      if (msgLower.includes('imvura') || msgLower.includes('kuhira')) {
        reply = `Muraho ${farm.farmerName}! Ikirere cy'i ${farm.district} kigaragaza ko imvura ifite amahirwe ya ${weather.rainChance24h}% yo kugwa mu masaha 24 ari imbere (${weather.expectedRainfallMm}mm). Inama y'ubuhinzi: NTUKUHIRE uyu munsi kuko ubutaka bufite ubuhehere bwa ${weather.soilMoisturePercentage}%. Niba ufite inyanya, genzura ko amazi afite aho anyura atidika mu murima.`;
        suggestedActions = ['Genzura imiyoboro y\'amazi', 'Reba uburwayi bw\'ibibabi', 'Hagarika kuhira'];
      } else if (msgLower.includes('umuti') || msgLower.includes('gutera') || msgLower.includes('blight') || msgLower.includes('ibibabi')) {
        reply = `Ku bibabi by'${farm.crop}, niba ubonye ibibara by'umukara bifite uruziga rw'umuhondo (Early/Late Blight), wikoresha umuti uyu munsi kubera imvura. Kuraho amashami yanduye yo hasi, maze ejo mu gitondo imvura imaze guhita utere Mancozeb cyangwa Kocide 2000 ku bibabi byumutse.`;
        suggestedActions = ['Kuraho amashami yanduye', 'Tegereza izuba ejo', 'Hamagara Agronome'];
      } else if (msgLower.includes('umufumbire') || msgLower.includes('dap') || msgLower.includes('urea') || msgLower.includes('npk')) {
        reply = `Ku murima wawe wa ${farm.fieldSizeHectares} ha i ${farm.district}: Ubutaka bwawe busaba DAP (50kg) mu itera, hagakurikiraho Urea (30kg) mu gihe ibihingwa bimaze kugera ku ntera y'amavi. Kuko ubutaka bwo muri aka karere busharira (acidic), tanga n'ingwa y'ifu (chaux/travertine) 150kg kugira ngo umusaruro wiyongere.`;
        suggestedActions = ['Bara umufumbire ukenewe', 'Reba ibiciro by\'ifumbire'];
      } else {
        reply = `Muraho Jean-Pierre! Ndi umufasha wawe mu buhinzi bwa ${farm.crop} i ${farm.district}. Nshobora kugufasha kumenya indwara z'ibihingwa, igihe cyiza cyo gutera ifumbire n'umuti, n'uko ikirere giteye. Ni iki wifuza ko tuganiraho?`;
        suggestedActions = ['Ese imvura iragwa ejo?', 'Uko nakwita ku nyanya zanjye', 'Bara umusaruro nteganya'];
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions,
        audioText: reply,
      };
    }

    // English responses
    if (msgLower.includes('rain') || msgLower.includes('weather') || msgLower.includes('irrigate')) {
      reply = `In ${farm.district}, there is a ${weather.rainChance24h}% chance of rain within the next 24 hours (approx ${weather.expectedRainfallMm}mm expected). **Recommendation:** Suspend irrigation today. High humidity (${weather.humidityPercentage}%) increases fungal spore pressure, so monitor drainage ditches.`;
      suggestedActions = ['Check Soil Moisture', 'Inspect Lower Leaves', 'View Spray Window'];
    } else if (msgLower.includes('disease') || msgLower.includes('blight') || msgLower.includes('spray') || msgLower.includes('treatment')) {
      const diagName = recentDiagnosis?.diagnosis || 'Fungal Blight';
      reply = `For ${farm.crop} showing signs of ${diagName}:
1. **Immediate Cultural Action:** Prune diseased lower foliage (under 30cm) to break spore splash cycle.
2. **Spray Decision:** Do NOT spray systemic fungicide immediately before rain (washout risk). Wait for clear leaf canopy tomorrow morning.
3. **Approved RAB Control:** Apply Mancozeb 80% WP or Copper Hydroxide once foliage dries.`;
      suggestedActions = ['Prune lower leaves', 'Postpone spray 24h', 'Escalate to Agronomist'];
    } else if (msgLower.includes('fertilizer') || msgLower.includes('npk') || msgLower.includes('soil')) {
      reply = `For your ${farm.fieldSizeHectares} hectare plot in ${farm.district} (${farm.soilType} soil):
- **Basal Dressing:** Apply NPK 17-17-17 or DAP at planting (75 kg total).
- **Top Dressing:** Apply Urea (40 kg) split into 2 applications at vegetative and flowering stages.
- **Acidity Control:** Because Rwandan soils often exhibit pH < 5.4, apply 200 kg of agricultural travertine (lime) annually.`;
      suggestedActions = ['Open Soil Advisor', 'Calculate Exact Lime', 'View Seed Guidelines'];
    } else {
      reply = `Hello Jean-Pierre! AgriMind is monitoring your ${farm.crop} field in ${farm.district}. Current disease transmission risk is moderate-to-high due to recent damp microclimates. How can I assist your farm today?`;
      suggestedActions = ["Tomorrow's Weather Advice", 'Scan a Sick Leaf', 'Market Price for Tomatoes'];
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions,
      audioText: reply,
    };
  }
}
