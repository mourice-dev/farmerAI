"""
prompts.py — FarmerAI System & Task Prompts
=============================================
Central prompt layer that shapes every LLM response.
All persona, tone, language, safety, and grounding rules live here.
"""

# ─── Core system prompt ──────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are **FarmerAI**, a professional yet friendly agricultural advisor built \
for smallholder farmers in East Africa (Rwanda, Kenya, Uganda, Tanzania, \
Burundi). You also help farmers worldwide.

### Personality
- Patient, encouraging, practical.
- Use simple language a farmer with a smartphone can follow.
- When possible, give step-by-step numbered instructions.
- Always end with an encouraging note ("You've got this!", etc.).

### Language rules
- Reply in the **same language** the user writes in.
- If the user mixes languages, prefer the dominant one.
- You are fluent in English, Kinyarwanda, French, and Swahili.

### Grounding rules — CRITICAL
- When disease diagnosis context is provided, base your advice **only** on \
  that context and well-established agronomy. Do NOT invent chemical names, \
  dosages, or brand products that are not in the context.
- If you are unsure, say so and recommend consulting a local agronomist or \
  the district agricultural office.
- Never recommend banned pesticides (e.g. DDT, chlordecone, endosulfan).
- Always include a safety disclaimer when mentioning any chemical product: \
  "Always follow the label instructions and wear protective equipment."

### Output format
When giving disease advice, use this structure:
1. **What's happening** (1-2 sentences, farmer-friendly).
2. **Urgency** (🔴 Act now / 🟡 Soon / 🟢 Monitor).
3. **Steps to take** (numbered list, 3-6 items max).
4. **Prevention for next season** (2-3 tips).
5. **When to call an expert** (one sentence).

For general questions (fertilizer, planting, weather, etc.), answer naturally \
but keep it concise and practical.

### Safety
- You are not a replacement for a certified agronomist. Remind users of this \
  for serious outbreaks.
- Never provide medical advice for humans or animals.
- Never discuss politics, religion, or unrelated topics.
"""

# ─── Diagnosis grounding template ────────────────────────────────────────────

DIAGNOSIS_CONTEXT_TEMPLATE = """\
## Diagnosis Context (from EfficientNetV2-S vision model)

**Crop:** {crop}
**Disease detected:** {disease_name} (confidence: {confidence}%)
**Severity:** {severity}
**Spread risk:** {spread_risk}
**Cause:** {cause}

**Symptoms to look for:**
{symptoms}

**Recommended prevention:**
{prevention}

**Recommended treatment:**
{treatment}

**How to stop spread:**
{spread_prevention}
"""

WEATHER_CONTEXT_TEMPLATE = """\
## Current Weather (user's location)
{weather_summary}
Consider how these conditions affect disease spread, spraying windows, and \
irrigation needs.
"""

FARM_CONTEXT_TEMPLATE = """\
## Farmer's Context
{farm_context}
Tailor your advice to this farmer's specific situation.
"""


# ─── Builder functions ────────────────────────────────────────────────────────

def build_system_prompt(
    diagnosis: dict | None = None,
    weather: str | None = None,
    farm_context: str | None = None,
) -> str:
    """
    Assemble the full system prompt with optional grounding context.

    Parameters
    ----------
    diagnosis : dict, optional
        Output from `get_disease_info()` merged with diagnosis metadata.
        Expected keys: crop, disease_name, confidence, severity, spread_risk,
        cause, symptoms (list), prevention (list), treatment (list),
        spread_prevention (list).
    weather : str, optional
        Free-text weather summary for the user's location.
    farm_context : str, optional
        Free-text farm context (e.g. "2 hectares, hillside, Season B").
    """
    parts = [SYSTEM_PROMPT]

    if diagnosis:
        def _bullet_list(items):
            if not items:
                return "- N/A"
            return "\n".join(f"- {item}" for item in items)

        parts.append(DIAGNOSIS_CONTEXT_TEMPLATE.format(
            crop=diagnosis.get("crop", "Unknown"),
            disease_name=diagnosis.get("disease_name", "Unknown"),
            confidence=diagnosis.get("confidence", "?"),
            severity=diagnosis.get("severity", "Unknown"),
            spread_risk=diagnosis.get("spread_risk", "Unknown"),
            cause=diagnosis.get("cause", "Unknown"),
            symptoms=_bullet_list(diagnosis.get("symptoms", [])),
            prevention=_bullet_list(diagnosis.get("prevention", [])),
            treatment=_bullet_list(diagnosis.get("treatment", [])),
            spread_prevention=_bullet_list(diagnosis.get("spread_prevention", [])),
        ))

    if weather:
        parts.append(WEATHER_CONTEXT_TEMPLATE.format(weather_summary=weather))

    if farm_context:
        parts.append(FARM_CONTEXT_TEMPLATE.format(farm_context=farm_context))

    return "\n\n".join(parts)


def build_diagnosis_dict(disease_info: dict, confidence: float) -> dict:
    """
    Convert a `disease_knowledge.get_disease_info()` result + confidence
    into the dict expected by `build_system_prompt(diagnosis=...)`.
    """
    return {
        "crop": disease_info.get("crop", "Unknown"),
        "disease_name": disease_info.get("common_name", "Unknown"),
        "confidence": round(confidence * 100, 1),
        "severity": disease_info.get("severity", "Unknown"),
        "spread_risk": disease_info.get("spread_risk", "Unknown"),
        "cause": disease_info.get("cause", "Unknown"),
        "symptoms": disease_info.get("symptoms", []),
        "prevention": disease_info.get("prevention", []),
        "treatment": disease_info.get("treatment", []),
        "spread_prevention": disease_info.get("spread_prevention", []),
    }
