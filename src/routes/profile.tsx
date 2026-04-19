import { useNavigate } from 'react-router-dom';
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { Save, Check, LogOut, Loader2, TrendingUp, Award, Sprout, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth-service";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useExperiments } from "@/hooks/use-experiments";
import { LANGUAGES, type Language } from "@/lib/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const navigate = useNavigate();
    meta: [
      { title: "Profile — MicroPlot" },
      { name: "description", content: "Manage your farmer profile" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: experiments = [] } = useExperiments();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [landSize, setLandSize] = useState("");
  const [language, setLanguage] = useState<Language>("en");

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!experiments.length) return null;
    
    const totalExperiments = experiments.length;
    const completedExperiments = experiments.filter((exp: any) => exp.status === 'completed' || exp.status === 'harvested').length;
    const runningExperiments = experiments.filter((exp: any) => exp.status === 'active' || exp.status === 'ongoing').length;
    
    // Calculate total profit (mock data - adjust based on actual data structure)
    const totalProfit = experiments.reduce((sum: number, exp: any) => sum + (exp.profit || 5000), 0);
    const avgProfit = Math.round(totalProfit / totalExperiments);
    
    // Crop-wise grouping
    const cropWise: Record<string, { count: number; profit: number }> = {};
    experiments.forEach((exp: any) => {
      if (!cropWise[exp.crop]) {
        cropWise[exp.crop] = { count: 0, profit: 0 };
      }
      cropWise[exp.crop].count += 1;
      cropWise[exp.crop].profit += exp.profit || 5000;
    });
    
    // Best performing experiment
    const bestExp = experiments.reduce((best: any, exp: any) => 
      (exp.profit || 0) > (best.profit || 0) ? exp : best
    );
    
    return {
      total: totalExperiments,
      completed: completedExperiments,
      running: runningExperiments,
      totalProfit,
      avgProfit,
      cropWise,
      bestExp
    };
  }, [experiments]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setVillage(profile.village || "");
      setDistrict(profile.district || "");
      setState(profile.state || "");
      setLandSize(String(profile.land_size || ""));
      setLanguage((profile.language as Language) || "en");
    }
  }, [profile]);

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        name,
        village,
        district,
        state,
        land_size: parseFloat(landSize) || 0,
        language,
      });
      toast.success("Profile saved! ✅");
    } catch {
      toast.error("Failed to save profile");
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  if (isLoading) {
    return (
      <div>
        <AppHeader title="My Profile" />
        <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="My Profile" />
      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* User info */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <Card className="p-4 flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-primary-foreground font-bold text-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {(name || user.email || "U")[0].toUpperCase()}
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-green-900">{name || "Set your name"}</p>
                <p className="text-xs text-green-700">{user.email}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <Card className="p-4 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
            <h3 className="font-semibold text-sm mb-3 text-green-900">Language / भाषा</h3>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(LANGUAGES) as [Language, string][]).map(([key, label], idx) => (
                <motion.div key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + idx * 0.05 }}>
                  <Button key={key} variant={language === key ? "default" : "outline"} size="sm" onClick={() => setLanguage(key)} className={language === key ? "bg-gradient-to-r from-green-500 to-emerald-600" : "border-green-200 hover:border-green-400 hover:bg-green-50"}>
                    {label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Profile form */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Card className="p-4 space-y-3 border-green-200 bg-white/50">
            <h3 className="font-semibold text-sm text-green-900">Basic Information</h3>
            <div><Label className="text-green-900">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500" /></div>
            <div><Label className="text-green-900">Village</Label><Input value={village} onChange={(e) => setVillage(e.target.value)} className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-green-900">District</Label><Input value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500" /></div>
              <div><Label className="text-green-900">State</Label><Input value={state} onChange={(e) => setState(e.target.value)} className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500" /></div>
            </div>
            <div><Label className="text-green-900">Land Size (acres)</Label><Input type="number" value={landSize} onChange={(e) => setLandSize(e.target.value)} className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500" /></div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium" size="lg" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : updateProfile.isSuccess ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </motion.div>

        {/* Analytics Section */}
        {analytics && (
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}>
            <Card className="p-4 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
              <h3 className="font-semibold text-sm text-blue-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Your Analytics
              </h3>
              
              {/* Experiments Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.total}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-green-600 font-medium">Running</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.running}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-emerald-900">{analytics.completed}</p>
                </div>
              </div>

              {/* Profit Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium">Avg Profit/Exp</p>
                  <p className="text-lg font-bold text-purple-900">₹{(analytics.avgProfit / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-pink-100">
                  <p className="text-xs text-pink-600 font-medium">Total Profit</p>
                  <p className="text-lg font-bold text-pink-900">₹{(analytics.totalProfit / 1000).toFixed(1)}K</p>
                </div>
              </div>

              {/* Best Experiment */}
              <div className="bg-white rounded-lg p-3 border border-amber-100 mb-4">
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <Award className="h-3 w-3" /> Best Performing
                </p>
                <p className="text-sm font-semibold text-amber-900 mt-1">
                  {analytics.bestExp?.crop || 'N/A'} - ₹{(analytics.bestExp?.profit / 1000 || 0).toFixed(1)}K profit
                </p>
              </div>

              {/* Crop-wise Performance */}
              <div className="bg-white rounded-lg p-3 border border-teal-100">
                <p className="text-xs text-teal-600 font-medium mb-2 flex items-center gap-1">
                  <Sprout className="h-3 w-3" /> Crop-wise Performance
                </p>
                <div className="space-y-2">
                  {Object.entries(analytics.cropWise).slice(0, 3).map(([crop, data]: [string, any]) => (
                    <div key={crop} className="flex items-center justify-between text-sm">
                      <span className="text-teal-700 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-teal-500 rounded-full"></span>
                        {crop}
                      </span>
                      <span className="font-medium text-teal-900">{data.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.45 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
