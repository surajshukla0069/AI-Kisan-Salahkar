// Router imports removed
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { CheckCircle2, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  { id: "land", text: "Do you have agricultural land in your name?", options: ["Yes", "No", "Joint/Family"] },
  { id: "kcc", text: "Do you have a Kisan Credit Card?", options: ["Yes", "No"] },
  { id: "insurance", text: "Have you enrolled in crop insurance this season?", options: ["Yes", "No"] },
  { id: "shc", text: "Do you have a Soil Health Card?", options: ["Yes", "No"] },
];

interface Scheme {
  name: string;
  description: string;
  benefit: string;
  documents: string[];
  matchCondition: (answers: Record<string, string>) => boolean;
}

const SCHEMES: Scheme[] = [
  {
    name: "PM-KISAN",
    description: "Direct income support of ₹6,000/year in 3 installments to farmer families",
    benefit: "₹6,000 per year",
    documents: ["Aadhaar Card", "Land Records", "Bank Account"],
    matchCondition: (a) => a.land === "Yes",
  },
  {
    name: "PM Fasal Bima Yojana (PMFBY)",
    description: "Crop insurance at very low premiums (1.5-5%) for food, oilseed, and horticultural crops",
    benefit: "Insurance coverage at subsidized rates",
    documents: ["Land Records", "Sowing Certificate", "Bank Account", "Aadhaar"],
    matchCondition: (a) => a.insurance !== "Yes",
  },
  {
    name: "Kisan Credit Card (KCC)",
    description: "Easy credit for crop production, post-harvest, and consumption needs at 4% interest",
    benefit: "Credit up to ₹3 lakh at 4% interest",
    documents: ["Land Records", "Identity Proof", "Passport Photo"],
    matchCondition: (a) => a.kcc !== "Yes",
  },
  {
    name: "Soil Health Card Scheme",
    description: "Free soil testing and nutrient recommendations for your specific field",
    benefit: "Free soil testing + recommendations",
    documents: ["Aadhaar Card", "Land Location Details"],
    matchCondition: (a) => a.shc !== "Yes",
  },
  {
    name: "Paramparagat Krishi Vikas Yojana",
    description: "Support for organic farming clusters with ₹50,000/ha over 3 years",
    benefit: "₹50,000 per hectare",
    documents: ["Land Records", "Group Formation Certificate"],
    matchCondition: () => true,
  },
];

export default function SchemesPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;
  const eligibleSchemes = SCHEMES.filter((s) => s.matchCondition(answers));

  function handleAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  }

  return (
    <div>
      <AppHeader title="Govt Schemes" />
      <main className="mx-auto max-w-lg px-4 py-6">
        {!showResults ? (
          <div>
            <h2 className="text-display text-xl font-bold mb-2">Check Your Eligibility</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Answer a few simple questions to find schemes you may be eligible for
            </p>

            <div className="space-y-4">
              {QUESTIONS.slice(0, currentQ + 1).map((q, i) => (
                <Card key={q.id} className={cn("p-4", i === currentQ ? "border-primary" : "")}>
                  <p className="text-sm font-medium mb-3">{q.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <Button
                        key={opt}
                        variant={answers[q.id] === opt ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAnswer(q.id, opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {allAnswered && (
              <Button
                className="w-full mt-6"
                size="lg"
                variant="success"
                onClick={() => setShowResults(true)}
              >
                <CheckCircle2 className="h-5 w-5" />
                Check Eligible Schemes
              </Button>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-display text-xl font-bold mb-2">
              You may be eligible for {eligibleSchemes.length} scheme{eligibleSchemes.length !== 1 && "s"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Based on your answers, here are relevant government schemes
            </p>

            <div className="space-y-3">
              {eligibleSchemes.map((scheme) => (
                <Card key={scheme.name} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
                      <FileText className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{scheme.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{scheme.description}</p>
                      <p className="text-xs font-medium text-success mt-1">Benefit: {scheme.benefit}</p>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Required documents:</p>
                        <ul className="mt-1 space-y-0.5">
                          {scheme.documents.map((doc) => (
                            <li key={doc} className="text-xs text-muted-foreground flex items-center gap-1">
                              <ChevronRight className="h-3 w-3" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={() => {
                setShowResults(false);
                setAnswers({});
                setCurrentQ(0);
              }}
            >
              Start Over
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
