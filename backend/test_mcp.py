"""
test_mcp.py — FarmerAI Model Context Protocol (MCP) Server Test Suite
"""

import asyncio
import base64
import json
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

import mcp_server
from mcp_server import (
    _calculate_fungal_spore_risk,
    diagnose_plant_leaf,
    diagnose_plant_leaf_base64,
    get_classes_resource,
    get_disease_treatment_guide,
    get_districts_resource,
    get_knowledge_resource,
    crop_consultation_prompt,
    list_supported_crops_and_diseases,
    search_plant_diseases,
    get_rwanda_district_weather,
    get_coordinates_weather,
)

SAMPLE_LEAF = Path(__file__).resolve().parent / "sample_leaf.jpg"


def test_list_supported_crops_and_diseases():
    result = list_supported_crops_and_diseases()
    assert "FarmerAI Supported Crops & Conditions" in result
    assert "38 Total Classes" in result
    assert "EfficientNetV2-S ONNX" in result
    assert "Tomato" in result
    assert "Apple" in result


def test_search_plant_diseases():
    result = search_plant_diseases("late blight", limit=3)
    assert "Search Results for 'late blight'" in result
    assert "Late blight" in result or "Late Blight" in result
    assert "Relevance Score" in result


def test_search_plant_diseases_empty():
    result = search_plant_diseases("xyzunknownpathogen123")
    assert "No disease entries matched query" in result


def test_get_disease_treatment_guide():
    result = get_disease_treatment_guide("Tomato___Late_blight")
    assert "Tomato Late Blight" in result
    assert "Phytophthora infestans" in result or "Cause & Etiology" in result
    assert "Recommended Treatments" in result
    assert "Preventive & Cultural Management" in result


def test_diagnose_plant_leaf_missing():
    result = diagnose_plant_leaf("non_existent_image_12345.jpg")
    assert "Error: Image file not found" in result


def test_diagnose_plant_leaf_real():
    if not SAMPLE_LEAF.exists():
        pytest.skip("sample_leaf.jpg not found")
    result = diagnose_plant_leaf(str(SAMPLE_LEAF))
    assert "FarmerAI Plant Diagnosis" in result
    assert "Model Confidence" in result
    assert "Top Predictions" in result


def test_diagnose_plant_leaf_base64():
    if not SAMPLE_LEAF.exists():
        pytest.skip("sample_leaf.jpg not found")
    b64_data = base64.b64encode(SAMPLE_LEAF.read_bytes()).decode("utf-8")
    result = diagnose_plant_leaf_base64(f"data:image/jpeg;base64,{b64_data}")
    assert "FarmerAI Plant Diagnosis" in result
    assert "Top Predictions" in result


def test_diagnose_plant_leaf_base64_empty():
    result = diagnose_plant_leaf_base64("")
    assert "Error" in result


def test_spore_risk_calculation():
    critical = _calculate_fungal_spore_risk(
        temp_c=20.0,
        humidity_pct=88.0,
        precipitation_now=1.5,
        precipitation_24h=12.0,
    )
    assert critical["risk_level"] == "CRITICAL / VERY HIGH"
    assert "spore germination" in critical["actionable_advice"].lower()

    low = _calculate_fungal_spore_risk(
        temp_c=32.0,
        humidity_pct=35.0,
        precipitation_now=0.0,
        precipitation_24h=0.0,
    )
    assert low["risk_level"] == "LOW"


def test_district_weather_mocked():
    mock_weather = {
        "location": "Musanze",
        "latitude": -1.499,
        "longitude": 29.634,
        "summary": "Location: Musanze. Partly cloudy. Temperature: 21°C.",
        "temperature_c": 21.0,
        "humidity_percent": 82.0,
        "precipitation_mm_now": 0.5,
        "precipitation_mm_next_24h": 6.5,
        "weather_description": "Moderate drizzle",
    }
    with patch("mcp_server.fetch_weather_summary", new=AsyncMock(return_value=mock_weather)):
        result = asyncio.run(get_rwanda_district_weather("Musanze"))
        assert "Microclimate & Fungal Spore Radar: Musanze" in result
        assert "21.0°C" in result
        assert "CRITICAL / VERY HIGH" in result


def test_coordinates_weather_mocked():
    mock_weather = {
        "location": "Custom",
        "latitude": -1.95,
        "longitude": 30.06,
        "summary": "Clear",
        "temperature_c": 26.0,
        "humidity_percent": 50.0,
        "precipitation_mm_now": 0.0,
        "precipitation_mm_next_24h": 0.0,
        "weather_description": "Clear sky",
    }
    with patch("mcp_server.fetch_weather_summary", new=AsyncMock(return_value=mock_weather)):
        result = asyncio.run(get_coordinates_weather(-1.95, 30.06))
        assert "Microclimate & Spore Risk: (-1.95, 30.06)" in result
        assert "LOW" in result


def test_mcp_resources():
    classes_json = get_classes_resource()
    data = json.loads(classes_json)
    assert data["count"] == 38
    assert len(data["classes"]) == 38

    districts_json = get_districts_resource()
    districts = json.loads(districts_json)
    assert "musanze" in districts
    assert "huye" in districts

    knowledge_json = get_knowledge_resource("Tomato___Late_blight")
    info = json.loads(knowledge_json)
    assert info["crop"] == "Tomato"
    assert "Late Blight" in info["common_name"]


def test_mcp_prompt():
    prompt = crop_consultation_prompt(
        crop="Irish Potato",
        symptoms="Black lesions on leaves with white fungal mold underneath",
        district="Nyabihu",
    )
    assert "Irish Potato" in prompt
    assert "Nyabihu" in prompt
    assert "Black lesions" in prompt
