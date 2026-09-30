"""
chat_service.py — Advisor orchestration (prompts, grounding, LLM calls)
=======================================================================
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any, AsyncGenerator

from disease_knowledge import get_disease_info
from disease_search import best_match_for_message, search_diseases
from prompts import build_system_prompt, build_diagnosis_dict
from llm_service import chat_completion, chat_completion_stream, build_messages
from weather_service import fetch_weather_summary

logger = logging.getLogger("farmerai.chat")

MAX_HISTORY_TURNS = 20
MAX_TURN_CONTENT_LEN = 4000

LANG_MAP = {"en": "English", "rw": "Kinyarwanda", "fr": "French", "sw": "Swahili"}

LOW_CONFIDENCE_PROMPT = (
    "\n\n### Vision uncertainty\n"
    "The diagnosis confidence is LOW or the match came from text search only. "
    "Do NOT prescribe specific chemical products aggressively. "
    "Recommend clearer leaf photos, field inspection, and local agronomist contact."
)


@dataclass
class AdvisorInput:
    message: str
    history: list[dict] | None = None
    language: str | None = None
    farm_context: str | None = None
    weather: str | None = None
    lat: float | None = None
    lon: float | None = None
    district: str | None = None
    diagnosis_label: str | None = None
    diagnosis_confidence: float | None = None
    class_labels: list[str] = field(default_factory=list)
    low_confidence: bool = False
    auto_ground: bool = True


@dataclass
class AdvisorResult:
    reply: str
    model: str
    usage: dict | None
    grounded_on_diagnosis: bool
    grounding_source: str | None  # vision | search | client
    matched_class_label: str | None
    weather_summary: str | None


def sanitize_history(history: list[dict] | None) -> list[dict]:
    if not history:
        return []
    cleaned = []
    for turn in history[-MAX_HISTORY_TURNS:]:
        role = turn.get("role", "user")
        if role not in ("user", "assistant"):
            continue
        content = str(turn.get("content", ""))[:MAX_TURN_CONTENT_LEN]
        if not content.strip():
            continue
        cleaned.append({"role": role, "content": content})
    return cleaned


def parse_history_json(history_json: str | None) -> list[dict]:
    if not history_json:
        return []
    try:
        raw = json.loads(history_json)
        if not isinstance(raw, list):
            return []
        return sanitize_history(raw)
    except json.JSONDecodeError:
        return []


async def resolve_weather_text(inp: AdvisorInput) -> str | None:
    if inp.weather:
        return inp.weather
    if inp.lat is not None and inp.lon is not None or inp.district:
        try:
            wx = await fetch_weather_summary(
                lat=inp.lat, lon=inp.lon, district=inp.district
            )
            return wx["summary"]
        except Exception as e:
            logger.warning("Weather fetch failed: %s", e)
            return None
    return None


def resolve_diagnosis_context(inp: AdvisorInput) -> tuple[dict | None, str | None, str | None, bool]:
    """
    Returns (diagnosis_ctx, class_label, grounding_source, low_confidence).
    """
    low = inp.low_confidence
    if inp.diagnosis_label:
        info = get_disease_info(inp.diagnosis_label)
        conf = inp.diagnosis_confidence if inp.diagnosis_confidence is not None else 0.0
        if conf < 0.60:
            low = True
        return build_diagnosis_dict(info, conf), inp.diagnosis_label, "client", low

    if inp.auto_ground and inp.class_labels and inp.message:
        label, est_conf = best_match_for_message(inp.message, inp.class_labels)
        if label:
            info = get_disease_info(label)
            low = est_conf < 0.60
            return build_diagnosis_dict(info, est_conf), label, "search", low

    return None, None, None, low


def build_advisor_messages(inp: AdvisorInput, weather_text: str | None) -> tuple[list[dict], AdvisorResult | None]:
    """Build messages; partial AdvisorResult metadata filled by caller after LLM."""
    diagnosis_ctx, matched_label, source, low = resolve_diagnosis_context(inp)

    language_hint = ""
    if inp.language:
        lang_name = LANG_MAP.get(inp.language, inp.language)
        language_hint = f"\n\nThe user prefers replies in {lang_name}."

    extra = LOW_CONFIDENCE_PROMPT if low else ""

    system_prompt = build_system_prompt(
        diagnosis=diagnosis_ctx,
        weather=weather_text,
        farm_context=inp.farm_context,
    ) + language_hint + extra

    history = sanitize_history(inp.history)
    messages = build_messages(system_prompt, inp.message, history)

    meta = AdvisorResult(
        reply="",
        model="",
        usage=None,
        grounded_on_diagnosis=diagnosis_ctx is not None,
        grounding_source=source,
        matched_class_label=matched_label,
        weather_summary=weather_text,
    )
    return messages, meta


async def run_advisor(inp: AdvisorInput) -> AdvisorResult:
    weather_text = await resolve_weather_text(inp)
    messages, meta = build_advisor_messages(inp, weather_text)
    result = await chat_completion(messages)
    meta.reply = result["content"]
    meta.model = result["model"]
    meta.usage = result.get("usage")
    logger.info(
        "chat completed model=%s grounded=%s source=%s tokens=%s",
        meta.model,
        meta.grounded_on_diagnosis,
        meta.grounding_source,
        (meta.usage or {}).get("total_tokens"),
    )
    return meta


async def stream_advisor(inp: AdvisorInput) -> AsyncGenerator[str, None]:
    weather_text = await resolve_weather_text(inp)
    messages, _meta = build_advisor_messages(inp, weather_text)
    async for chunk in chat_completion_stream(messages):
        yield chunk
