"""
disease_knowledge.py — Complete Plant Disease Prevention & Treatment Knowledge Base
====================================================================================
Covers all 38 PlantVillage classes with scientifically-backed advice for farmers.
Each entry includes: description, symptoms, cause, prevention, treatment,
spread risk, and urgency level.
"""

DISEASE_DATABASE = {
    # ===== APPLE (4 classes) =====
    "Apple___Apple_scab": {
        "common_name": "Apple Scab",
        "crop": "Apple",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "VERY HIGH — airborne spores spread rapidly in wet weather",
        "cause": "Fungus Venturia inaequalis, thrives in cool, wet spring conditions",
        "symptoms": [
            "Olive-green to dark brown velvety spots on leaves",
            "Scabby, cracked lesions on fruit surface",
            "Premature leaf drop in severe cases",
            "Distorted or stunted fruit growth"
        ],
        "prevention": [
            "Remove and destroy fallen leaves in autumn — this is the #1 action to break the cycle",
            "Plant scab-resistant apple varieties (Liberty, Enterprise, Freedom)",
            "Ensure good air circulation by pruning dense canopy",
            "Avoid overhead irrigation — use drip systems",
            "Apply preventive fungicide sprays BEFORE rainy periods"
        ],
        "treatment": [
            "Spray Mancozeb or Captan during early green tip to petal fall stages",
            "Use myclobutanil (Systhane) for curative action on active infections",
            "Apply copper-based fungicide (Bordeaux mixture) in dormant season",
            "Remove heavily infected branches and destroy them (burn or bag)"
        ],
        "spread_prevention": [
            "DO NOT compost infected leaves — burn or bag them",
            "Sanitize pruning tools between trees with 70% alcohol",
            "Monitor weather: spray before rain events of >6 hours",
            "Isolate heavily infected trees — spores can travel 100+ meters in wind"
        ]
    },

    "Apple___Black_rot": {
        "common_name": "Black Rot",
        "crop": "Apple",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "HIGH — spreads through rain splash and insects",
        "cause": "Fungus Botryosphaeria obtusa, enters through wounds or dead wood",
        "symptoms": [
            "Large brown expanding leaf spots with purple margins ('frog-eye' pattern)",
            "Black, mummified fruit that remain attached to tree",
            "Cankers on limbs — sunken, reddish-brown bark areas",
            "Fruit rot starts at calyx end, turns black and leathery"
        ],
        "prevention": [
            "Remove all mummified fruit from trees and ground immediately",
            "Prune out dead wood and cankers during dry weather",
            "Maintain healthy trees with proper fertilization",
            "Remove wild or abandoned apple trees nearby (they harbor the fungus)"
        ],
        "treatment": [
            "Apply Captan or Thiophanate-methyl fungicides during bloom",
            "Copper sprays in dormant season help reduce inoculum",
            "Cut cankers out — make cuts at least 15cm below visible infection",
            "Paint large pruning wounds with wound sealer"
        ],
        "spread_prevention": [
            "Collect and destroy ALL mummified fruit — each one releases millions of spores",
            "Don't prune during wet weather — wounds need time to seal",
            "Clean orchard floor regularly",
            "Bag and remove all pruned material from the orchard"
        ]
    },

    "Apple___Cedar_apple_rust": {
        "common_name": "Cedar Apple Rust",
        "crop": "Apple",
        "is_disease": True,
        "severity": "MODERATE",
        "spread_risk": "MODERATE — requires both cedar/juniper and apple trees to complete lifecycle",
        "cause": "Fungus Gymnosporangium juniperi-virginianae, alternates between cedar and apple hosts",
        "symptoms": [
            "Bright yellow-orange spots on upper leaf surface",
            "Tiny tube-like projections on leaf undersides",
            "Spots on fruit with similar orange discoloration",
            "Premature leaf and fruit drop"
        ],
        "prevention": [
            "Remove cedar/juniper trees within 2-3 km of your orchard if possible",
            "Plant rust-resistant apple varieties (Redfree, Liberty, Freedom)",
            "Scout for galls on nearby cedar trees in spring and remove them",
            "Apply preventive fungicide from pink bud through 3rd cover spray"
        ],
        "treatment": [
            "Spray myclobutanil (Systhane) or propiconazole at tight cluster stage",
            "Mancozeb works as a protectant before infection",
            "Fenarimol provides both preventive and curative action",
            "Continue protection sprays through 1st and 2nd cover"
        ],
        "spread_prevention": [
            "Eliminating one host (cedar) within range breaks the disease cycle completely",
            "Prune and destroy cedar galls before orange jelly-like horns appear in spring",
            "No apple-to-apple spread occurs — always goes through cedar/juniper first",
            "Monitor weather: infection requires 4-8 hours of wetness at 10-25°C"
        ]
    },

    "Apple___healthy": {
        "common_name": "Healthy Apple",
        "crop": "Apple",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Continue regular monitoring — check leaves weekly during growing season",
            "Maintain balanced fertilization (avoid excess nitrogen)",
            "Ensure proper pruning for air circulation",
            "Apply dormant oil spray in late winter to prevent overwintering pests"
        ],
        "treatment": [],
        "spread_prevention": [
            "Keep monitoring — early detection is the best prevention",
            "Maintain orchard hygiene: clean fallen debris regularly"
        ]
    },

    # ===== BLUEBERRY (1 class) =====
    "Blueberry___healthy": {
        "common_name": "Healthy Blueberry",
        "crop": "Blueberry",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Maintain acidic soil pH (4.5-5.5) for optimal health",
            "Mulch with pine needles or wood chips to retain moisture",
            "Prune old canes annually to encourage new growth",
            "Apply bird netting during fruiting season"
        ],
        "treatment": [],
        "spread_prevention": [
            "Continue regular monitoring for mummy berry and botrytis",
            "Remove any dead or damaged canes promptly"
        ]
    },

    # ===== CHERRY (2 classes) =====
    "Cherry_(including_sour)___Powdery_mildew": {
        "common_name": "Cherry Powdery Mildew",
        "crop": "Cherry",
        "is_disease": True,
        "severity": "MODERATE",
        "spread_risk": "HIGH — airborne spores spread easily in warm, dry conditions",
        "cause": "Fungus Podosphaera clandestina, unlike most fungi thrives in dry weather",
        "symptoms": [
            "White powdery coating on leaf surfaces and young shoots",
            "Leaves curl upward and become distorted",
            "Stunted new growth",
            "Fruit may develop white patches and crack"
        ],
        "prevention": [
            "Ensure good air circulation through proper spacing and pruning",
            "Avoid excessive nitrogen fertilization — it promotes susceptible new growth",
            "Water at the base, not overhead",
            "Plant resistant varieties when available"
        ],
        "treatment": [
            "Apply sulfur-based fungicide at first sign of white patches",
            "Myclobutanil or trifloxystrobin for active infections",
            "Potassium bicarbonate sprays (organic option) can suppress mild cases",
            "Neem oil can help in early stages"
        ],
        "spread_prevention": [
            "Remove and destroy infected shoot tips",
            "Spores travel by wind — you cannot fully contain it, but reducing inoculum helps",
            "Avoid working with wet infected plants — you'll spread spores on clothing/tools",
            "Monitor neighboring cherry and stone fruit trees"
        ]
    },

    "Cherry_(including_sour)___healthy": {
        "common_name": "Healthy Cherry",
        "crop": "Cherry",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Maintain regular pruning schedule for air circulation",
            "Monitor for brown rot, leaf spot, and bacterial canker",
            "Apply copper spray during dormant season as preventive",
            "Manage irrigation to avoid waterlogging"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== CORN / MAIZE (4 classes) =====
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "common_name": "Gray Leaf Spot",
        "crop": "Corn (Maize)",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "VERY HIGH — survives in crop residue, spreads rapidly in humid conditions",
        "cause": "Fungus Cercospora zeae-maydis, overwinters in infected corn debris",
        "symptoms": [
            "Rectangular, gray to tan lesions running parallel to leaf veins",
            "Lesions have distinct parallel edges following veins",
            "Lower leaves affected first, progresses upward",
            "Severe cases: entire leaf blighting and premature death"
        ],
        "prevention": [
            "Rotate crops — do NOT plant corn after corn",
            "Deep plow or bury corn residue after harvest",
            "Plant resistant hybrids (check with local seed suppliers for GLS ratings)",
            "Reduce plant density to improve air flow",
            "Avoid late planting which exposes vulnerable stages to peak spore release"
        ],
        "treatment": [
            "Apply strobilurin fungicides (azoxystrobin) at VT/R1 stage (tasseling/silking)",
            "Triazole fungicides (propiconazole) also effective",
            "Timing is critical — spray when lower leaves show first lesions",
            "One well-timed application can protect yield; two may be needed in severe years"
        ],
        "spread_prevention": [
            "MANDATORY: Till corn residue after harvest — fungus survives 1-2 years in debris",
            "Crop rotation to soybeans or legumes for at least 1 year",
            "Remove volunteer corn plants in fields",
            "Avoid continuous corn farming in humid river valley areas"
        ]
    },

    "Corn_(maize)___Common_rust_": {
        "common_name": "Common Rust",
        "crop": "Corn (Maize)",
        "is_disease": True,
        "severity": "MODERATE",
        "spread_risk": "HIGH — wind-borne spores can travel hundreds of kilometers",
        "cause": "Fungus Puccinia sorghi, requires living host (does not overwinter in temperate zones)",
        "symptoms": [
            "Small, circular to elongated reddish-brown pustules on both leaf surfaces",
            "Pustules break open to release powdery reddish-brown spores",
            "Appears on both upper and lower leaf surfaces",
            "Severe infections cause leaf chlorosis and death"
        ],
        "prevention": [
            "Plant rust-resistant hybrids — this is the most effective strategy",
            "Early planting to avoid peak spore arrival periods",
            "Monitor fields weekly from V8 stage onward",
            "Avoid late planting of sweet corn (most susceptible)"
        ],
        "treatment": [
            "Spray Mancozeb if pustules cover >10% of ear leaf area",
            "Triazole + strobilurin fungicide mix for severe cases",
            "Apply at first sign if susceptible variety and conditions favor spread",
            "One application usually sufficient for common rust"
        ],
        "spread_prevention": [
            "Cannot fully prevent — spores arrive on wind from tropical regions",
            "Resistant hybrids are the primary defense",
            "Early harvest of severely infected fields to prevent spore buildup",
            "Scout neighboring fields and alert other farmers if detected early"
        ]
    },

    "Corn_(maize)___Northern_Leaf_Blight": {
        "common_name": "Northern Leaf Blight",
        "crop": "Corn (Maize)",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "HIGH — residue-borne fungus, spreads with rain splash and wind",
        "cause": "Fungus Exserohilum turcicum (Setosphaeria turcica), survives in corn debris",
        "symptoms": [
            "Long, elliptical, cigar-shaped gray-green to tan lesions (2-15 cm)",
            "Lesions appear first on lower leaves",
            "Severe: entire leaves die, plant appears scorched",
            "Can reduce yield 30-50% if infection starts before tasseling"
        ],
        "prevention": [
            "Plant certified resistant seeds (check for Ht gene resistance ratings)",
            "Deep plow crop debris after harvest to bury fungal spores",
            "Crop rotation — at least 1 year away from corn",
            "Balanced fertilization — stressed plants are more susceptible"
        ],
        "treatment": [
            "Apply fungicide at VT-R1 (tassel to silking) if lesions appear on 3rd leaf below ear",
            "Azoxystrobin + propiconazole combination is highly effective",
            "Scout weekly from V10 and spray when threshold is reached",
            "Do NOT wait until upper leaves are affected — yield loss is already occurring"
        ],
        "spread_prevention": [
            "Deep plow or chop all corn residue — fungus survives 1-2 seasons in debris",
            "Rotate to non-host crops (soybeans, beans, groundnuts)",
            "Alert neighboring farms — coordinated residue management is critical",
            "Avoid overhead irrigation which creates ideal infection conditions"
        ]
    },

    "Corn_(maize)___healthy": {
        "common_name": "Healthy Corn",
        "crop": "Corn (Maize)",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Continue scouting for fall armyworm and stem borers",
            "Maintain balanced NPK fertilization",
            "Ensure proper spacing (75cm × 25cm) for airflow",
            "Practice crop rotation with legumes to fix nitrogen naturally"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== GRAPE (4 classes) =====
    "Grape___Black_rot": {
        "common_name": "Grape Black Rot",
        "crop": "Grape",
        "is_disease": True,
        "severity": "VERY HIGH",
        "spread_risk": "VERY HIGH — rain-splashed spores from mummified berries, can destroy entire crop",
        "cause": "Fungus Guignardia bidwellii, overwinters in mummified berries and infected canes",
        "symptoms": [
            "Tan circular leaf spots with dark brown borders",
            "Tiny black pycnidia (dots) visible within leaf spots",
            "Fruit turns light brown, then shrivels into hard black 'mummies'",
            "Shoot lesions: elongated dark cankers on young canes"
        ],
        "prevention": [
            "CRITICAL: Remove ALL mummified berries from vines AND ground during dormant pruning",
            "Open canopy through proper training and leaf removal for air drying",
            "Begin fungicide program at 12-inch shoot growth",
            "Cultivate under vines to bury fallen mummies"
        ],
        "treatment": [
            "Mancozeb from early shoot growth through 4 weeks after bloom",
            "Switch to myclobutanil or tebuconazole during bloom period",
            "Captan + myclobutanil combination for broad-spectrum protection",
            "Critical spray timings: immediate pre-bloom, bloom, 1st cover, 2nd cover"
        ],
        "spread_prevention": [
            "DESTROY every mummified berry — each one produces 1M+ spores next spring",
            "Remove infected clusters immediately when spotted",
            "Train vines for maximum airflow — infection requires 6+ hours of wetness",
            "Sanitation is MORE important than fungicides for this disease"
        ]
    },

    "Grape___Esca_(Black_Measles)": {
        "common_name": "Grape Esca (Black Measles)",
        "crop": "Grape",
        "is_disease": True,
        "severity": "VERY HIGH",
        "spread_risk": "MODERATE — trunk disease, spreads through pruning wounds",
        "cause": "Complex of fungi (Phaeomoniella, Phaeoacremonium, Fomitiporia), enters through pruning wounds",
        "symptoms": [
            "Tiger-stripe pattern: interveinal chlorosis and necrosis on leaves",
            "Dark spots on berries resembling measles",
            "Sudden vine collapse ('apoplexy') in hot weather",
            "Wood cross-sections show dark streaks and white rot"
        ],
        "prevention": [
            "Protect pruning wounds with wound sealant containing fungicide",
            "Prune during dry weather only — avoid rainy or foggy days",
            "Delay pruning as late as possible (wounds heal faster on later-pruned vines)",
            "Use double-pruning technique in large vineyards"
        ],
        "treatment": [
            "No curative treatment exists — management is the only option",
            "Trunk renewal: cut below infected wood and retrain from suckers",
            "Sodium arsenite was banned — no chemical replacement exists",
            "Trichoderma-based biocontrol agents applied to pruning wounds show promise"
        ],
        "spread_prevention": [
            "STERILIZE pruning tools between every vine (70% alcohol or 10% bleach)",
            "Remove dead cordons and trunks — burn, do not chip",
            "Never use infected wood for propagation",
            "Mark infected vines for monitoring — they may recover temporarily but fungi persist"
        ]
    },

    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "common_name": "Grape Leaf Blight (Isariopsis Leaf Spot)",
        "crop": "Grape",
        "is_disease": True,
        "severity": "MODERATE",
        "spread_risk": "MODERATE — spreads in warm, humid conditions",
        "cause": "Fungus Pseudocercospora vitis (syn. Isariopsis), favored by high humidity",
        "symptoms": [
            "Dark brown to black irregular spots on leaves",
            "Yellow halos around spots",
            "Spots may merge causing large necrotic areas",
            "Premature defoliation in severe cases"
        ],
        "prevention": [
            "Improve vineyard airflow through canopy management",
            "Remove leaf litter and debris from vineyard floor",
            "Avoid excessive irrigation",
            "Balanced nutrition — avoid excess nitrogen"
        ],
        "treatment": [
            "Copper-based fungicides (Bordeaux mixture) as protectant",
            "Mancozeb sprays at 2-week intervals during wet weather",
            "Remove and destroy heavily infected leaves",
            "Carbendazim for systemic control if available"
        ],
        "spread_prevention": [
            "Remove and destroy fallen infected leaves",
            "Improve drainage around vineyard",
            "Monitor humidity levels — disease peaks above 85% RH",
            "Prune for open canopy to reduce leaf wetness duration"
        ]
    },

    "Grape___healthy": {
        "common_name": "Healthy Grape",
        "crop": "Grape",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Maintain canopy management for good air circulation",
            "Monitor for downy mildew, powdery mildew, and black rot",
            "Apply dormant sprays in late winter",
            "Balance irrigation — avoid both drought stress and overwatering"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== ORANGE (1 class) =====
    "Orange___Haunglongbing_(Citrus_greening)": {
        "common_name": "Citrus Greening (Huanglongbing / HLB)",
        "crop": "Orange / Citrus",
        "is_disease": True,
        "severity": "CRITICAL",
        "spread_risk": "EXTREMELY HIGH — insect vector (Asian citrus psyllid) spreads it rapidly; NO CURE EXISTS",
        "cause": "Bacterium Candidatus Liberibacter asiaticus, transmitted by Asian citrus psyllid (Diaphorina citri)",
        "symptoms": [
            "Asymmetric blotchy mottling of leaves (yellow on one side)",
            "Fruit remains small, lopsided, and green at stem end",
            "Bitter, off-flavor juice with aborted seeds",
            "Progressive tree decline over 3-5 years, eventual death"
        ],
        "prevention": [
            "CRITICAL: Control the psyllid vector — this is the ONLY way to prevent HLB",
            "Use certified disease-free nursery stock ONLY",
            "Apply systemic insecticides (imidacloprid soil drench) to young trees",
            "Scout for psyllids regularly — use yellow sticky traps",
            "Coordinate area-wide psyllid management with all neighboring growers"
        ],
        "treatment": [
            "⚠️ THERE IS NO CURE FOR HLB — infected trees cannot be saved long-term",
            "Enhanced nutrition programs (micronutrient foliar sprays) can extend productive life",
            "Thermotherapy (heat treatment) shows research promise but not field-ready",
            "Antibiotic trunk injections (oxytetracycline) used in some regions under emergency permit"
        ],
        "spread_prevention": [
            "🚨 REMOVE INFECTED TREES IMMEDIATELY — they are psyllid breeding grounds",
            "Report suspected HLB to local agricultural authority — quarantine may be needed",
            "Do NOT move citrus plant material from infected areas",
            "Area-wide coordinated psyllid spraying is essential — one untreated grove re-infects neighbors",
            "This is the most devastating citrus disease worldwide — take it extremely seriously"
        ]
    },

    # ===== PEACH (2 classes) =====
    "Peach___Bacterial_spot": {
        "common_name": "Peach Bacterial Spot",
        "crop": "Peach",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "HIGH — rain-splashed bacteria, worse in warm humid climates",
        "cause": "Bacterium Xanthomonas arboricola pv. pruni, favored by warm, wet, windy conditions",
        "symptoms": [
            "Small, angular, water-soaked spots on leaves",
            "Spots turn purple-brown, centers fall out creating 'shot-hole' appearance",
            "Fruit develops small, dark, sunken pits with cracking",
            "Premature leaf drop weakening the tree"
        ],
        "prevention": [
            "Plant resistant varieties (check local university recommendations)",
            "Choose well-drained planting sites with good air movement",
            "Avoid overhead irrigation",
            "Apply copper sprays in fall after leaf drop and again at bud swell"
        ],
        "treatment": [
            "Copper hydroxide sprays (low rate to avoid phytotoxicity on peach)",
            "Oxytetracycline (Mycoshield) during bloom and petal fall where permitted",
            "No highly effective chemical control exists — management is key",
            "Remove and destroy heavily infected branches"
        ],
        "spread_prevention": [
            "Rain creates aerosols that spread bacteria — windbreaks help",
            "Do NOT work in orchard when trees are wet",
            "Sanitize tools between trees",
            "Remove and destroy pruned material from the orchard"
        ]
    },

    "Peach___healthy": {
        "common_name": "Healthy Peach",
        "crop": "Peach",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Monitor for leaf curl, brown rot, and bacterial spot",
            "Apply dormant copper spray before bud swell",
            "Prune for open center (vase shape) for maximum airflow",
            "Thin fruit to reduce disease pressure and improve fruit quality"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== PEPPER (2 classes) =====
    "Pepper,_bell___Bacterial_spot": {
        "common_name": "Bell Pepper Bacterial Spot",
        "crop": "Bell Pepper",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "VERY HIGH — spreads through rain splash, contaminated seed, and transplants",
        "cause": "Bacterium Xanthomonas euvesicatoria, seed-borne and spread by rain/irrigation",
        "symptoms": [
            "Small, dark, water-soaked spots on leaves",
            "Spots become raised and scabby on fruit",
            "Severe defoliation in warm, rainy weather",
            "Fruit spots reduce marketability"
        ],
        "prevention": [
            "USE CERTIFIED DISEASE-FREE SEED — this is the most critical step",
            "Hot water seed treatment (50°C for 25 minutes) if seed source is uncertain",
            "Do not work in fields when plants are wet",
            "Rotate away from peppers and tomatoes for 2-3 years"
        ],
        "treatment": [
            "Copper hydroxide + mancozeb tank mix provides best control",
            "Apply at first sign of disease and continue at 7-10 day intervals",
            "Acibenzolar-S-methyl (Actigard) activates plant defenses",
            "Bacteriophage-based products available in some regions"
        ],
        "spread_prevention": [
            "Do NOT enter fields when foliage is wet — you will spread bacteria on every plant you touch",
            "Remove and destroy severely infected plants",
            "Avoid overhead irrigation — use drip",
            "Clean all equipment between fields"
        ]
    },

    "Pepper,_bell___healthy": {
        "common_name": "Healthy Bell Pepper",
        "crop": "Bell Pepper",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Continue good field hygiene practices",
            "Monitor for aphids (virus vectors) and whiteflies",
            "Maintain adequate calcium levels to prevent blossom end rot",
            "Mulch to maintain even soil moisture"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== POTATO (3 classes) =====
    "Potato___Early_blight": {
        "common_name": "Potato Early Blight",
        "crop": "Potato",
        "is_disease": True,
        "severity": "MODERATE to HIGH",
        "spread_risk": "HIGH — survives in soil and crop debris, spreads by rain and wind",
        "cause": "Fungus Alternaria solani, favored by warm temperatures and alternating wet/dry conditions",
        "symptoms": [
            "Dark brown concentric ring spots ('target spots' or 'bull's eye') on older leaves",
            "Starts on lower/older leaves and progresses upward",
            "Yellowing around spots, eventual leaf death",
            "Tuber lesions: dark, sunken, circular spots with leathery texture"
        ],
        "prevention": [
            "Rotate potatoes with non-solanaceous crops for 2-3 years",
            "Plant certified disease-free seed potatoes",
            "Maintain adequate fertilization — stressed plants are more susceptible",
            "Irrigate consistently — drought stress triggers susceptibility",
            "Hill soil around plants to protect tubers"
        ],
        "treatment": [
            "Chlorothalonil or Mancozeb as protectant fungicide at first sign",
            "Azoxystrobin (strobilurin) for systemic control",
            "Spray every 7-10 days during disease-favorable weather",
            "Alternate fungicide classes to prevent resistance"
        ],
        "spread_prevention": [
            "Remove all potato debris after harvest — fungus survives in soil on plant remains",
            "Do NOT plant potatoes in the same field consecutively",
            "Destroy volunteer potato plants",
            "Avoid injuring tubers during harvest — wounds allow storage rot"
        ]
    },

    "Potato___Late_blight": {
        "common_name": "Potato Late Blight",
        "crop": "Potato",
        "is_disease": True,
        "severity": "CRITICAL",
        "spread_risk": "EXTREMELY HIGH — can destroy an entire field in 7-10 days under ideal conditions",
        "cause": "Oomycete Phytophthora infestans (caused the Irish Potato Famine), thrives in cool, wet weather",
        "symptoms": [
            "Large, dark, water-soaked lesions on leaves (often starting at tips/edges)",
            "White fuzzy growth (sporangia) on leaf undersides in humid mornings",
            "Rapid spread: entire plants collapse in days",
            "Tubers: reddish-brown granular rot extending into flesh"
        ],
        "prevention": [
            "🚨 THIS IS THE MOST DANGEROUS POTATO DISEASE — act immediately",
            "Plant resistant varieties — check local RAB/ISAR recommendations",
            "Use certified seed from reputable sources ONLY",
            "Destroy all volunteer potatoes and cull piles (they harbor the pathogen)",
            "Monitor weather: spray BEFORE cool, wet periods (>10 hours leaf wetness, 10-20°C)"
        ],
        "treatment": [
            "Apply Ridomil Gold MZ (metalaxyl + mancozeb) IMMEDIATELY upon detection",
            "Alternariafol/Revus (mandipropamid) as preventive in high-risk periods",
            "Spray every 5-7 days during active outbreaks",
            "DO NOT rely on a single fungicide — alternate between systemic and contact types",
            "If >25% of canopy is infected, consider vine kill to protect tubers"
        ],
        "spread_prevention": [
            "🚨 EACH INFECTED PLANT produces millions of airborne spores — ONE plant can infect an entire district",
            "Remove and BURN infected plants immediately — do NOT compost",
            "Alert ALL neighboring farmers immediately — coordinated response is essential",
            "Kill vines (desiccate) 2-3 weeks before harvest to prevent tuber infection",
            "Do NOT harvest in wet conditions — wait for dry weather",
            "Never store infected tubers — they rot and spread to healthy tubers"
        ]
    },

    "Potato___healthy": {
        "common_name": "Healthy Potato",
        "crop": "Potato",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Continue monitoring for late blight — especially in cool, wet weather",
            "Maintain hilling to protect developing tubers",
            "Scout for Colorado potato beetle and aphids",
            "Use certified seed potatoes for next season"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== RASPBERRY (1 class) =====
    "Raspberry___healthy": {
        "common_name": "Healthy Raspberry",
        "crop": "Raspberry",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Remove spent floricanes after harvest",
            "Maintain narrow row width for air circulation",
            "Monitor for spotted wing drosophila during fruiting",
            "Apply dormant lime-sulfur for cane disease prevention"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== SOYBEAN (1 class) =====
    "Soybean___healthy": {
        "common_name": "Healthy Soybean",
        "crop": "Soybean",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Monitor for soybean rust (Phakopsora pachyrhizi) if in tropical/subtropical regions",
            "Scout for pod-feeding insects near maturity",
            "Inoculate with Bradyrhizobium for nitrogen fixation",
            "Rotate with cereal crops to break disease cycles"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== SQUASH (1 class) =====
    "Squash___Powdery_mildew": {
        "common_name": "Squash Powdery Mildew",
        "crop": "Squash",
        "is_disease": True,
        "severity": "MODERATE to HIGH",
        "spread_risk": "VERY HIGH — airborne spores, spreads explosively in warm dry weather",
        "cause": "Fungi Podosphaera xanthii or Erysiphe cichoracearum, unique: does NOT need leaf wetness",
        "symptoms": [
            "White powdery spots on upper leaf surfaces",
            "Spots expand and merge to cover entire leaves",
            "Leaves yellow, brown, and die prematurely",
            "Reduced fruit size and quality"
        ],
        "prevention": [
            "Plant powdery mildew resistant varieties (many modern hybrids have PM resistance)",
            "Ensure adequate spacing for air movement",
            "Avoid excessive nitrogen which promotes dense, susceptible foliage",
            "Morning irrigation allows leaves to dry during the day"
        ],
        "treatment": [
            "Potassium bicarbonate (1 tablespoon per gallon water) — effective organic option",
            "Sulfur-based fungicides — apply before infection spreads",
            "Myclobutanil or trifloxystrobin for systemic control",
            "Neem oil can suppress early infections"
        ],
        "spread_prevention": [
            "Remove severely infected older leaves to reduce spore load",
            "Spores are wind-borne — barriers won't stop spread, but reducing inoculum helps",
            "Monitor all cucurbit crops (cucumber, melon, pumpkin) — they share the same pathogen",
            "End-of-season: remove and destroy all plant debris"
        ]
    },

    # ===== STRAWBERRY (2 classes) =====
    "Strawberry___Leaf_scorch": {
        "common_name": "Strawberry Leaf Scorch",
        "crop": "Strawberry",
        "is_disease": True,
        "severity": "MODERATE",
        "spread_risk": "MODERATE — rain splash spreads spores between plants",
        "cause": "Fungus Diplocarpon earlianum, favored by warm, wet weather",
        "symptoms": [
            "Small, dark purple spots on upper leaf surface",
            "Spots do NOT develop gray/white centers (unlike leaf spot)",
            "Severe cases: entire leaf appears scorched/burned",
            "Leaf edges and between-vein areas become necrotic"
        ],
        "prevention": [
            "Plant resistant varieties and certified disease-free transplants",
            "Renovate strawberry beds after harvest (mow, thin, fertilize)",
            "Avoid overhead irrigation — use drip",
            "Ensure good air circulation with proper plant spacing"
        ],
        "treatment": [
            "Captan or thiram fungicide applied during bloom and fruiting",
            "Copper sprays in early spring as preventive",
            "Myclobutanil for systemic control",
            "Remove and destroy heavily infected leaves"
        ],
        "spread_prevention": [
            "Remove and destroy infected plant debris at end of season",
            "Do NOT use runners from infected plants for new plantings",
            "Clean shoes and tools before entering clean beds",
            "Mulch to prevent rain splash from soil to leaves"
        ]
    },

    "Strawberry___healthy": {
        "common_name": "Healthy Strawberry",
        "crop": "Strawberry",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Maintain straw mulch to prevent soil splash and fruit rot",
            "Monitor for gray mold (Botrytis) during fruiting",
            "Remove overripe and damaged fruit promptly",
            "Renovate beds annually for continued production"
        ],
        "treatment": [],
        "spread_prevention": []
    },

    # ===== TOMATO (10 classes) =====
    "Tomato___Bacterial_spot": {
        "common_name": "Tomato Bacterial Spot",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "VERY HIGH — rain-splashed, seed-borne, spreads rapidly in warm wet weather",
        "cause": "Bacterium Xanthomonas spp., seed-borne and spread by rain splash and contaminated tools",
        "symptoms": [
            "Small, dark, water-soaked spots on leaves",
            "Spots become raised and scab-like on fruit",
            "Severe defoliation exposing fruit to sunscald",
            "Lesions may have yellow halos on leaves"
        ],
        "prevention": [
            "USE CERTIFIED DISEASE-FREE SEED — most important prevention step",
            "Hot water seed treatment (50°C for 25 minutes)",
            "Avoid working in fields when plants are wet",
            "Rotate away from tomato/pepper family for 3 years"
        ],
        "treatment": [
            "Copper + mancozeb tank mix at 7-10 day intervals",
            "Apply BEFORE rain events for protectant activity",
            "Acibenzolar-S-methyl (Actigard) to boost plant immunity",
            "No curative treatment once bacteria are inside plant — prevention is key"
        ],
        "spread_prevention": [
            "NEVER enter fields when foliage is wet — bacteria spread by contact",
            "Remove and destroy infected plants immediately",
            "Drip irrigation only — overhead watering creates bacterial aerosols",
            "Disinfect stakes, cages, and tools between seasons"
        ]
    },

    "Tomato___Early_blight": {
        "common_name": "Tomato Early Blight",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "HIGH — soil-borne fungus, spreads via rain splash to lower leaves first",
        "cause": "Fungus Alternaria solani, overwinters in soil and infected debris",
        "symptoms": [
            "Dark brown concentric 'target' or 'bull's eye' spots on lower/older leaves",
            "Yellowing around spots, progressive leaf death moving upward",
            "Stem lesions: dark, sunken cankers near soil line",
            "Fruit: leathery dark spots at stem end"
        ],
        "prevention": [
            "Stake or cage plants to keep foliage off the ground",
            "Mulch heavily to prevent rain splashing soil onto lower leaves",
            "Remove lower leaves up to 30cm to eliminate splash zone",
            "Rotate — do NOT plant tomatoes in the same spot for 3 years"
        ],
        "treatment": [
            "Spray Mancozeb 80% WP or chlorothalonil at first sign",
            "Azoxystrobin (strobilurin) for systemic control",
            "Apply every 7-10 days during humid weather",
            "DO NOT spray right before rain — allow 2-4 hours drying time"
        ],
        "spread_prevention": [
            "Prune lower leaves below 30cm — these are the entry point",
            "Remove and destroy infected leaves immediately (bag, don't drop on ground)",
            "End of season: remove ALL plant debris from field",
            "Clean stakes, cages, and ties with 10% bleach between seasons"
        ]
    },

    "Tomato___Late_blight": {
        "common_name": "Tomato Late Blight",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "CRITICAL",
        "spread_risk": "EXTREMELY HIGH — airborne spores, can destroy entire fields in days",
        "cause": "Oomycete Phytophthora infestans (same organism that caused Irish Potato Famine)",
        "symptoms": [
            "Large, dark, water-soaked, irregularly shaped lesions on leaves",
            "White fuzzy mold on leaf undersides (visible in early morning)",
            "Stems develop dark brown/black lesions",
            "Fruit: large, firm, greasy-looking brown lesions"
        ],
        "prevention": [
            "🚨 MOST DESTRUCTIVE TOMATO DISEASE — Monitor daily in cool, wet weather",
            "Plant resistant varieties if available in your area",
            "Avoid planting near potato fields (shares the same pathogen)",
            "Destroy all volunteer tomato and potato plants",
            "Improve airflow: stake, prune suckers, space plants adequately"
        ],
        "treatment": [
            "Apply chlorothalonil or mancozeb PREVENTIVELY before wet weather",
            "Ridomil Gold (metalaxyl + mancozeb) for active infections",
            "Spray every 5-7 days during outbreak conditions",
            "If >30% of plant is infected, REMOVE AND DESTROY the plant — it's done"
        ],
        "spread_prevention": [
            "🚨 IMMEDIATELY remove and BURN infected plants — do NOT compost",
            "Spores travel 10+ km in wind — alert ALL neighboring farmers",
            "Do NOT handle infected plants then touch healthy ones",
            "End of season: destroy ALL solanaceous plant residue",
            "Report outbreaks to local extension service for area-wide response"
        ]
    },

    "Tomato___Leaf_Mold": {
        "common_name": "Tomato Leaf Mold",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "MODERATE to HIGH",
        "spread_risk": "HIGH — especially in greenhouses and humid environments",
        "cause": "Fungus Passalora fulva (Fulvia fulva), thrives at >85% humidity",
        "symptoms": [
            "Pale green to yellow spots on upper leaf surface",
            "Olive-green to brown velvety mold on leaf undersides",
            "Older leaves affected first",
            "Severe: leaves curl, wither, and fall; fruit rarely affected directly"
        ],
        "prevention": [
            "Reduce humidity below 85% — ventilate greenhouses aggressively",
            "Increase plant spacing and prune lower leaves",
            "Avoid wetting foliage — water at base only",
            "Plant resistant varieties (many modern tomatoes carry Cf resistance genes)"
        ],
        "treatment": [
            "Improve ventilation immediately — this is the most effective 'treatment'",
            "Chlorothalonil or mancozeb sprays as protectant",
            "Remove and destroy infected lower leaves",
            "In greenhouses: reduce humidity with fans and opening vents"
        ],
        "spread_prevention": [
            "Ventilation is key — lower humidity below 80% and disease stops",
            "Remove and destroy infected leaves — spores remain viable for months",
            "Clean greenhouse surfaces between seasons (10% bleach)",
            "Do NOT save seed from infected crops"
        ]
    },

    "Tomato___Septoria_leaf_spot": {
        "common_name": "Tomato Septoria Leaf Spot",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "HIGH — rain-splashed spores, rapid spread in wet weather",
        "cause": "Fungus Septoria lycopersici, survives in plant debris and solanaceous weeds",
        "symptoms": [
            "Numerous small (2-3mm) circular spots with dark borders and gray centers",
            "Tiny black dots (pycnidia) visible in spot centers with magnification",
            "Starts on lowest leaves, spreads rapidly upward",
            "Severe defoliation — fruit exposed to sunscald"
        ],
        "prevention": [
            "Mulch to prevent rain splash from soil to lower leaves",
            "Stake plants and remove lower 30cm of foliage",
            "Rotate crops — 3 year minimum away from tomatoes",
            "Remove all solanaceous weeds (nightshade, ground cherry)"
        ],
        "treatment": [
            "Chlorothalonil or mancozeb at first appearance",
            "Apply every 7-10 days during rainy periods",
            "Copper-based fungicides as organic alternative",
            "Remove and destroy infected leaves as you find them"
        ],
        "spread_prevention": [
            "Rain splash is the primary spread mechanism — mulch is critical",
            "Remove infected leaves in dry weather (shaking wet leaves spreads spores)",
            "End of season: remove ALL plant debris",
            "Destroy solanaceous weeds around the field — they harbor the fungus"
        ]
    },

    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "common_name": "Two-spotted Spider Mite Damage",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "MODERATE to HIGH",
        "spread_risk": "HIGH — mites spread by wind, on clothing, and on transplants",
        "cause": "Pest: Tetranychus urticae (not a disease but a mite infestation), thrives in hot, dry, dusty conditions",
        "symptoms": [
            "Fine stippling (tiny pale dots) on upper leaf surface",
            "Fine webbing on leaf undersides and between leaves",
            "Leaves turn bronze/brown and become brittle",
            "Plant stunting and reduced fruit set in severe cases"
        ],
        "prevention": [
            "Avoid water stress — drought-stressed plants attract mites",
            "Avoid broad-spectrum insecticides that kill natural predators",
            "Reduce dust around fields (dust suppresses mite predators)",
            "Introduce predatory mites (Phytoseiulus persimilis) in greenhouses"
        ],
        "treatment": [
            "Spray undersides of leaves with strong water jet to dislodge mites",
            "Insecticidal soap or horticultural oil for mild infestations",
            "Abamectin or spiromesifen for severe outbreaks",
            "Release predatory mites (Phytoseiulus) — they consume 5-20 spider mites/day"
        ],
        "spread_prevention": [
            "Inspect transplants carefully before introducing to field",
            "Do NOT move through infested areas then into clean areas",
            "Remove and destroy heavily infested plants on field edges",
            "Wind-borne dispersal occurs — windbreaks can help"
        ]
    },

    "Tomato___Target_Spot": {
        "common_name": "Tomato Target Spot",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "MODERATE to HIGH",
        "spread_risk": "HIGH — spreads in warm, humid conditions with rain",
        "cause": "Fungus Corynespora cassiicola, wide host range including soybeans and cucurbits",
        "symptoms": [
            "Small brown spots with concentric rings (target pattern)",
            "Spots larger than Septoria but smaller than Early Blight",
            "Can appear on leaves, stems, and fruit",
            "Fruit spots: sunken with concentric rings"
        ],
        "prevention": [
            "Improve air circulation — stake and prune plants",
            "Avoid overhead irrigation",
            "Rotate with non-host crops (cereals, grasses)",
            "Remove plant debris after harvest"
        ],
        "treatment": [
            "Chlorothalonil as protectant fungicide",
            "Azoxystrobin (strobilurin) for systemic control",
            "Alternate between fungicide classes at each spray",
            "Spray every 7-14 days depending on weather conditions"
        ],
        "spread_prevention": [
            "Remove lower leaves to reduce humidity around plant base",
            "Rain splash spreads spores — mulch helps",
            "Wide host range means nearby soybeans/cucurbits can be sources",
            "Clean all debris at end of season"
        ]
    },

    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "common_name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "CRITICAL",
        "spread_risk": "EXTREMELY HIGH — whitefly vector, no cure, can cause 100% crop loss",
        "cause": "Begomovirus (TYLCV), transmitted by silverleaf whitefly (Bemisia tabaci)",
        "symptoms": [
            "Severe upward curling and cupping of leaves",
            "Leaves become small, crumpled, and yellow at margins",
            "Stunted growth — plants stop growing",
            "Flower drop — infected plants produce little to no fruit"
        ],
        "prevention": [
            "🚨 CONTROL WHITEFLIES — this is the ONLY way to prevent TYLCV",
            "Use reflective silver mulch to repel whiteflies",
            "Install insect-proof mesh (50-mesh) over nurseries and greenhouses",
            "Plant resistant/tolerant varieties (Ty genes: Ty-1 through Ty-6)",
            "Use yellow sticky traps to monitor and reduce whitefly populations"
        ],
        "treatment": [
            "⚠️ THERE IS NO CURE — once infected, plants cannot be saved",
            "Remove and DESTROY infected plants immediately to reduce virus source",
            "Apply imidacloprid or thiamethoxam to control whitefly vector",
            "Spray neem oil or insecticidal soap for organic whitefly control"
        ],
        "spread_prevention": [
            "🚨 REMOVE INFECTED PLANTS IMMEDIATELY — they are virus factories for whiteflies",
            "Control whiteflies area-wide — coordinate with neighboring growers",
            "Remove all weed hosts (especially wild solanaceae)",
            "Do NOT plant new tomatoes near old infected crops",
            "Maintain crop-free periods (2-3 months) to break the whitefly-virus cycle"
        ]
    },

    "Tomato___Tomato_mosaic_virus": {
        "common_name": "Tomato Mosaic Virus (ToMV)",
        "crop": "Tomato",
        "is_disease": True,
        "severity": "HIGH",
        "spread_risk": "EXTREMELY HIGH — mechanically transmitted (hands, tools), virus survives for YEARS",
        "cause": "Tobamovirus (ToMV), spread by touch/contaminated tools, persists in soil and on surfaces",
        "symptoms": [
            "Mosaic pattern: light and dark green mottling on leaves",
            "Leaf distortion, curling, and fernleaf symptoms",
            "Stunted growth and reduced fruit set",
            "Fruit: internal browning, uneven ripening"
        ],
        "prevention": [
            "Plant resistant varieties (Tm-2² gene provides strong resistance)",
            "USE CERTIFIED VIRUS-FREE SEED — ToMV is seed-transmitted",
            "Wash hands with soap + milk (milk protein inactivates the virus) before handling plants",
            "Do NOT use tobacco products near tomato fields (can carry tobacco mosaic virus)"
        ],
        "treatment": [
            "⚠️ NO CURE EXISTS — remove and destroy infected plants",
            "The virus can survive in dried plant debris for 50+ years",
            "Do NOT compost infected material",
            "Resistant varieties are the only reliable solution"
        ],
        "spread_prevention": [
            "🚨 THIS VIRUS SPREADS BY TOUCH — wash hands with milk + soap between plants",
            "Dip tools in 10% trisodium phosphate or skim milk between plants",
            "Do NOT let workers who smoke handle plants (tobacco virus is related)",
            "Remove infected plants in sealed bags — do NOT let sap contact other plants",
            "The virus survives on tools, clothes, shoes, and greenhouse surfaces for months"
        ]
    },

    "Tomato___healthy": {
        "common_name": "Healthy Tomato",
        "crop": "Tomato",
        "is_disease": False,
        "severity": "NONE",
        "spread_risk": "No disease detected",
        "cause": "N/A — Plant appears healthy",
        "symptoms": [],
        "prevention": [
            "Continue monitoring weekly for early signs of disease",
            "Maintain consistent watering to prevent blossom end rot",
            "Stake or cage plants for air circulation",
            "Scout for whiteflies and aphids (virus vectors)",
            "Apply calcium foliar spray during fruit set"
        ],
        "treatment": [],
        "spread_prevention": []
    }
}


def get_disease_info(class_label: str) -> dict:
    """
    Get complete disease information for a PlantVillage class label.
    Returns the full knowledge base entry or a generic fallback.
    """
    if class_label in DISEASE_DATABASE:
        return DISEASE_DATABASE[class_label]

    # Fallback for unknown classes
    parts = class_label.split("___")
    crop = parts[0].replace("_", " ").title() if parts else "Unknown"
    disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown condition"

    return {
        "common_name": disease,
        "crop": crop,
        "is_disease": "healthy" not in class_label.lower(),
        "severity": "UNKNOWN",
        "spread_risk": "Unknown — consult local agricultural extension officer",
        "cause": "Not in knowledge base — please consult a plant pathologist",
        "symptoms": [f"Detected condition: {disease}"],
        "prevention": [
            "Practice good field sanitation",
            "Rotate crops regularly",
            "Use certified disease-free planting material",
            "Consult your local agricultural extension officer for specific advice"
        ],
        "treatment": [
            "Consult a local agronomist or plant pathologist",
            "Contact your district agricultural office for treatment recommendations"
        ],
        "spread_prevention": [
            "Isolate affected plants until properly identified",
            "Avoid working with infected plants when wet",
            "Remove suspicious plant material and destroy it"
        ]
    }
