import { apiCall } from '@/lib/api';

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

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  weatherCode: number;
  description: string;
}

export interface CropSuitability {
  crop: string;
  score: number;
  message: string;
}

// Get current weather
export async function getCurrentWeather(): Promise<WeatherData> {
  return apiCall<WeatherData>('/weather/current');
}

// Get weather forecast
export async function getWeatherForecast(): Promise<ForecastDay[]> {
  return apiCall<ForecastDay[]>('/weather/forecast');
}

// Get weather alerts
export async function getWeatherAlerts(): Promise<WeatherAlert[]> {
  return apiCall<WeatherAlert[]>('/weather/alerts');
}

// Get crop suitability scores
export async function getCropSuitability(crops: string[]): Promise<{
  weather: WeatherData;
  suitability: CropSuitability[];
}> {
  return apiCall(`/weather/crop-suitability/${crops.join(',')}`);
}

// Get weather icon based on weather code
export function getWeatherIcon(weatherCode: number): string {
  if (weatherCode <= 3) return '☀️';
  if (weatherCode >= 45 && weatherCode <= 48) return '🌫️';
  if (weatherCode >= 51 && weatherCode <= 67) return '🌧️';
  if (weatherCode >= 71 && weatherCode <= 86) return '❄️';
  if (weatherCode >= 80 && weatherCode <= 82) return '⛈️';
  if (weatherCode >= 95 && weatherCode <= 99) return '⚡';
  return '🌤️';
}

// Get weather color based on code
export function getWeatherColor(weatherCode: number): string {
  if (weatherCode <= 3) return 'text-yellow-500';
  if (weatherCode >= 45 && weatherCode <= 48) return 'text-gray-400';
  if (weatherCode >= 51 && weatherCode <= 67) return 'text-blue-500';
  if (weatherCode >= 71 && weatherCode <= 86) return 'text-blue-300';
  if (weatherCode >= 80 && weatherCode <= 82) return 'text-blue-600';
  if (weatherCode >= 95 && weatherCode <= 99) return 'text-purple-600';
  return 'text-orange-500';
}

// Get suitability color
export function getSuitabilityColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-100';
  if (score >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}

// Format temperature
export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  }
  return `${temp}°C`;
}
