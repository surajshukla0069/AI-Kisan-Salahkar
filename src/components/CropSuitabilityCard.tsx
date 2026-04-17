import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useWeather } from '@/hooks/use-weather';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { useEffect, useState } from 'react';
import { getCropSuitability, CropSuitability, getSuitabilityColor } from '@/lib/weather';

export function CropSuitabilityCard() {
  const { preferences } = useUserPreferences();
  const [suitability, setSuitability] = useState<CropSuitability[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSuitability = async () => {
      if (!preferences?.crops || preferences.crops.length === 0) return;

      setLoading(true);
      try {
        const result = await getCropSuitability(preferences.crops).catch((err) => {
          console.warn('Failed to load crop suitability:', err);
          return null;
        });

        if (result) {
          setSuitability(result.suitability);
        }
      } catch (error) {
        console.error('Error loading suitability:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuitability();
  }, [preferences]);

  if (!preferences?.crops || preferences.crops.length === 0) {
    return null;
  }

  if (!suitability && !loading) {
    return null;
  }

  const sortedSuitability = suitability
    ? [...suitability].sort((a, b) => b.score - a.score)
    : [];
  const best = sortedSuitability[0];
  const worst = sortedSuitability[sortedSuitability.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-rose-500/10 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-rose-950/30 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Weather-Based Crop Recommendations
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Analyzing weather suitability...
              </p>
            </div>
          ) : suitability && suitability.length > 0 ? (
            <div className="space-y-4">
              {/* Best and Worst */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {best && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                        Best Choice
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300 mb-1">
                      {best.crop}
                    </p>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Score: {best.score}%
                    </div>
                  </motion.div>
                )}

                {worst && worst.score < 50 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Poor Conditions
                      </span>
                    </div>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-1">
                      {worst.crop}
                    </p>
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      Score: {worst.score}%
                    </div>
                  </motion.div>
                )}
              </div>

              {/* All Crops */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 px-1">
                  All Crops
                </p>
                {sortedSuitability.map((crop, idx) => {
                  const scorePercentage = `${crop.score}%`;
                  const scoreColor =
                    crop.score >= 70 ? 'bg-green-500' : crop.score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

                  return (
                    <motion.div
                      key={crop.crop}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900 dark:text-white capitalize">
                          {crop.crop}
                        </span>
                        <Badge className={getSuitabilityColor(crop.score)}>
                          {scorePercentage}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: scorePercentage }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={scoreColor}
                        />
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        {crop.message}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                Unable to load crop suitability data
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
