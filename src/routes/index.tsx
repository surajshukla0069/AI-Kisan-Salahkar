import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Sprout, BarChart3, Bot, ChevronRight, Lightbulb, Loader2, MapPin, TrendingUp, Zap, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { useExperiments } from "@/hooks/use-experiments";
import { t } from "@/lib/translations";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CropSuitabilityCard } from "@/components/CropSuitabilityCard";
import { WeatherProvider } from "@/hooks/use-weather";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { preferences } = useUserPreferences();
  const { data: experiments = [] } = useExperiments();
  const navigate = useNavigate();
  const lang = preferences?.language || 'en';

  // Calculate total profit from experiments
  const totalProfit = useMemo(() => {
    return experiments.reduce((sum: number, exp: any) => {
      return sum + (exp.profit || 0);
    }, 0);
  }, [experiments]);

  const activeCount = useMemo(() => {
    return experiments.filter((exp: any) => exp.status === 'active' || exp.status === 'ongoing').length || 2;
  }, [experiments]);

  // Allow guests to view the page, no forced redirect
  return (
    <WeatherProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-blob"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-blob animation-delay-2000"></div>
        </div>

      {/* Enhanced Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg border-b border-white/10 bg-white/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {t('app.title', lang)}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smart Farming Platform</p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            {preferences?.location && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-slate-800/50 border border-green-200 dark:border-slate-700">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{preferences.location}</span>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          {/* Hero Section */}
          <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 p-8 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <FlaskConical className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold mb-3 leading-tight">
                  {t('home.hero', lang)}
                </h2>
                <p className="text-sm opacity-90 mb-6">
                  {t('home.heroDesc', lang)}
                </p>
                <Link to="/experiments/new">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-white text-green-600 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <FlaskConical className="h-5 w-5" />
                    {t('experiments.new', lang)}
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Experiments</p>
                    <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{activeCount}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-200 dark:bg-blue-900/50">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Profit</p>
                    <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ₹ {(totalProfit / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-200 dark:bg-purple-900/50">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Actions</h3>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">4 Features</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FlaskConical, label: t('experiments.title', lang), color: 'from-green-500 to-emerald-600', href: '/experiments' },
                { icon: Bot, label: 'AI Assistant', color: 'from-blue-500 to-cyan-600', href: '/assistant' },
                { icon: Lightbulb, label: 'Learn', color: 'from-yellow-500 to-orange-600', href: '/learn' },
                { icon: BarChart3, label: 'Analytics', color: 'from-purple-500 to-pink-600', href: '/profile' },
              ].map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link key={idx} to={action.href}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-full"
                    >
                      <Card className="h-full p-6 hover:shadow-xl transition-all hover:border-green-500/50 dark:hover:border-green-500/30 cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} mb-4 shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{action.label}</h4>
                        <ChevronRight className="h-4 w-4 text-slate-400 mt-3 group-hover:translate-x-1 transition-transform" />
                      </Card>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Weather Widget and Crop Suitability */}
          <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
            <WeatherWidget />
            <CropSuitabilityCard />
          </motion.div>

          {/* Features Section */}
          <motion.div variants={item}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Why Choose Our Platform?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: '🧪 Fair Comparison',
                  desc: 'Test 2 methods on the same land at the same time to make data-driven decisions'
                },
                {
                  title: '📊 Track Everything',
                  desc: 'Record costs, inputs, and harvest to calculate real profit from your experiments'
                },
                {
                  title: '🤖 AI Insights',
                  desc: 'Get personalized recommendations based on your soil, climate, and crops'
                },
                {
                  title: '📱 Multi-Language',
                  desc: 'Get support in Hindi, English, Punjabi, and Marathi',
                },
                {
                  title: '🌡️ Weather Data',
                  desc: 'Real-time weather updates and forecasts for your location'
                },
                {
                  title: '💾 Secure Cloud Storage',
                  desc: 'Your data is safe and accessible from anywhere, anytime'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all"
                >
                  <h4 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={item} className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 p-12 text-white text-center shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Farming?</h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers using data-driven farming to increase yields and profits
            </p>
            <Link to="/experiments/new">
              <Button size="lg" className="bg-white text-green-600 hover:bg-slate-100 font-semibold px-8">
                Start Your First Experiment
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
    </WeatherProvider>
  );
}
