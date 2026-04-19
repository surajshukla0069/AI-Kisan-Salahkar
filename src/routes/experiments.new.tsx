import { useNavigate } from 'react-router-dom';
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { CROPS, type CropType, type AdvisorySourceType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useCreateExperiment } from "@/hooks/use-experiments";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/experiments/new")({
  component: NewExperimentPage,
});

const STEPS = ["Select Crop", "Advisory Sources", "Plot Setup", "Review"];

function NewExperimentPage() {
  const navigate = useNavigate();
  const createExperiment = useCreateExperiment();
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState<CropType | null>(null);
  const [season, setSeason] = useState("Rabi 2026");
  const [sowingDate, setSowingDate] = useState("");
  const [sources, setSources] = useState([
    { name: "My usual practice", type: "traditional" as AdvisorySourceType, notes: "" },
    { name: "Scientific recommendation", type: "scientist" as AdvisorySourceType, notes: "" },
  ]);
  const [plotArea, setPlotArea] = useState("0.1");

  const canNext =
    (step === 0 && crop && sowingDate) ||
    (step === 1 && sources.length >= 2 && sources.every((s) => s.name.trim())) ||
    step === 2 ||
    step === 3;

  async function handleFinish() {
    if (!crop) return;
    try {
      const id = await createExperiment.mutateAsync({
        crop,
        season,
        sowingDate,
        sources,
        plotArea: parseFloat(plotArea) || 0.1,
      });
      toast.success("Experiment created! 🌱");
      navigate({ to: "/experiments/$experimentId", params: { experimentId: id } });
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <AppHeader title="New Experiment" />
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div className={cn("h-2 w-full rounded-full transition-colors", i <= step ? "bg-primary" : "bg-secondary")} />
              <span className={cn("text-[10px]", i <= step ? "text-primary font-medium" : "text-muted-foreground")}>{s}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 0: Crop */}
            {step === 0 && (
              <div>
                <h2 className="text-display text-xl font-bold mb-4">Which crop?</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(Object.entries(CROPS) as [CropType, { label: string; emoji: string }][]).map(([key, val]) => (
                    <Card
                      key={key}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 cursor-pointer transition-all",
                        crop === key ? "ring-2 ring-primary bg-primary/5 shadow-md scale-[1.02]" : "hover:shadow-sm"
                      )}
                      onClick={() => setCrop(key)}
                    >
                      <span className="text-3xl">{val.emoji}</span>
                      <span className="text-sm font-medium">{val.label}</span>
                    </Card>
                  ))}
                </div>
                <div className="space-y-3">
                  <div><Label>Season</Label><Input value={season} onChange={(e) => setSeason(e.target.value)} /></div>
                  <div><Label>Sowing Date</Label><Input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} /></div>
                </div>
              </div>
            )}

            {/* Step 1: Advisory Sources */}
            {step === 1 && (
              <div>
                <h2 className="text-display text-xl font-bold mb-2">Advisory Sources</h2>
                <p className="text-sm text-muted-foreground mb-4">Add the advice sources you want to compare</p>
                <div className="space-y-3">
                  {sources.map((src, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", i === 0 ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground")}>
                          {i + 1}
                        </div>
                        <Input
                          className="flex-1"
                          value={src.name}
                          onChange={(e) => { const u = [...sources]; u[i] = { ...src, name: e.target.value }; setSources(u); }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(["traditional", "dealer", "scientist", "ngo", "youtube"] as AdvisorySourceType[]).map((t) => (
                          <button
                            key={t}
                            className={cn("rounded-full px-3 py-1 text-xs font-medium border transition-colors capitalize", src.type === t ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border hover:bg-accent")}
                            onClick={() => { const u = [...sources]; u[i] = { ...src, type: t }; setSources(u); }}
                          >{t}</button>
                        ))}
                      </div>
                      <Textarea placeholder="Notes..." value={src.notes} onChange={(e) => { const u = [...sources]; u[i] = { ...src, notes: e.target.value }; setSources(u); }} className="text-sm" rows={2} />
                    </Card>
                  ))}
                </div>
                {sources.length < 3 && (
                  <Button variant="outline" className="mt-3 w-full" onClick={() => setSources([...sources, { name: "", type: "other", notes: "" }])}>
                    + Add Another Source
                  </Button>
                )}
              </div>
            )}

            {/* Step 2: Plot setup */}
            {step === 2 && (
              <div>
                <h2 className="text-display text-xl font-bold mb-2">Plot Setup</h2>
                <p className="text-sm text-muted-foreground mb-4">We'll create 2 plots: a control and a test plot</p>
                <Card className="p-5 mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 rounded-xl border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                      <div className="text-2xl mb-1">🟫</div>
                      <p className="text-sm font-semibold">Control Plot</p>
                      <p className="text-xs text-muted-foreground">{sources[0]?.name}</p>
                    </div>
                    <div className="flex-1 rounded-xl border-2 border-primary p-4 text-center bg-primary/5">
                      <div className="text-2xl mb-1">🟩</div>
                      <p className="text-sm font-semibold">Test Plot</p>
                      <p className="text-xs text-muted-foreground">{sources[1]?.name}</p>
                    </div>
                  </div>
                  <Label>Area per plot (acres)</Label>
                  <Input type="number" step="0.05" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} className="mt-1" />
                </Card>
                <Card className="bg-accent/30 p-4">
                  <h4 className="font-semibold text-sm mb-2">💡 Tips for setting up</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Keep both plots next to each other in the same field</li>
                    <li>• Use a rope or walk steps to measure equal areas</li>
                    <li>• Plant the same variety on both plots</li>
                    <li>• Only change the practice you want to test</li>
                  </ul>
                </Card>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div>
                <h2 className="text-display text-xl font-bold mb-4">Review & Create</h2>
                <Card className="p-4 space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Crop</span><span className="text-sm font-medium">{crop ? CROPS[crop].emoji + " " + CROPS[crop].label : ""}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Season</span><span className="text-sm font-medium">{season}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Sowing Date</span><span className="text-sm font-medium">{sowingDate}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Plot Area</span><span className="text-sm font-medium">{plotArea} acres each</span></div>
                  <hr />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Advisory Sources:</p>
                    {sources.map((src, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1.5">
                        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold", i === 0 ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground")}>{i + 1}</div>
                        <span className="text-sm">{src.name} ({src.type})</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              <ChevronLeft className="h-4 w-4" />Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext} className="flex-1">
              Next<ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} className="flex-1" variant="success" disabled={createExperiment.isPending}>
              {createExperiment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {createExperiment.isPending ? "Creating..." : "Create Experiment"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
