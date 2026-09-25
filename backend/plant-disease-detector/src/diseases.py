"""Plant-aware disease reference: one entry per class, one lookup function.

Why the full class name is the key
----------------------------------
Earlier versions kept two separate copies of this table -- one in `app/app.py`,
one in `scripts/predict.py` -- both keyed on the disease half of the class name
(`class_name.split("___")[-1]`) and both resolved by substring matching over
dict insertion order. That merged diseases that share a name but not a
pathogen, and gave the two entry points different answers for the same image:

  * Black rot on apple is *Botryosphaeria obtusa*; on grape it is
    *Guignardia bidwellii*. Different fungus, different management.
  * Bacterial spot on peach is *Xanthomonas arboricola* pv. *pruni*; on pepper
    and tomato it is a different Xanthomonas species complex.
  * Powdery mildew on cherry is *Podosphaera clandestina*; on squash it is
    *Podosphaera xanthii*.

The model already predicts the plant, so the plant is part of the key. Lookup
is exact -- there is no fuzzy fallback that a new key could silently capture.

Treatment text is general guidance for a portfolio demo, not a prescription.
Product registration varies by country and changes: chlorothalonil and mancozeb
were withdrawn in the EU in 2019 and 2021 respectively, and myclobutanil is not
approved there. Anything naming an active ingredient says to check local
registration, and the app shows that disclaimer before the result, not after.
"""

from .dataset import CLASSES

SEVERITY_LABEL = {"none": "Healthy", "moderate": "Moderate Risk", "severe": "High Risk"}
SEVERITY_COLOR = {"none": "#27ae60", "moderate": "#e67e22", "severe": "#c0392b"}

DISCLAIMER = (
    "General guidance only, not a treatment prescription. Confirm the diagnosis "
    "with a certified agronomist or your local plant clinic, and check local "
    "product registration before applying any product. Several actives named "
    "in agronomic literature are no longer approved in some jurisdictions."
)

_HEALTHY = ("healthy", "none", "#27ae60", "✅")


def _entry(plant, label, pathogen, severity, color, icon, treatment):
    return {
        "plant": plant,
        "label": label,
        "pathogen": pathogen,
        "severity": severity,
        "color": color,
        "icon": icon,
        "treatment": treatment,
    }


DISEASES: dict[str, dict] = {
    # ---------------- Apple ----------------
    "Apple___Apple_scab": _entry(
        "Apple", "Apple Scab", "Venturia inaequalis", "moderate", "#e67e22", "\U0001f342",
        "Rake and destroy fallen leaves over winter to break the ascospore cycle. "
        "Apply a protectant fungicide from green tip through primary-infection "
        "season; captan and DMI fungicides are the usual choices where registered. "
        "Prune for airflow so leaves dry quickly after rain.",
    ),
    "Apple___Black_rot": _entry(
        "Apple", "Black Rot", "Botryosphaeria obtusa", "severe", "#c0392b", "\U0001f534",
        "Prune out cankered wood well below the visible margin and remove mummified "
        "fruit, since the fungus overwinters in both. Burn or bury the prunings rather "
        "than leaving them in the orchard. Captan or thiophanate-methyl programmes "
        "help where registered, but sanitation does most of the work.",
    ),
    "Apple___Cedar_apple_rust": _entry(
        "Apple", "Cedar Apple Rust", "Gymnosporangium juniperi-virginianae",
        "moderate", "#e67e22", "\U0001f34e",
        "The fungus needs both an apple and a juniper/red-cedar host. Remove "
        "galled junipers within a few hundred metres if that is feasible; "
        "otherwise apply a DMI fungicide from pink bud through to the end of "
        "spore release. Rust-resistant cultivars end the problem permanently.",
    ),
    "Apple___healthy": _entry(
        "Apple", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Keep up dormant-season sanitation and scout at "
        "green tip, when apple scab infections start.",
    ),

    # ---------------- Blueberry ----------------
    "Blueberry___healthy": _entry(
        "Blueberry", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Maintain soil pH around 4.5-5.5 and prune out older "
        "canes to keep the bush open.",
    ),

    # ---------------- Cherry ----------------
    "Cherry_(including_sour)___Powdery_mildew": _entry(
        "Cherry", "Powdery Mildew", "Podosphaera clandestina",
        "moderate", "#e67e22", "\U0001f32b️",
        "Cherry powdery mildew infects young leaves and can move onto fruit near "
        "harvest. Prune to open the canopy and cut off water sprouts, which are "
        "the most susceptible tissue. Sulfur or potassium bicarbonate works on "
        "light infections; time sprays from shuck fall where pressure is high.",
    ),
    "Cherry_(including_sour)___healthy": _entry(
        "Cherry", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Watch water sprouts and the inner canopy first, "
        "because that is where powdery mildew usually shows up.",
    ),

    # ---------------- Corn ----------------
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": _entry(
        "Corn (Maize)", "Gray Leaf Spot", "Cercospora zeae-maydis",
        "moderate", "#e67e22", "\U0001f33f",
        "Favoured by continuous corn and heavy residue. Rotate away from corn for "
        "at least a year and bury residue where erosion allows. Resistant hybrids "
        "are the main control; a strobilurin or DMI fungicide at tasselling pays "
        "off only under real disease pressure.",
    ),
    "Corn_(maize)___Common_rust_": _entry(
        "Corn (Maize)", "Common Rust", "Puccinia sorghi",
        "moderate", "#e67e22", "\U0001f33d",
        "Usually cosmetic in field corn and rarely worth spraying. Sweet corn and "
        "seed production are more sensitive: plant resistant hybrids and treat "
        "early if pustules reach the ear leaf before silking.",
    ),
    "Corn_(maize)___Northern_Leaf_Blight": _entry(
        "Corn (Maize)", "Northern Leaf Blight", "Exserohilum turcicum",
        "moderate", "#e67e22", "\U0001f33d",
        "Long cigar-shaped lesions that cost yield when they reach the ear leaf "
        "before grain fill. Plant hybrids carrying Ht resistance genes, rotate "
        "out of corn, and treat around tasselling if lesions are moving up the "
        "plant in wet weather.",
    ),
    "Corn_(maize)___healthy": _entry(
        "Corn (Maize)", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Scout the ear leaf and above around tasselling, "
        "since that is the tissue that determines whether a fungicide pays.",
    ),

    # ---------------- Grape ----------------
    "Grape___Black_rot": _entry(
        "Grape", "Black Rot", "Guignardia bidwellii", "severe", "#c0392b", "\U0001f347",
        "A different fungus from apple black rot and managed differently. Remove "
        "mummified berries from the trellis and the ground, where the fungus "
        "overwinters. The critical spray window is bloom to about four weeks "
        "after; once berries are infected nothing recovers them.",
    ),
    "Grape___Esca_(Black_Measles)": _entry(
        "Grape", "Esca (Black Measles)", "Phaeomoniella chlamydospora complex",
        "severe", "#c0392b", "\U0001f347",
        "A trunk disease with no reliable cure. Prune late in the dormant season "
        "when infection pressure is lower, cut back to clean wood, and seal large "
        "wounds. Vines with apoplectic collapse are usually removed; trunk renewal "
        "from a clean sucker can buy time on younger vines.",
    ),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": _entry(
        "Grape", "Isariopsis Leaf Spot", "Pseudocercospora vitis",
        "moderate", "#e67e22", "\U0001f347",
        "Late-season leaf spotting that mostly costs canopy rather than crop. "
        "Open the canopy through leaf removal and shoot positioning; sprays "
        "targeted at downy mildew generally keep it in check too.",
    ),
    "Grape___healthy": _entry(
        "Grape", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Keep the fruit zone open, and clear mummified "
        "berries during dormant pruning to cut black rot inoculum.",
    ),

    # ---------------- Orange ----------------
    "Orange___Haunglongbing_(Citrus_greening)": _entry(
        "Orange", "Huanglongbing (Citrus Greening)",
        "Candidatus Liberibacter asiaticus", "severe", "#c0392b", "\U0001f34a",
        "No cure exists. HLB is usually a regulated disease, so report a suspected "
        "case to your agriculture department rather than treating it yourself. "
        "Management is area-wide: remove infected trees, control the Asian citrus "
        "psyllid vector, and replant only certified nursery stock.",
    ),

    # ---------------- Peach ----------------
    "Peach___Bacterial_spot": _entry(
        "Peach", "Bacterial Spot", "Xanthomonas arboricola pv. pruni",
        "moderate", "#e74c3c", "\U0001f9a0",
        "A stone-fruit pathogen, distinct from the bacterial spot of pepper and "
        "tomato. Cultivar susceptibility dominates the outcome. Windbreaks reduce "
        "the sand-blasting that opens infection sites; low-rate copper before "
        "bud break and oxytetracycline during the season help where registered, "
        "but copper past bud break burns peach foliage.",
    ),
    "Peach___healthy": _entry(
        "Peach", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Bacterial spot risk is set mostly at planting: "
        "cultivar choice and shelter from wind matter more than any spray.",
    ),

    # ---------------- Pepper ----------------
    "Pepper,_bell___Bacterial_spot": _entry(
        "Bell Pepper", "Bacterial Spot", "Xanthomonas euvesicatoria",
        "moderate", "#e74c3c", "\U0001f9a0",
        "Seed-borne and splash-spread. Start from certified clean seed or hot-water "
        "treat it, and rotate out of peppers and tomatoes for two years. Switch to "
        "drip rather than overhead irrigation, and never work rows while foliage "
        "is wet. Copper resistance is widespread, so copper alone often fails.",
    ),
    "Pepper,_bell___healthy": _entry(
        "Bell Pepper", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Keep foliage dry and avoid handling plants when wet: "
        "bacterial spot moves on splash and on hands.",
    ),

    # ---------------- Potato ----------------
    "Potato___Early_blight": _entry(
        "Potato", "Early Blight", "Alternaria solani", "moderate", "#e67e22", "\U0001f342",
        "A disease of stressed, ageing foliage: it hits hardest where nitrogen or "
        "water runs short during bulking. Keep the crop evenly fed and watered, "
        "rotate at least two years out of solanaceous crops, and start a "
        "protectant programme when lesions first appear on lower leaves.",
    ),
    "Potato___Late_blight": _entry(
        "Potato", "Late Blight", "Phytophthora infestans", "severe", "#c0392b", "⚠️",
        "Acts fast and can destroy a crop in a week under cool, wet weather. Kill "
        "and remove infected foliage, and destroy cull piles and volunteers, which "
        "carry the pathogen between seasons. Protectant sprays must go on ahead of "
        "infection, because once lesions sporulate curative options are limited. Do not "
        "compost infected material, and check tubers before storing.",
    ),
    "Potato___healthy": _entry(
        "Potato", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Watch the forecast: late blight risk models, not the "
        "calendar, should drive the first protectant spray.",
    ),

    # ---------------- Raspberry ----------------
    "Raspberry___healthy": _entry(
        "Raspberry", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Remove spent floricanes after harvest and thin the "
        "row to keep air moving through the canopy.",
    ),

    # ---------------- Soybean ----------------
    "Soybean___healthy": _entry(
        "Soybean", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Scout through pod fill, when most foliar diseases "
        "and sudden death syndrome first become visible.",
    ),

    # ---------------- Squash ----------------
    "Squash___Powdery_mildew": _entry(
        "Squash", "Powdery Mildew", "Podosphaera xanthii",
        "moderate", "#e67e22", "\U0001f32b️",
        "A different species from cherry powdery mildew, and one that develops "
        "fungicide resistance quickly, so rotate modes of action and do not repeat "
        "a single-site product. Resistant varieties, wider spacing, and sulfur or "
        "potassium bicarbonate on early infections handle most home plantings. "
        "Check leaf undersides: that is where it starts.",
    ),

    # ---------------- Strawberry ----------------
    "Strawberry___Leaf_scorch": _entry(
        "Strawberry", "Leaf Scorch", "Diplocarpon earlianum",
        "moderate", "#e67e22", "\U0001f525",
        "A fungal disease despite the name; it is not drought stress. Renovate "
        "beds after harvest by mowing off old foliage and removing it, narrow the "
        "rows, and avoid overhead watering. Plant certified disease-free runners "
        "into a site with good air movement.",
    ),
    "Strawberry___healthy": _entry(
        "Strawberry", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Renovate after harvest and keep runners thinned so "
        "the canopy dries quickly.",
    ),

    # ---------------- Tomato ----------------
    "Tomato___Bacterial_spot": _entry(
        "Tomato", "Bacterial Spot", "Xanthomonas spp.", "moderate", "#e74c3c", "\U0001f9a0",
        "Seed-borne and splash-spread, and not the same pathogen as peach "
        "bacterial spot. Use certified or hot-water-treated seed, rotate two years "
        "out of tomato and pepper, drip-irrigate rather than overhead, and stay "
        "out of wet rows. Copper resistance is common, so copper alone often fails.",
    ),
    "Tomato___Early_blight": _entry(
        "Tomato", "Early Blight", "Alternaria linariae", "moderate", "#e67e22", "\U0001f342",
        "Starts on the oldest leaves and climbs. Mulch to stop soil splash, stake "
        "for airflow, strip the lowest leaves, and keep nitrogen adequate, because hungry "
        "plants lose leaves fastest. Rotate two years out of solanaceous crops.",
    ),
    "Tomato___Late_blight": _entry(
        "Tomato", "Late Blight", "Phytophthora infestans", "severe", "#c0392b", "⚠️",
        "The same pathogen as potato late blight and just as fast. Pull and bag "
        "infected plants immediately rather than composting them, and check nearby "
        "potatoes and volunteers. Protectant sprays only work applied before "
        "infection, so they follow the weather forecast, not a fixed calendar.",
    ),
    "Tomato___Leaf_Mold": _entry(
        "Tomato", "Leaf Mold", "Passalora fulva", "moderate", "#e67e22", "\U0001f33f",
        "Almost entirely a protected-cropping problem, driven by humidity above "
        "about 85%. Ventilate and heat to break condensation on leaves, widen "
        "spacing, and remove lower foliage. Resistant cultivars exist and are the "
        "cleanest fix in a greenhouse.",
    ),
    "Tomato___Septoria_leaf_spot": _entry(
        "Tomato", "Septoria Leaf Spot", "Septoria lycopersici",
        "moderate", "#e67e22", "\U0001f343",
        "Small dark spots with pale centres on the lower leaves, spreading upward "
        "in wet weather. Remove affected lower leaves early, mulch to stop splash, "
        "and rotate annually. The fungus survives on crop debris and on solanaceous "
        "weeds, so clear both.",
    ),
    "Tomato___Spider_mites Two-spotted_spider_mite": _entry(
        "Tomato", "Two-Spotted Spider Mite", "Tetranychus urticae",
        "moderate", "#e74c3c", "\U0001f577️",
        "A mite, not a disease, so fungicides do nothing. Populations explode in hot, "
        "dry, dusty conditions and after broad-spectrum insecticides kill their "
        "predators. Hose down foliage, raise humidity, and release predatory mites; "
        "if a miticide is needed, rotate classes because resistance builds fast.",
    ),
    "Tomato___Target_Spot": _entry(
        "Tomato", "Target Spot", "Corynespora cassiicola",
        "moderate", "#e67e22", "\U0001f3af",
        "Concentric lesions on leaves, stems and fruit, easily mistaken for early "
        "blight. Remove crop debris at the end of the season, improve airflow, and "
        "avoid extended leaf wetness. Rotate fungicide modes of action if treating.",
    ),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": _entry(
        "Tomato", "Tomato Yellow Leaf Curl Virus", "TYLCV (Begomovirus)",
        "severe", "#c0392b", "\U0001f99f",
        "No cure once a plant is infected. Control depends on the whitefly vector "
        "and on excluding it: insect-proof netting on protected crops, reflective "
        "mulch, prompt removal of infected plants, and a clean break between crops. "
        "Resistant varieties are widely available and are the practical answer.",
    ),
    "Tomato___Tomato_mosaic_virus": _entry(
        "Tomato", "Tomato Mosaic Virus", "ToMV (Tobamovirus)",
        "severe", "#c0392b", "\U0001f9a0",
        "No cure, and unusually persistent: it survives on tools, stakes, hands "
        "and plant debris and spreads by handling rather than by an insect vector. "
        "Remove infected plants, disinfect tools and stakes, wash hands between "
        "plants, and do not use tobacco products around the crop.",
    ),
    "Tomato___healthy": _entry(
        "Tomato", "Healthy", None, *_HEALTHY[1:],
        "No disease detected. Mulch, stake for airflow, and keep an eye on the "
        "lowest leaves, where most tomato foliar diseases start.",
    ),
}


def get_disease_info(class_name: str) -> dict:
    """Look up the reference entry for a full class name.

    Exact match only. Every one of the 38 classes has an entry, and
    `tests/test_diseases.py` asserts that none falls through to the fallback --
    a substring match here is how "blight" quietly captured four unrelated
    classes in the previous implementation.
    """
    entry = DISEASES.get(class_name)
    if entry is not None:
        return entry

    plant, _, disease = class_name.partition("___")
    return {
        "plant": plant.replace("_", " ") or class_name,
        "label": (disease or class_name).replace("_", " "),
        "pathogen": None,
        "severity": "moderate",
        "color": "#8e44ad",
        "icon": "\U0001f33f",
        "treatment": (
            "No reference entry for this class. Consult a local agricultural "
            "extension service for diagnosis and treatment advice."
        ),
    }


def severity_of(class_name: str) -> str:
    return get_disease_info(class_name)["severity"]


def display_name(class_name: str) -> str:
    """'Tomato - Late Blight' for a class name, using the reference entry."""
    info = get_disease_info(class_name)
    return f"{info['plant']} - {info['label']}"


# Fail loudly at import time rather than silently serving the fallback: the
# class list and the reference table must stay in step.
_missing = [c for c in CLASSES if c not in DISEASES]
if _missing:
    raise RuntimeError(
        f"src/diseases.py is missing entries for {len(_missing)} classes: {_missing}"
    )
