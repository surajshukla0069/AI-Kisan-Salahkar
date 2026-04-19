import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Loader2, Plus, FlaskConical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useExperiments, type DbExperiment } from "@/hooks/use-experiments";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { CROPS } from "@/lib/store";
import { t } from "@/lib/translations";
import { motion } from "framer-motion";

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  setup: { label: "Setting Up", className: "bg-warning/10 text-warning border-warning/20" },
  growing: { label: "Growing", className: "bg-success/10 text-success border-success/20" },
  harvested: { label: "Harvested", className: "bg-harvest/10 text-earth border-harvest/20" },
  reported: { label: "Reported", className: "bg-primary/10 text-primary border-primary/20" },
};

function ExperimentCard({ experiment, index }: { experiment: DbExperiment; index: number }) {
  const crop = CROPS[experiment.crop as keyof typeof CROPS];
  const status = STATUS_LABELS[experiment.status] || STATUS_LABELS.setup;
  return (
    <Link to={`/experiments/${experiment.id}`}>
      <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{crop?.emoji || "🌱"}</div>
          <div className="flex-1">
            <h3 className="font-semibold">{crop?.label || experiment.crop}</h3>
            <p className="text-xs text-muted-foreground mt-1">{experiment.season}</p>
          </div>
          <Badge>{status.label}</Badge>
        </div>
      </Card>
    </Link>
  );
}

function ExperimentsPageContent() {
  const { data: experiments = [], isLoading } = useExperiments();
  const { preferences } = useUserPreferences();
  const lang = preferences?.language || 'en';

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <div>
      <AppHeader title={t('experiments.title', lang)} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('experiments.title', lang)}</h2>
          <Link to="/experiments/new"><Button size="sm"><Plus className="h-4 w-4" /></Button></Link>
        </div>
        <div className="space-y-3">
          {experiments?.map((exp, idx) => <ExperimentCard key={exp.id} experiment={exp} index={idx} />)}
        </div>
      </main>
    </div>
  );
}

function ExperimentsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!isAuthenticated) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  return <ExperimentsPageContent />;
}

export default ExperimentsPage;
