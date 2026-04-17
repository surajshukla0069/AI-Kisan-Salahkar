import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { CropType, AdvisorySourceType, PlotType } from "@/lib/store";

// Types matching database
export interface DbExperiment {
  id: string;
  user_id: string;
  crop: string;
  season: string;
  sowing_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbAdvisorySource {
  id: string;
  experiment_id: string;
  name: string;
  type: string;
  notes: string;
}

export interface DbPlot {
  id: string;
  experiment_id: string;
  label: string;
  type: string;
  area: number;
  advisory_source_id: string | null;
}

export interface DbOperation {
  id: string;
  plot_id: string;
  type: string;
  date: string;
  input_type: string;
  quantity: number;
  unit: string;
  cost: number;
  observation_rating: string | null;
  notes: string;
}

export interface DbHarvest {
  id: string;
  plot_id: string;
  date: string;
  yield_qty: number;
  yield_unit: string;
  price_per_unit: number;
}

// Full experiment with related data
export interface FullExperiment {
  id: string;
  crop: CropType;
  season: string;
  sowingDate: string;
  status: string;
  createdAt: string;
  advisorySources: DbAdvisorySource[];
  plots: DbPlot[];
  operations: DbOperation[];
  harvests: DbHarvest[];
}

export function useExperiments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experiments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbExperiment[];
    },
    enabled: !!user,
  });
}

export function useFullExperiment(experimentId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experiment", experimentId],
    queryFn: async (): Promise<FullExperiment | null> => {
      const { data: exp, error } = await supabase
        .from("experiments")
        .select("*")
        .eq("id", experimentId)
        .single();
      if (error) return null;

      const [sources, plots] = await Promise.all([
        supabase.from("advisory_sources").select("*").eq("experiment_id", experimentId),
        supabase.from("plots").select("*").eq("experiment_id", experimentId),
      ]);

      const plotIds = (plots.data || []).map((p: any) => p.id);
      let operations: any[] = [];
      let harvests: any[] = [];
      if (plotIds.length > 0) {
        const [ops, harv] = await Promise.all([
          supabase.from("operations").select("*").in("plot_id", plotIds),
          supabase.from("harvests").select("*").in("plot_id", plotIds),
        ]);
        operations = ops.data || [];
        harvests = harv.data || [];
      }

      return {
        id: exp.id,
        crop: exp.crop as CropType,
        season: exp.season,
        sowingDate: exp.sowing_date,
        status: exp.status,
        createdAt: exp.created_at,
        advisorySources: sources.data || [],
        plots: plots.data || [],
        operations,
        harvests,
      };
    },
    enabled: !!user && !!experimentId,
  });
}

interface CreateExperimentInput {
  crop: CropType;
  season: string;
  sowingDate: string;
  sources: { name: string; type: AdvisorySourceType; notes: string }[];
  plotArea: number;
}

export function useCreateExperiment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExperimentInput) => {
      if (!user) throw new Error("Not authenticated");

      // Create experiment
      const { data: exp, error: expErr } = await supabase
        .from("experiments")
        .insert({
          user_id: user.id,
          crop: input.crop,
          season: input.season,
          sowing_date: input.sowingDate,
          status: "setup",
        })
        .select()
        .single();
      if (expErr) throw expErr;

      // Create advisory sources
      const sourcesToInsert = input.sources.map((s) => ({
        experiment_id: exp.id,
        name: s.name,
        type: s.type,
        notes: s.notes,
      }));
      const { data: dbSources, error: srcErr } = await supabase
        .from("advisory_sources")
        .insert(sourcesToInsert)
        .select();
      if (srcErr) throw srcErr;

      // Create plots
      const plotsToInsert = [
        {
          experiment_id: exp.id,
          label: "Control Plot",
          type: "control",
          area: input.plotArea,
          advisory_source_id: dbSources[0]?.id || null,
        },
        {
          experiment_id: exp.id,
          label: "Test Plot",
          type: "test",
          area: input.plotArea,
          advisory_source_id: dbSources[1]?.id || null,
        },
      ];
      const { error: plotErr } = await supabase.from("plots").insert(plotsToInsert);
      if (plotErr) throw plotErr;

      return exp.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
    },
  });
}

export function useAddOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (op: {
      plot_id: string;
      type: string;
      date: string;
      input_type: string;
      quantity: number;
      unit: string;
      cost: number;
      notes: string;
      experimentId: string;
    }) => {
      const { experimentId, ...rest } = op;
      const { error } = await supabase.from("operations").insert(rest);
      if (error) throw error;

      // Update experiment status to growing
      await supabase
        .from("experiments")
        .update({ status: "growing" })
        .eq("id", experimentId)
        .eq("status", "setup");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiment"] });
    },
  });
}

export function useAddHarvest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (h: {
      plot_id: string;
      date: string;
      yield_qty: number;
      yield_unit: string;
      price_per_unit: number;
      experimentId: string;
    }) => {
      const { experimentId, ...rest } = h;
      const { error } = await supabase.from("harvests").insert(rest);
      if (error) throw error;

      await supabase
        .from("experiments")
        .update({ status: "harvested" })
        .eq("id", experimentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiment"] });
    },
  });
}

export function useUpdateExperimentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("experiments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiment"] });
    },
  });
}
