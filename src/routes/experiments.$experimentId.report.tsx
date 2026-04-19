import { Link, useParams } from 'react-router-dom';
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CROPS } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Share2, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useFullExperiment, useUpdateExperimentStatus } from "@/hooks/use-experiments";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function ReportPage() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { data: experiment, isLoading } = useFullExperiment(experimentId);
  const updateStatus = useUpdateExperimentStatus();

  useEffect(() => {
    if (experiment && experiment.status !== "reported") {
      updateStatus.mutate({ id: experiment.id, status: "reported" });
    }
  }, [experiment?.id]);

  if (isLoading) {
    return (
      <div>
        <AppHeader title="Report" />
        <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div>
        <AppHeader title="Report" />
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="text-muted-foreground">Experiment not found</p>
        </div>
      </div>
    );
  }

  const crop = CROPS[experiment.crop as keyof typeof CROPS];

  const plotData = experiment.plots.map((plot) => {
    const ops = experiment.operations.filter((o) => o.plot_id === plot.id);
    const harvest = experiment.harvests.find((h) => h.plot_id === plot.id);
    const totalCost = ops.reduce((sum, o) => sum + Number(o.cost), 0);
    const yieldQty = harvest ? Number(harvest.yield_qty) : 0;
    const revenue = yieldQty * (harvest ? Number(harvest.price_per_unit) : 0);
    const profit = revenue - totalCost;
    const area = Number(plot.area) || 1;
    const source = experiment.advisorySources.find((s) => s.id === plot.advisory_source_id);
    return {
      name: plot.label,
      type: plot.type,
      source: source?.name || "",
      cost: totalCost,
      yield: yieldQty,
      revenue,
      profit,
      profitPerAcre: Math.round(profit / area),
      yieldPerAcre: Math.round(yieldQty / area),
    };
  });

  const controlData = plotData.find((p) => p.type === "control");
  const testData = plotData.find((p) => p.type === "test");
  const profitDiff = controlData && testData
    ? ((testData.profit - controlData.profit) / Math.max(controlData.profit, 1)) * 100
    : 0;
  const isTestBetter = profitDiff > 0;

  const yieldChartData = plotData.map((p) => ({ name: p.name.replace(" Plot", ""), value: p.yieldPerAcre }));
  const profitChartData = plotData.map((p) => ({ name: p.name.replace(" Plot", ""), value: p.profitPerAcre }));
  const COLORS = ["oklch(0.55 0.08 50)", "oklch(0.55 0.15 145)"];

  return (
    <div>
      <AppHeader title="Comparison Report" />
      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Card className={`p-5 text-center ${isTestBetter ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}`}>
            <div className="flex justify-center mb-2">
              {isTestBetter ? <TrendingUp className="h-8 w-8 text-success" /> : <TrendingDown className="h-8 w-8 text-destructive" />}
            </div>
            <h2 className="text-display text-xl font-bold">
              {isTestBetter
                ? `Test practice gave ${Math.abs(profitDiff).toFixed(0)}% more profit!`
                : `Control practice performed ${Math.abs(profitDiff).toFixed(0)}% better`}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{crop?.emoji} {crop?.label} · {experiment.season}</p>
          </Card>
        </motion.div>

        <Card className="p-4">
          <h3 className="text-display font-semibold mb-3">Yield per Acre (kg)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={yieldChartData} barSize={50}>
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {yieldChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-display font-semibold mb-3">Profit per Acre (₹)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={profitChartData} barSize={50}>
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {profitChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-display font-semibold mb-3">Detailed Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                  {plotData.map((p) => <th key={p.name} className="text-right py-2 font-medium">{p.name.replace(" Plot", "")}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 text-muted-foreground">Source</td>{plotData.map((p) => <td key={p.name} className="py-2 text-right text-xs">{p.source}</td>)}</tr>
                <tr><td className="py-2 text-muted-foreground">Total Cost</td>{plotData.map((p) => <td key={p.name} className="py-2 text-right">₹{p.cost.toLocaleString()}</td>)}</tr>
                <tr><td className="py-2 text-muted-foreground">Yield</td>{plotData.map((p) => <td key={p.name} className="py-2 text-right">{p.yield} kg</td>)}</tr>
                <tr><td className="py-2 text-muted-foreground">Revenue</td>{plotData.map((p) => <td key={p.name} className="py-2 text-right">₹{p.revenue.toLocaleString()}</td>)}</tr>
                <tr className="font-semibold"><td className="py-2">Profit</td>{plotData.map((p) => <td key={p.name} className="py-2 text-right">₹{p.profit.toLocaleString()}</td>)}</tr>
                <tr className="font-semibold"><td className="py-2">Profit/Acre</td>{plotData.map((p) => <td key={p.name} className="py-2 text-right">₹{p.profitPerAcre.toLocaleString()}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-accent/30 p-4">
          <h4 className="font-semibold text-sm mb-2">💡 What does this mean?</h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Higher yield is good, but only if costs don't eat up the gain</li>
            <li>• Profit per acre is the most reliable comparison metric</li>
            <li>• Try repeating this experiment next season to confirm results</li>
          </ul>
        </Card>

        <div className="flex gap-3">
          <Link to="/experiments/$experimentId" params={{ experimentId: experiment.id }} className="flex-1">
            <Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
          <Button variant="success" className="flex-1" onClick={() => alert("Share feature coming soon!")}>
            <Share2 className="h-4 w-4" />Share Report
          </Button>
        </div>
      </main>
    </div>
  );
}
