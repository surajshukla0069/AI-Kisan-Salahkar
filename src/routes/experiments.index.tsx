import { Link } from 'react-router-dom';
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FlaskConical, CheckCircle2, MapPin, TrendingUp } from "lucide-react";
import { useExperiments, type DbExperiment } from "@/hooks/use-experiments";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { CROPS } from "@/lib/store";
import { t } from "@/lib/translations";
import { motion } from "framer-motion";

export const Route = createFileRoute("/experiments/")({
  component: ExperimentsPage,
});

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  setup: { label: "Setting Up", className: "bg-warning/10 text-warning border-warning/20" },
  growing: { label: "Growing", className: "bg-success/10 text-success border-success/20" },
  harvested: { label: "Harvested", className: "bg-harvest/10 text-earth border-harvest/20" },
  reported: { label: "Reported", className: "bg-primary/10 text-primary border-primary/20" },
};

function ExperimentCard({ experiment, index }: { experiment: DbExperiment; index: number }) {
  const crop = CROPS[experiment.crop as keyof typeof CROPS];
  const status = STATUS_LABELS[experiment.status] || STATUS_LABELS.setup;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, translateY: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to="/experiments/$experimentId" params={{ experimentId: experiment.id }}>
        <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-green-200 bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-2xl"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              {crop?.emoji || "🌱"}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-900">{crop?.label || experiment.crop}</h3>
                <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + index * 0.1 }}>
                  <Badge variant="outline" className={`${status.className} border-l-2`}>{status.label}</Badge>
                </motion.div>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {experiment.season} · Sown {experiment.sowing_date}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function ProcessStep({ icon: Icon, step, title, description }: { icon: any; step: number; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step * 0.1 }}
      className="relative"
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {step}
          </motion.div>
          {step !== 5 && <div className="mt-2 h-12 w-0.5 bg-green-300/40" />}
        </div>
        <motion.div className="pb-8" whileHover={{ x: 8 }}>
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">{title}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ExperimentsPage() {
  const { data: experiments, isLoading } = useExperiments();
  const { preferences } = useUserPreferences();
  const lang = preferences?.language || 'en';

  const processSteps = [
    { icon: FlaskConical, title: t('process.step1', lang), description: t('process.step1Desc', lang) },
    { icon: CheckCircle2, title: t('process.step2', lang), description: t('process.step2Desc', lang) },
    { icon: TrendingUp, title: t('process.step3', lang), description: t('process.step3Desc', lang) },
    { icon: MapPin, title: t('process.step4', lang), description: t('process.step4Desc', lang) },
    { icon: TrendingUp, title: t('process.step5', lang), description: t('process.step5Desc', lang) },
  ];

  return (
    <div>
      <AppHeader title={t('experiments.title', lang)} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <motion.div className="mb-4 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-display text-xl font-bold text-green-900">{t('experiments.title', lang)}</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/experiments/new">
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"><Plus className="h-4 w-4" />{t('experiments.new', lang)}</Button>
            </Link>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Skeleton className="h-20 w-full rounded-xl" />
              </motion.div>
            ))}
          </div>
        ) : !experiments?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center text-center"
          >
            <motion.div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100" whileHover={{ rotate: 5, scale: 1.05 }}>
              <FlaskConical className="h-10 w-10 text-green-600" />
            </motion.div>
            <h3 className="text-display text-lg font-semibold text-green-900">{t('experiments.noExperiments', lang)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('experiments.startFirst', lang)}</p>
            <Link to="/experiments/new">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" size="lg"><Plus className="h-4 w-4" />{t('experiments.new', lang)}</Button>
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05 }}>
            {experiments.map((experiment, idx) => (
              <ExperimentCard key={experiment.id} experiment={experiment} index={idx} />
            ))}
          </motion.div>
        )}

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 pt-12 border-t border-green-200"
        >
          <h3 className="text-display text-xl font-bold mb-8 text-green-900">{t('process.title', lang)}</h3>
          <div className="space-y-2">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={index}
                icon={step.icon}
                step={index + 1}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
          
          {preferences?.location && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 p-4 border border-primary/20"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{t('process.step4', lang)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('process.step4Desc', lang)}
                  </p>
                  <p className="text-sm font-medium mt-2 text-primary">{preferences.location}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
