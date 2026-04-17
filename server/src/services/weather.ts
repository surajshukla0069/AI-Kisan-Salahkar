import axios from 'axios';

// Using Open-Meteo API (free, no API key required)
const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'heat' | 'cold' | 'frost' | 'storm';
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedCrops: string[];
  recommendations: string[];
}

// Convert weather code to description
function getWeatherDescription(code: number): string {
  const codeMap: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return codeMap[code] || 'Unknown';
}

export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  try {
    const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
        timezone: 'auto',
      },
    });

    const current = response.data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      rainfall: current.precipitation || 0,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      description: getWeatherDescription(current.weather_code),
      timestamp: new Date(),
      location: {
        latitude,
        longitude,
      },
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Failed to fetch weather data');
  }
}

// Get 7-day forecast
export async function getWeatherForecast(
  latitude: number,
  longitude: number
) {
  try {
    const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
      params: {
        latitude,
        longitude,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
        timezone: 'auto',
      },
    });

    const daily = response.data.daily;
    const forecast = [];

    for (let i = 0; i < daily.time.length; i++) {
      forecast.push({
        date: daily.time[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        precipitation: daily.precipitation_sum[i] || 0,
        weatherCode: daily.weather_code[i],
        description: getWeatherDescription(daily.weather_code[i]),
      });
    }

    return forecast;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('Failed to fetch weather forecast');
  }
}

// Generate weather-based alerts
export function generateWeatherAlerts(
  weather: WeatherData,
  cropsList: string[]
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Temperature alerts
  if (weather.temperature > 40) {
    alerts.push({
      id: `heat-${Date.now()}`,
      type: 'heat',
      severity: 'high',
      message: `⚠️ High temperature alert: ${weather.temperature}°C`,
      affectedCrops: cropsList,
      recommendations: [
        'Increase irrigation frequency',
        'Apply mulch to retain soil moisture',
        'Schedule irrigation early morning or evening',
        'Monitor crops for heat stress',
      ],
    });
  }

  if (weather.temperature < 10) {
    alerts.push({
      id: `cold-${Date.now()}`,
      type: 'cold',
      severity: 'medium',
      message: `❄️ Cold weather alert: ${weather.temperature}°C`,
      affectedCrops: cropsList.filter((c) => !['wheat', 'mustard', 'gram'].includes(c.toLowerCase())),
      recommendations: [
        'Provide frost protection if needed',
        'Monitor for frost damage',
        'Delay irrigation if frost expected',
      ],
    });
  }

  // Rainfall alerts
  if (weather.rainfall > 50) {
    alerts.push({
      id: `rain-${Date.now()}`,
      type: 'rain',
      severity: 'high',
      message: `🌧️ Heavy rainfall alert: ${weather.rainfall}mm expected`,
      affectedCrops: cropsList,
      recommendations: [
        'Ensure proper field drainage',
        'Delay any planned pesticide applications',
        'Check for crop lodging risk',
        'Monitor for pest and disease spread',
      ],
    });
  }

  // Storm alerts
  if (weather.weatherCode >= 95) {
    alerts.push({
      id: `storm-${Date.now()}`,
      type: 'storm',
      severity: 'high',
      message: '⚡ Thunderstorm alert',
      affectedCrops: cropsList,
      recommendations: [
        'Stay indoors until storm passes',
        'Ensure proper field drainage',
        'Check for crop damage after storm',
        'Be prepared for flooding',
      ],
    });
  }

  return alerts;
}

// Get weather-based crop suitability score
export function getWeatherSuitabilityScore(
  weather: WeatherData,
  crop: string
): { score: number; message: string } {
  const cropRequirements: Record<
    string,
    {
      tempMin: number;
      tempMax: number;
      rainMin: number;
      rainMax: number;
      idealHumidity: { min: number; max: number };
    }
  > = {
    rice: {
      tempMin: 20,
      tempMax: 30,
      rainMin: 100,
      rainMax: 300,
      idealHumidity: { min: 50, max: 90 },
    },
    wheat: {
      tempMin: 15,
      tempMax: 25,
      rainMin: 40,
      rainMax: 100,
      idealHumidity: { min: 40, max: 60 },
    },
    corn: {
      tempMin: 18,
      tempMax: 28,
      rainMin: 60,
      rainMax: 150,
      idealHumidity: { min: 40, max: 70 },
    },
    cotton: {
      tempMin: 21,
      tempMax: 32,
      rainMin: 50,
      rainMax: 100,
      idealHumidity: { min: 40, max: 60 },
    },
    sugarcane: {
      tempMin: 20,
      tempMax: 30,
      rainMin: 100,
      rainMax: 250,
      idealHumidity: { min: 50, max: 80 },
    },
    tomato: {
      tempMin: 20,
      tempMax: 28,
      rainMin: 50,
      rainMax: 100,
      idealHumidity: { min: 70, max: 90 },
    },
  };

  const req = cropRequirements[crop.toLowerCase()];

  if (!req) {
    return { score: 50, message: 'Insufficient data for this crop' };
  }

  let score = 100;
  let reasons: string[] = [];

  // Temperature scoring
  if (
    weather.temperature >= req.tempMin &&
    weather.temperature <= req.tempMax
  ) {
    score += 20;
  } else if (
    weather.temperature > req.tempMax + 5 ||
    weather.temperature < req.tempMin - 5
  ) {
    score -= 30;
    reasons.push('Temperature outside ideal range');
  } else {
    score -= 10;
  }

  // Humidity scoring
  if (
    weather.humidity >= req.idealHumidity.min &&
    weather.humidity <= req.idealHumidity.max
  ) {
    score += 10;
  } else if (weather.humidity > 95 || weather.humidity < 30) {
    score -= 15;
    reasons.push('Humidity too extreme');
  } else {
    score -= 5;
  }

  // Weather condition scoring
  if (weather.weatherCode <= 3) {
    score += 10;
  } else if (weather.weatherCode >= 80) {
    score -= 15;
    reasons.push('Heavy rainfall affecting crop');
  }

  score = Math.max(0, Math.min(100, score));

  const message =
    score >= 70
      ? 'Excellent conditions for this crop'
      : score >= 50
        ? 'Fair conditions, monitor closely'
        : 'Poor conditions, consider alternatives';

  return { score, message };
}
