"""
disease_search.py — Keyword search over PlantVillage knowledge base
====================================================================
Used to ground text-only chat when no vision diagnosis is available.
"""

from __future__ import annotations

import re
from disease_knowledge import get_disease_info, DISEASE_DATABASE


def _tokenize(text: str) -> set[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return {t for t in text.split() if len(t) >= 2}


def _searchable_text(class_label: str, info: dict) -> str:
    parts = [
        class_label.replace("___", " ").replace("_", " "),
        info.get("common_name", ""),
        info.get("crop", ""),
        info.get("cause", ""),
        info.get("spread_risk", ""),
        " ".join(info.get("symptoms", [])),
        " ".join(info.get("prevention", [])),
        " ".join(info.get("treatment", [])),
    ]
    return " ".join(parts).lower()


def search_diseases(
    query: str,
    *,
    class_labels: list[str] | None = None,
    limit: int = 5,
) -> list[dict]:
    """
    Rank diseases by keyword overlap with the user query.

    Returns list of dicts: class_label, common_name, crop, score, is_disease.
    """
    if not query or not query.strip():
        return []

    tokens = _tokenize(query)
    if not tokens:
        return []

    labels = class_labels if class_labels is not None else list(DISEASE_DATABASE.keys())
    scored: list[tuple[float, str]] = []

    for label in labels:
        info = get_disease_info(label)
        blob = _searchable_text(label, info)
        blob_tokens = set(blob.split())
        overlap = tokens & blob_tokens
        if not overlap:
            continue
        # Weight longer token matches; boost crop/disease name hits
        score = len(overlap)
        for tok in overlap:
            if tok in info.get("common_name", "").lower():
                score += 2
            if tok in info.get("crop", "").lower():
                score += 1.5
        scored.append((score, label))

    scored.sort(key=lambda x: (-x[0], x[1]))
    results = []
    for score, label in scored[:limit]:
        info = get_disease_info(label)
        results.append({
            "class_label": label,
            "common_name": info["common_name"],
            "crop": info["crop"],
            "is_disease": info["is_disease"],
            "severity": info.get("severity"),
            "score": round(score, 2),
        })
    return results


def best_match_for_message(
    message: str,
    class_labels: list[str],
    min_score: float = 2.0,
) -> tuple[str | None, float]:
    """
    Pick the best class label for auto-grounding chat.
    Returns (class_label, estimated_confidence 0-1) or (None, 0).
    """
    hits = search_diseases(message, class_labels=class_labels, limit=1)
    if not hits or hits[0]["score"] < min_score:
        return None, 0.0
    # Map search score to a conservative confidence for the LLM
    raw = hits[0]["score"]
    estimated = min(0.75, 0.35 + raw * 0.08)
    return hits[0]["class_label"], estimated
