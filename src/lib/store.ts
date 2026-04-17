// Simple in-memory store for demo (would use localStorage + DB in production)

export type Language = "en" | "hi" | "mr" | "bn" | "ta" | "te";

export const LANGUAGES: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
};

export interface FarmerProfile {
  name: string;
  village: string;
  district: string;
  state: string;
  landSize: number;
  landUnit: "acres" | "bigha" | "hectares";
  mainCrops: string[];
  language: Language;
}

export type CropType = "wheat" | "paddy" | "cotton" | "maize" | "soybean" | "mustard" | "chickpea" | "sugarcane";

export const CROPS: Record<CropType, { label: string; emoji: string }> = {
  wheat: { label: "Wheat", emoji: "🌾" },
  paddy: { label: "Paddy/Rice", emoji: "🌾" },
  cotton: { label: "Cotton", emoji: "🧶" },
  maize: { label: "Maize", emoji: "🌽" },
  soybean: { label: "Soybean", emoji: "🫘" },
  mustard: { label: "Mustard", emoji: "🌻" },
  chickpea: { label: "Chickpea", emoji: "🫘" },
  sugarcane: { label: "Sugarcane", emoji: "🎋" },
};

export type AdvisorySourceType = "traditional" | "dealer" | "scientist" | "ngo" | "youtube" | "other";

export interface AdvisorySource {
  id: string;
  name: string;
  type: AdvisorySourceType;
  notes: string;
}

export type PlotType = "control" | "test";

export interface Plot {
  id: string;
  label: string;
  type: PlotType;
  area: number;
  advisorySourceId: string;
}

export interface Operation {
  id: string;
  plotId: string;
  type: "sowing" | "fertilization" | "irrigation" | "pesticide" | "harvest";
  date: string;
  inputType: string;
  quantity: number;
  unit: string;
  cost: number;
  observationRating?: "low" | "medium" | "high";
  notes: string;
}

export interface Harvest {
  plotId: string;
  date: string;
  yieldQty: number;
  yieldUnit: string;
  pricePerUnit: number;
}

export type ExperimentStatus = "setup" | "growing" | "harvested" | "reported";

export interface Experiment {
  id: string;
  crop: CropType;
  season: string;
  sowingDate: string;
  status: ExperimentStatus;
  advisorySources: AdvisorySource[];
  plots: Plot[];
  operations: Operation[];
  harvests: Harvest[];
  createdAt: string;
}

// Demo data
let currentProfile: FarmerProfile | null = null;
let experiments: Experiment[] = [];

export function getProfile(): FarmerProfile | null {
  if (!currentProfile) {
    const stored = typeof window !== "undefined" ? localStorage.getItem("microplot_profile") : null;
    if (stored) currentProfile = JSON.parse(stored);
  }
  return currentProfile;
}

export function saveProfile(profile: FarmerProfile) {
  currentProfile = profile;
  if (typeof window !== "undefined") {
    localStorage.setItem("microplot_profile", JSON.stringify(profile));
  }
}

export function getExperiments(): Experiment[] {
  if (experiments.length === 0) {
    const stored = typeof window !== "undefined" ? localStorage.getItem("microplot_experiments") : null;
    if (stored) experiments = JSON.parse(stored);
  }
  return experiments;
}

export function saveExperiment(exp: Experiment) {
  const idx = experiments.findIndex((e) => e.id === exp.id);
  if (idx >= 0) experiments[idx] = exp;
  else experiments.push(exp);
  if (typeof window !== "undefined") {
    localStorage.setItem("microplot_experiments", JSON.stringify(experiments));
  }
}

export function getExperiment(id: string): Experiment | undefined {
  return getExperiments().find((e) => e.id === id);
}
