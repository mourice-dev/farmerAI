"""
weather_service.py — Open-Meteo forecast summaries for agronomic context
========================================================================
No API key required. Supports lat/lon or Rwanda district presets.
"""

from __future__ import annotations

import httpx

# Approximate coordinates for common Rwanda districts (farmer-facing names)
RWANDA_DISTRICTS: dict[str, tuple[float, float]] = {
    "kigali": (-1.9501, 30.0588),
    "gasabo": (-1.9365, 30.1300),
    "musanze": (-1.4990, 29.6340),
    "huye": (-2.5960, 29.7380),
    "butare": (-2.5960, 29.7380),
    "muhanga": (-2.0760, 29.7550),
    "rubavu": (-1.6930, 29.2560),
    "nyagatare": (-1.2920, 30.3270),
    "rusizi": (-2.4790, 28.9080),
    "karongi": (-2.0620, 29.3480),
    "ngoma": (-2.1800, 30.5420),
    "kayonza": (-1.8570, 30.5530),
}


WMO_WEATHER: dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
}


def resolve_coordinates(
    *,
    lat: float | None = None,
    lon: float | None = None,
    district: str | None = None,
) -> tuple[float, float, str]:
    if lat is not None and lon is not None:
        return lat, lon, f"coordinates ({lat}, {lon})"
    if district:
        key = district.strip().lower().replace(" ", "_")
        for name, coords in RWANDA_DISTRICTS.items():
            if key == name or key in name or name in key:
                return coords[0], coords[1], district
        raise ValueError(
            f"Unknown district '{district}'. Provide lat/lon or a known Rwanda district name."
        )
    raise ValueError("Provide lat and lon, or district.")


async def fetch_weather_summary(
    *,
    lat: float | None = None,
    lon: float | None = None,
    district: str | None = None,
) -> dict:
    """
    Fetch current conditions + 24h rain sum from Open-Meteo.
    Returns dict with summary (str) and raw fields for API responses.
    """
    latitude, longitude, location_label = resolve_coordinates(
        lat=lat, lon=lon, district=district
    )

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "hourly": "precipitation",
        "forecast_days": 2,
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    current = data.get("current", {})
    temp = current.get("temperature_2m")
    humidity = current.get("relative_humidity_2m")
    precip_now = current.get("precipitation", 0)
    wind = current.get("wind_speed_10m")
    code = int(current.get("weather_code", 0))
    desc = WMO_WEATHER.get(code, "Variable conditions")

    hourly_precip = data.get("hourly", {}).get("precipitation", [])[:24]
    rain_24h = round(sum(hourly_precip), 1) if hourly_precip else 0.0

    summary = (
        f"Location: {location_label}. {desc}. "
        f"Temperature: {temp}°C, humidity: {humidity}%, "
        f"wind ~{wind} km/h. Precipitation now: {precip_now} mm; "
        f"expected ~{rain_24h} mm over the next 24 hours."
    )

    return {
        "location": location_label,
        "latitude": latitude,
        "longitude": longitude,
        "summary": summary,
        "temperature_c": temp,
        "humidity_percent": humidity,
        "precipitation_mm_now": precip_now,
        "precipitation_mm_next_24h": rain_24h,
        "weather_description": desc,
    }
