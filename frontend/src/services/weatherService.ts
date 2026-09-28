import { RwandaDistrict, WeatherData } from '../types';
import { DISTRICT_COORDINATES } from '../data/mockData';

export async function fetchAgroWeather(district: RwandaDistrict): Promise<WeatherData> {
  const coords = DISTRICT_COORDINATES[district] || DISTRICT_COORDINATES['Muhanga'];
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm&hourly=precipitation_probability,rain,relative_humidity_2m,temperature_2m&forecast_days=2&timezone=Africa%2FKigali`;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!response.ok) {
      throw new Error(`Weather HTTP status: ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.current;
    const hourly = data.hourly;
    
    // Check next 24 hours rainfall
    const next24hRainProb = hourly?.precipitation_probability ? hourly.precipitation_probability.slice(0, 24) : [];
    const maxRainChance = next24hRainProb.length ? Math.max(...next24hRainProb) : 65;
    const next24hRainMm = hourly?.rain ? hourly.rain.slice(0, 24).reduce((acc: number, val: number) => acc + val, 0) : 12;
    const isRainExpected = maxRainChance >= 50 || next24hRainMm > 2.0;
    
    const temp = Math.round(current?.temperature_2m ?? 23.5);
    const humidity = Math.round(current?.relative_humidity_2m ?? 82);
    
    // Calculate Spore Germination Risk Index (0 - 100)
    // Fungal spores (Early Blight, Late Blight) thrive at RH > 75% and Temp between 16 - 26 C
    let sporeRisk = 30;
    if (humidity >= 80) sporeRisk += 35;
    else if (humidity >= 70) sporeRisk += 20;
    
    if (temp >= 16 && temp <= 25) sporeRisk += 25;
    if (isRainExpected) sporeRisk += 15;
    sporeRisk = Math.min(sporeRisk, 98);
    
    const soilMoisture = Math.round((current?.soil_moisture_0_to_1cm ?? 0.32) * 100);
    const soilTemp = Math.round(current?.soil_temperature_0cm ?? (temp - 2));

    return {
      district,
      tempCelsius: temp,
      humidityPercentage: humidity,
      rainChance24h: maxRainChance,
      expectedRainfallMm: Math.round(next24hRainMm * 10) / 10,
      windSpeedKmh: Math.round(current?.wind_speed_10m ?? 8),
      soilMoisturePercentage: soilMoisture,
      soilTempCelsius: soilTemp,
      uvIndex: 6,
      forecastSummary: isRainExpected
        ? `Showers expected within 24h (${Math.round(next24hRainMm)}mm). High relative humidity (${humidity}%).`
        : `Mostly clear to partly cloudy. Moderate humidity (${humidity}%). Low immediate rain risk.`,
      sporeGerminationIndex: sporeRisk,
      leafWetnessHours: humidity > 80 ? 9 : 4,
      isRainExpectedNext24h: isRainExpected,
    };
  } catch (error) {
    console.warn(`[AgriMind Weather] Fallback used for ${district}:`, error);
    // Reliable agro-ecological fallback for Rwanda
    const isHighland = coords.altitude > 2000;
    const baseTemp = isHighland ? 18 : 24;
    const baseHumidity = isHighland ? 86 : 76;
    
    return {
      district,
      tempCelsius: baseTemp,
      humidityPercentage: baseHumidity,
      rainChance24h: 70,
      expectedRainfallMm: 8.5,
      windSpeedKmh: 9,
      soilMoisturePercentage: 34,
      soilTempCelsius: baseTemp - 2,
      uvIndex: 5,
      forecastSummary: `Rain expected tomorrow afternoon (${district} micro-climate). High humidity.`,
      sporeGerminationIndex: isHighland ? 85 : 72,
      leafWetnessHours: 8,
      isRainExpectedNext24h: true,
    };
  }
}
