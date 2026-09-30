"""
test_backend.py — FarmerAI Backend Test Suite
"""

import os
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from starlette.testclient import TestClient

os.environ["MOCK_LLM"] = "1"

from backend_bridge import app
from disease_search import search_diseases

client = TestClient(app)
SAMPLE_LEAF = Path(__file__).resolve().parent / "sample_leaf.jpg"


def test_root_health():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["version"] == "4.0.0"
    assert data["diseases_supported"] == 38
    assert "diseases_search" in data["endpoints"]
    assert "weather" in data["endpoints"]


def test_classes():
    response = client.get("/api/v1/classes")
    assert response.status_code == 200
    assert response.json()["count"] == 38


def test_disease_detail():
    response = client.get("/api/v1/diseases/Tomato___Late_blight")
    assert response.status_code == 200
    assert "Late Blight" in response.json()["common_name"]


def test_disease_search():
    response = client.get("/api/v1/diseases/search", params={"q": "tomato late blight"})
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1
    assert any("Late" in r["common_name"] for r in data["results"])


def test_disease_search_unit():
    hits = search_diseases("maize rust", limit=3)
    assert len(hits) >= 1
    assert any("rust" in h["common_name"].lower() or "Corn" in h["crop"] for h in hits)


def test_diagnose_image():
    if not SAMPLE_LEAF.exists():
        pytest.skip("sample_leaf.jpg not found")
    with open(SAMPLE_LEAF, "rb") as f:
        response = client.post(
            "/api/v1/diagnose",
            files={"file": ("sample_leaf.jpg", f, "image/jpeg")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "low_confidence" in data["diagnosis"]
    assert len(data["top5_predictions"]) == 5


def test_chat_mock():
    payload = {
        "message": "My potato leaves have dark brown concentric spots.",
        "language": "en",
        "weather": "21°C, 80% humidity",
        "diagnosis_label": "Potato___Early_blight",
        "diagnosis_confidence": 0.94,
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grounded_on_diagnosis"] is True
    assert data["grounding_source"] == "client"
    assert len(data["reply"]) > 20


def test_chat_auto_grounding():
    payload = {
        "message": "Tomato late blight water soaked leaves what should I do",
        "auto_ground": True,
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grounded_on_diagnosis"] is True
    assert data["grounding_source"] == "search"
    assert data["matched_class_label"] is not None


def test_chat_stream_mock():
    payload = {"message": "What fungicide for tomato late blight?"}
    response = client.post("/api/v1/chat/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    assert "[DONE]" in response.text


def test_advise_fusion():
    if not SAMPLE_LEAF.exists():
        pytest.skip("sample_leaf.jpg not found")
    with open(SAMPLE_LEAF, "rb") as f:
        response = client.post(
            "/api/v1/advise",
            files={"file": ("sample_leaf.jpg", f, "image/jpeg")},
            data={"message": "Should I spray today?", "weather": "Rain tomorrow"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["diagnosis"] is not None
    assert len(data["advice"]) > 10


def test_weather_mocked():
    mock_weather = {
        "location": "Musanze",
        "latitude": -1.499,
        "longitude": 29.634,
        "summary": "Location: Musanze. Partly cloudy. Temperature: 22°C.",
        "temperature_c": 22,
        "humidity_percent": 65,
        "precipitation_mm_now": 0,
        "precipitation_mm_next_24h": 3.2,
        "weather_description": "Partly cloudy",
    }
    with patch("backend_bridge.fetch_weather_summary", new=AsyncMock(return_value=mock_weather)):
        response = client.get("/api/v1/weather", params={"district": "Musanze"})
    assert response.status_code == 200
    assert response.json()["summary"] == mock_weather["summary"]


@pytest.mark.live
def test_live_llm_chat():
    if os.environ.get("MOCK_LLM", "1") in ("1", "true", "True"):
        pytest.skip("Set MOCK_LLM=0 and DEEPSEEK_API_KEY for live test")
    if not os.environ.get("DEEPSEEK_API_KEY") and not os.environ.get("LLM_API_KEY"):
        pytest.skip("No API key")
    response = client.post(
        "/api/v1/chat",
        json={"message": "Say hello in one short sentence.", "auto_ground": False},
    )
    assert response.status_code == 200
    assert len(response.json()["reply"]) > 5
