import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Droplets, Calendar, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetCurrentPhase,
  useListCycleEntries,
  useLogCycleEntry,
  getGetCurrentPhaseQueryKey,
  getListCycleEntriesQueryKey,
} from "@workspace/api-client-react";

const PHASE_META: Record<string, { color: string; bg: string; emoji: string; label: string }> = {
  menstrual: { color: "text-rose-600", bg: "bg-rose-50 border-rose-200", emoji: "🌸", label: "Menstrual Phase" },
  follicular: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", emoji: "🌿", label: "Follicular Phase" },
  ovulation: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", emoji: "✨", label: "Ovulation Phase" },
  luteal: { color: "text-purple-600", bg: "bg-purple-50 border-purple-200", emoji: "🌙", label: "Luteal Phase" },
};

const CYCLE_PHASES = [
  { key: "menstrual", days: "Days 1–5", label: "Menstrual" },
  { key: "follicular", days: "Days 6–13", label: "Follicular" },
  { key: "ovulation", days: "Days 14–16", label: "Ovulation" },
  { key: "luteal", days: "Days 17–28", label: "Luteal" },
];

const COMMON_SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Fatigue", "Mood swings",
  "Breast tenderness", "Back pain", "Nausea", "Spotting", "Cravings",
];

export default function Tracker() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState({
    periodStart: new Date().toISOString().split("T")[0],
    periodEnd: "",
    cycleLength: 28,
    flow: "medium" as "light" | "medium" | "heavy",
    symptoms: [] as string[],
    notes: "",
  });

  const { data: phase, isLoading: phaseLoading } = useGetCurrentPhase();
  const { data: entriesRaw, isLoading: entriesLoading } = useListCycleEntries();
  const entries = Array.isArray(entriesRaw) ? entriesRaw : [];
  const { mutate: logEntry, isPending: isLogging } = useLogCycleEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentPhaseQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCycleEntriesQueryKey() });
        toast({ title: "Period logged!", description: "Your cycle data has been saved." });
        setShowLogForm(false);
        setForm(f => ({ ...f, periodEnd: "", symptoms: [], notes: "" }));
      },
      onError: () => toast({ title: "Failed to log", description: "Please try again.", variant: "destructive" }),
    },
  });

  function toggleSymptom(s: string) {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s],
    }));
  }

  const currentPhase = phase?.phase;
  const meta = currentPhase ? PHASE_META[currentPhase] : null;
  const hasEntries = entries.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Period Tracker</h1>
            <p className="text-muted-foreground">Track your cycle, understand your phases, and get personalised care recommendations.</p>
          </div>
          <Button onClick={() => setShowLogForm(v => !v)} data-testid="button-log-period">
            <Droplets className="h-4 w-4 mr-2" />
            Log period
          </Button>
        </div>
      </motion.div>

      {/* Log Form */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-card border border-primary/20 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> Log a period entry
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1.5">Period started</p>
                    <Input type="date" value={form.periodStart} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} data-testid="input-period-start" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1.5">Period ended <span className="text-muted-foreground">(optional)</span></p>
                    <Input type="date" value={form.periodEnd} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} data-testid="input-period-end" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1.5">Average cycle length (days)</p>
                    <Input type="number" min={21} max={45} value={form.cycleLength} onChange={e => setForm(f => ({ ...f, cycleLength: parseInt(e.target.value) || 28 }))} data-testid="input-cycle-length" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Flow</p>
                    <div className="flex gap-2">
                      {["light", "medium", "heavy"].map(f => (
                        <button
                          key={f}
                          onClick={() => setForm(v => ({ ...v, flow: f as any }))}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 capitalize transition-all ${
                            form.flow === f ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
                          }`}
                          data-testid={`flow-${f}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SYMPTOMS.map(s => (
                        <button
                          key={s}
                          onClick={() => toggleSymptom(s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            form.symptoms.includes(s)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`symptom-${s}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1.5">Notes <span className="text-muted-foreground">(optional)</span></p>
                    <Textarea placeholder="Anything to note about this cycle..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} data-testid="input-notes" />
                  </div>
                  <Button className="w-full" onClick={() => logEntry({ data: {
                    periodStart: form.periodStart,
                    periodEnd: form.periodEnd || undefined,
                    cycleLength: form.cycleLength,
                    flow: form.flow,
                    symptoms: form.symptoms,
                    notes: form.notes || undefined,
                  }})} disabled={isLogging} data-testid="button-save-entry">
                    {isLogging ? "Saving..." : "Save entry"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Phase */}
      {phaseLoading ? (
        <Skeleton className="h-64 rounded-2xl mb-8" />
      ) : phase && phase.phase ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className={`rounded-2xl border-2 p-6 md:p-8 ${meta?.bg}`}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{meta?.emoji}</span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current phase</p>
                    <h2 className={`text-2xl font-serif font-bold ${meta?.color}`}>{meta?.label}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-center rounded-xl px-4 py-2 border ${meta?.bg}`}>
                    <p className={`text-3xl font-bold ${meta?.color}`}>{phase.dayOfCycle}</p>
                    <p className="text-xs text-muted-foreground">of {phase.cycleLength}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">days into your cycle</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{phase.phaseDescription}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Tips for this phase</h3>
                <ul className="space-y-2">
                  {(phase.tips ?? []).slice(0, 4).map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${meta?.color}`} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
          <Droplets className="h-12 w-12 text-primary/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Start tracking your cycle</h3>
          <p className="text-muted-foreground text-sm mb-4">Log your first period to see your current phase and get personalised tips.</p>
          <Button onClick={() => setShowLogForm(true)}>Log your period</Button>
        </motion.div>
      )}

      {/* Cycle Phase Visualizer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
        <h2 className="font-semibold text-lg mb-4">Your 28-day cycle</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CYCLE_PHASES.map(p => {
            const m = PHASE_META[p.key];
            const isActive = currentPhase === p.key;
            return (
              <div key={p.key} className={`rounded-xl border-2 p-4 transition-all ${isActive ? `${m.bg} border-current ${m.color}` : "bg-card border-border"}`}>
                <span className="text-2xl mb-2 block">{m.emoji}</span>
                <p className={`font-semibold text-sm mb-1 ${isActive ? m.color : ""}`}>{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.days}</p>
                {isActive && <Badge className="mt-2 text-xs px-2" variant="outline">You are here</Badge>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Personalised Recommendations */}
      {phase?.recommendations && phase.recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recommended for your {currentPhase} phase</h2>
            <Link href="/products" className="text-sm text-primary hover:underline">See all products</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {phase.recommendations.map((product: any, i: number) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Link href={`/products/${product.id}`}>
                  <div className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-[4/3] overflow-hidden bg-secondary/20">
                      <img src={product.imageUrl || "/images/products/product-standard.jpg"} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-primary font-bold mt-1">GHS {product.price?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cycle History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Cycle history
        </h2>
        {entriesLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : !hasEntries ? (
          <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">No period entries yet. Log your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry: any, i: number) => {
              const duration = entry.periodEnd
                ? Math.ceil((new Date(entry.periodEnd).getTime() - new Date(entry.periodStart).getTime()) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <div key={entry.id} className="bg-card border border-border/50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          {new Date(entry.periodStart + "T12:00:00").toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        {entry.flow && (
                          <Badge variant="outline" className="text-xs capitalize">{entry.flow} flow</Badge>
                        )}
                        {duration && <span className="text-xs text-muted-foreground">{duration} days</span>}
                      </div>
                      {entry.symptoms && entry.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {entry.symptoms.map((s: string) => (
                            <span key={s} className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      {entry.notes && <p className="text-xs text-muted-foreground mt-2 italic">{entry.notes}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Cycle: {entry.cycleLength} days</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Footer CTA */}
      <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold mb-1">Have questions about your cycle?</h3>
          <p className="text-sm text-muted-foreground">Book a private consultation with a Femwell Connect nurse — no judgment, just care.</p>
        </div>
        <Link href="/telehealth">
          <Button className="shrink-0">Book consultation</Button>
        </Link>
      </div>
    </div>
  );
}
