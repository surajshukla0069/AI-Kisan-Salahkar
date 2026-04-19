import { Link, useParams } from 'react-router-dom';
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CROPS } from "@/lib/store";
import { useState } from "react";
import { Plus, BarChart3, Droplets, Sprout, Bug, Wheat, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFullExperiment, useAddOperation, useAddHarvest } from "@/hooks/use-experiments";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/experiments/$experimentId")({
  component: ExperimentDetailPage,
});

const OP_ICONS: Record<string, React.ReactNode> = {
  sowing: <Sprout className="h-4 w-4" />,
  fertilization: <Droplets className="h-4 w-4" />,
  irrigation: <Droplets className="h-4 w-4" />,
  pesticide: <Bug className="h-4 w-4" />,
  harvest: <Wheat className="h-4 w-4" />,
};

function ExperimentDetailPage() {
  const { experimentId } = Route.useParams();
  const { data: experiment, isLoading } = useFullExperiment(experimentId);
  const addOperation = useAddOperation();
  const addHarvest = useAddHarvest();

  const [showAddOp, setShowAddOp] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [opType, setOpType] = useState("sowing");
  const [opDate, setOpDate] = useState("");
  const [opInput, setOpInput] = useState("");
  const [opQty, setOpQty] = useState("");
  const [opCost, setOpCost] = useState("");
  const [showHarvest, setShowHarvest] = useState(false);
  const [harvestPlotId, setHarvestPlotId] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [harvestYield, setHarvestYield] = useState("");
  const [harvestPrice, setHarvestPrice] = useState("");

  if (isLoading) {
    return (
      <div>
        <AppHeader title="Experiment" />
        <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div>
        <AppHeader title="Experiment" />
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="text-muted-foreground">Experiment not found</p>
          <Link to="/experiments"><Button className="mt-4">Back to Experiments</Button></Link>
        </div>
      </div>
    );
  }

  const crop = CROPS[experiment.crop as keyof typeof CROPS];

  async function handleAddOp() {
    if (!selectedPlotId || !opDate) return;
    try {
      await addOperation.mutateAsync({
        plot_id: selectedPlotId,
        type: opType,
        date: opDate,
        input_type: opInput,
        quantity: parseFloat(opQty) || 0,
        unit: "kg",
        cost: parseFloat(opCost) || 0,
        notes: "",
        experimentId,
      });
      toast.success("Operation added ✅");
      setShowAddOp(false);
      setOpDate(""); setOpInput(""); setOpQty(""); setOpCost("");
    } catch {
      toast.error("Failed to add operation");
    }
  }

  async function handleAddHarvest() {
    if (!harvestPlotId || !harvestDate) return;
    try {
      await addHarvest.mutateAsync({
        plot_id: harvestPlotId,
        date: harvestDate,
        yield_qty: parseFloat(harvestYield) || 0,
        yield_unit: "kg",
        price_per_unit: parseFloat(harvestPrice) || 0,
        experimentId,
      });
      toast.success("Harvest recorded 🌾");
      setShowHarvest(false);
    } catch {
      toast.error("Failed to record harvest");
    }
  }

  const canReport = experiment.plots.every((p) =>
    experiment.harvests.some((h) => h.plot_id === p.id)
  );

  return (
    <div>
      <AppHeader title={(crop?.label || experiment.crop) + " Experiment"} />
      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{crop?.emoji || "🌱"}</span>
              <div className="flex-1">
                <h2 className="text-display font-bold text-lg">{crop?.label || experiment.crop}</h2>
                <p className="text-xs text-muted-foreground">{experiment.season} · Sown {experiment.sowingDate}</p>
              </div>
              <Badge variant="outline">{experiment.status}</Badge>
            </div>
          </Card>
        </motion.div>

        {/* Plots */}
        <h3 className="text-display font-semibold">Plots</h3>
        <div className="grid grid-cols-2 gap-3">
          {experiment.plots.map((plot) => {
            const source = experiment.advisorySources.find((s) => s.id === plot.advisory_source_id);
            const ops = experiment.operations.filter((o) => o.plot_id === plot.id);
            const harvest = experiment.harvests.find((h) => h.plot_id === plot.id);
            const totalCost = ops.reduce((sum, o) => sum + Number(o.cost), 0);
            return (
              <Card key={plot.id} className={cn("p-3", plot.type === "test" && "border-primary bg-primary/5")}>
                <p className="text-xs font-semibold uppercase text-muted-foreground">{plot.type}</p>
                <p className="font-medium text-sm">{plot.label}</p>
                <p className="text-xs text-muted-foreground">{source?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{plot.area} acres</p>
                <div className="mt-2 space-y-0.5 text-xs">
                  <p>{ops.length} operations logged</p>
                  <p>₹{totalCost.toLocaleString()} total cost</p>
                  {harvest && <p className="text-success font-medium">{harvest.yield_qty} {harvest.yield_unit} harvested</p>}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Operations */}
        <div className="flex items-center justify-between">
          <h3 className="text-display font-semibold">Operations</h3>
          <Button size="sm" onClick={() => setShowAddOp(!showAddOp)}><Plus className="h-4 w-4" />Add</Button>
        </div>

        {showAddOp && (
          <Card className="p-4 space-y-3 border-primary">
            <div><Label>Plot</Label>
              <Select value={selectedPlotId} onValueChange={setSelectedPlotId}>
                <SelectTrigger><SelectValue placeholder="Select plot" /></SelectTrigger>
                <SelectContent>{experiment.plots.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Type</Label>
              <Select value={opType} onValueChange={setOpType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sowing">Sowing</SelectItem>
                  <SelectItem value="fertilization">Fertilization</SelectItem>
                  <SelectItem value="irrigation">Irrigation</SelectItem>
                  <SelectItem value="pesticide">Pesticide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={opDate} onChange={(e) => setOpDate(e.target.value)} /></div>
            <div><Label>Input/Material</Label><Input value={opInput} onChange={(e) => setOpInput(e.target.value)} placeholder="e.g., Urea, DAP" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity (kg)</Label><Input type="number" value={opQty} onChange={(e) => setOpQty(e.target.value)} /></div>
              <div><Label>Cost (₹)</Label><Input type="number" value={opCost} onChange={(e) => setOpCost(e.target.value)} /></div>
            </div>
            <Button onClick={handleAddOp} className="w-full" disabled={addOperation.isPending}>
              {addOperation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Operation"}
            </Button>
          </Card>
        )}

        {experiment.operations.length > 0 && (
          <div className="space-y-2">
            {experiment.operations.map((op) => {
              const plot = experiment.plots.find((p) => p.id === op.plot_id);
              return (
                <Card key={op.id} className="flex items-center gap-3 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">{OP_ICONS[op.type] || <Sprout className="h-4 w-4" />}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{op.type}</p>
                    <p className="text-xs text-muted-foreground">{plot?.label} · {op.date} · {op.input_type && op.input_type + " "}₹{op.cost}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Harvest */}
        <div className="flex items-center justify-between">
          <h3 className="text-display font-semibold">Harvest</h3>
          <Button size="sm" variant="harvest" onClick={() => setShowHarvest(!showHarvest)}><Wheat className="h-4 w-4" />Record</Button>
        </div>

        {showHarvest && (
          <Card className="p-4 space-y-3 border-harvest">
            <div><Label>Plot</Label>
              <Select value={harvestPlotId} onValueChange={setHarvestPlotId}>
                <SelectTrigger><SelectValue placeholder="Select plot" /></SelectTrigger>
                <SelectContent>{experiment.plots.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Harvest Date</Label><Input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Yield (kg)</Label><Input type="number" value={harvestYield} onChange={(e) => setHarvestYield(e.target.value)} /></div>
              <div><Label>Price/kg (₹)</Label><Input type="number" value={harvestPrice} onChange={(e) => setHarvestPrice(e.target.value)} /></div>
            </div>
            <Button onClick={handleAddHarvest} variant="harvest" className="w-full" disabled={addHarvest.isPending}>
              {addHarvest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Harvest"}
            </Button>
          </Card>
        )}

        {experiment.harvests.map((h) => {
          const plot = experiment.plots.find((p) => p.id === h.plot_id);
          return (
            <Card key={h.id} className="flex items-center gap-3 p-3">
              <Wheat className="h-5 w-5 text-harvest" />
              <div>
                <p className="text-sm font-medium">{plot?.label}</p>
                <p className="text-xs text-muted-foreground">{h.yield_qty} {h.yield_unit} @ ₹{h.price_per_unit}/{h.yield_unit}</p>
              </div>
            </Card>
          );
        })}

        {canReport && (
          <Link to="/experiments/$experimentId/report" params={{ experimentId: experiment.id }}>
            <Button variant="success" size="lg" className="w-full mt-4"><BarChart3 className="h-5 w-5" />View Comparison Report</Button>
          </Link>
        )}
      </main>
    </div>
  );
}
