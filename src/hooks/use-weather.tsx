import { useState, useEffect, createContext, useContext } from 'react';
import {
  WeatherData,
  WeatherAlert,
  ForecastDay,
  CropSuitability,
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  getCropSuitability,
} from '@/lib/weather';
import { useAuth } from './use-auth';

interface WeatherContextType {
  weather: WeatherData | null;
  forecast: ForecastDay[] | null;
  alerts: WeatherAlert[] | null;
  cropSuitability: CropSuitability[] | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

let globalWeatherContext: WeatherContextType | null = null;

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[] | null>(null);
  const [cropSuitability, setCropSuitability] = useState<CropSuitability[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const refreshWeather = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const [weatherData, forecastData, alertsData] = await Promise.all([
        getCurrentWeather().catch((e) => {
          console.warn('Weather fetch failed, continuing:', e);
          return null;
        }),
        getWeatherForecast().catch((e) => {
          console.warn('Forecast fetch failed, continuing:', e);
          return null;
        }),
        getWeatherAlerts().catch((e) => {
          console.warn('Alerts fetch failed, continuing:', e);
          return null;
        }),
      ]);

      if (weatherData) setWeather(weatherData);
      if (forecastData) setForecast(forecastData);
      if (alertsData) setAlerts(alertsData);
    } catch (err: any) {
      console.error('Error refreshing weather:', err);
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshWeather();
      // Refresh weather every 30 minutes
      const interval = setInterval(refreshWeather, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value: WeatherContextType = {
    weather,
    forecast,
    alerts: alerts?.filter((a) => !dismissedAlerts.has(a.id)) || null,
    cropSuitability,
    loading,
    error,
    refreshWeather,
    dismissAlert,
  };

  globalWeatherContext = value;

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

export function useWeather(): WeatherContextType {
  const context = useContext(WeatherContext);
  if (!context) {
    if (globalWeatherContext) {
      return globalWeatherContext;
    }
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return context;
}
