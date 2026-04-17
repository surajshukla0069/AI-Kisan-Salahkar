import { motion } from 'framer-motion';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useWeather } from '@/hooks/use-weather';
import {
  getWeatherIcon,
  getWeatherColor,
  getSuitabilityColor,
  formatTemperature,
} from '@/lib/weather';
import { useState } from 'react';

export function WeatherWidget() {
  const { weather, forecast, alerts, loading, refreshWeather } = useWeather();
  const [showAlerts, setShowAlerts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWeather();
    setRefreshing(false);
  };

  if (!weather) {
    return null;
  }

  const displayAlerts = alerts?.slice(0, 2) || [];
  const hasAlerts = alerts && alerts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Current Weather Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-emerald-500/10 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-emerald-950/30 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Current Weather
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {new Date(weather.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Temperature */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {formatTemperature(weather.temperature)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Temperature</p>
            </motion.div>

            {/* Humidity */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <Droplets className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {weather.humidity}%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Humidity</p>
            </motion.div>

            {/* Rainfall */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <CloudRain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {weather.rainfall}mm
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Rainfall</p>
            </motion.div>

            {/* Wind Speed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <Wind className="h-6 w-6 text-slate-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {Math.round(weather.windSpeed)} km/h
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Wind Speed</p>
            </motion.div>

            {/* Condition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl mb-1">{getWeatherIcon(weather.weatherCode)}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {weather.description}
              </p>
            </motion.div>
          </div>
        </div>
      </Card>

      {/* 7-Day Forecast */}
      {forecast && forecast.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            7-Day Forecast
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {forecast.map((day, idx) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="text-center p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
              >
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <div className="text-xl mb-1">{getWeatherIcon(day.weatherCode)}</div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {day.tempMax}° / {day.tempMin}°
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {day.precipitation > 0 ? `${day.precipitation}mm` : 'No rain'}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Weather Alerts */}
      {hasAlerts && (
        <div className="space-y-2">
          {displayAlerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border-l-4 border-${
                alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'yellow' : 'orange'
              }-500 rounded-lg p-4 ${
                alert.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-950/30'
                  : alert.severity === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-950/30'
                    : 'bg-orange-50 dark:bg-orange-950/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    alert.severity === 'high'
                      ? 'text-red-600'
                      : alert.severity === 'medium'
                        ? 'text-yellow-600'
                        : 'text-orange-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm ${
                      alert.severity === 'high'
                        ? 'text-red-900 dark:text-red-100'
                        : alert.severity === 'medium'
                          ? 'text-yellow-900 dark:text-yellow-100'
                          : 'text-orange-900 dark:text-orange-100'
                    }`}
                  >
                    {alert.message}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {alert.recommendations.slice(0, 2).map((rec, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs"
                      >
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {alerts && alerts.length > 2 && (
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
            >
              {showAlerts
                ? 'Show less'
                : `+${alerts.length - 2} more alert${alerts.length - 2 > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Weather data updates every 30 minutes
      </p>
    </motion.div>
  );
}
