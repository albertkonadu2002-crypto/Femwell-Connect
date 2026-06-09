import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, cycleEntriesTable, productsTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

const PHASE_INFO: Record<Phase, { description: string; tips: string[]; categories: string[] }> = {
  menstrual: {
    description: "Your period has arrived. Your body is shedding the uterine lining. It's normal to feel tired, crampy, or emotional. Rest and warmth are your best friends right now.",
    tips: [
      "Use a heat pad on your lower abdomen to ease cramps",
      "Stay hydrated and eat iron-rich foods like beans and leafy greens",
      "Take ibuprofen before cramps peak for better relief",
      "Rest when you can — this is a high-energy-cost phase",
      "Change pads every 4–6 hours to stay fresh and prevent infection",
    ],
    categories: ["Essential", "Premium"],
  },
  follicular: {
    description: "Your body is preparing to release an egg. Estrogen is rising, which means more energy, better mood, and sharper focus. A great time to tackle big tasks!",
    tips: [
      "Take advantage of your energy boost — exercise feels easier now",
      "Great time to study, plan, and socialise",
      "Support your rising estrogen with fermented foods and leafy greens",
      "Keep panty liners handy for light discharge",
      "This is a good phase to plan your telehealth consultation if needed",
    ],
    categories: ["Wellness"],
  },
  ovulation: {
    description: "You're at peak fertility. Estrogen and testosterone are at their highest, giving you a confidence and energy surge. You may notice light spotting or clear discharge.",
    tips: [
      "Your immune system is slightly lower during ovulation — take care",
      "Notice clear, stretchy discharge? That's a healthy sign of ovulation",
      "Stay active — your body is primed for physical activity",
      "Light spotting is normal and not a cause for concern",
      "Book a telehealth consultation if you have questions about fertility",
    ],
    categories: ["Wellness"],
  },
  luteal: {
    description: "Progesterone rises then falls in this phase, which can bring PMS symptoms: bloating, mood swings, breast tenderness, and food cravings. Be gentle with yourself.",
    tips: [
      "Reduce salt and sugar to minimise bloating",
      "Magnesium-rich foods like dark chocolate and nuts can ease PMS",
      "Prioritise sleep — your body needs more rest in this phase",
      "Light yoga and walking can ease mood swings and cramps",
      "Stock up on your care kit for the approaching period",
    ],
    categories: ["Essential", "Premium", "Wellness"],
  },
};

function computePhase(periodStart: string, cycleLength: number): { phase: Phase; dayOfCycle: number } {
  const start = new Date(periodStart + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfCycle = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const normalizedDay = ((dayOfCycle - 1) % cycleLength) + 1;

  let phase: Phase;
  if (normalizedDay <= 5) phase = "menstrual";
  else if (normalizedDay <= 13) phase = "follicular";
  else if (normalizedDay <= 16) phase = "ovulation";
  else phase = "luteal";

  return { phase, dayOfCycle: normalizedDay };
}

function formatEntry(e: typeof cycleEntriesTable.$inferSelect) {
  return { ...e, createdAt: e.createdAt.toISOString() };
}

router.get("/tracker/entries", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const entries = await db
    .select()
    .from(cycleEntriesTable)
    .where(eq(cycleEntriesTable.userId, req.userId!))
    .orderBy(desc(cycleEntriesTable.periodStart));
  res.json(entries.map(formatEntry));
});

router.post("/tracker/entries", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const body = req.body as {
    periodStart?: string;
    periodEnd?: string;
    cycleLength?: number;
    symptoms?: string[];
    flow?: string;
    notes?: string;
  };

  if (!body.periodStart || typeof body.periodStart !== "string") {
    res.status(400).json({ error: "periodStart is required" });
    return;
  }

  const [entry] = await db.insert(cycleEntriesTable).values({
    userId: req.userId!,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd ?? undefined,
    cycleLength: typeof body.cycleLength === "number" ? body.cycleLength : 28,
    symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
    flow: (["light", "medium", "heavy"] as const).includes(body.flow as any) ? (body.flow as "light" | "medium" | "heavy") : "medium",
    notes: typeof body.notes === "string" ? body.notes : undefined,
  }).returning();

  res.status(201).json(formatEntry(entry));
});

router.get("/tracker/current-phase", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const [latestEntry] = await db
    .select()
    .from(cycleEntriesTable)
    .where(eq(cycleEntriesTable.userId, req.userId!))
    .orderBy(desc(cycleEntriesTable.periodStart))
    .limit(1);

  if (!latestEntry) {
    res.json({
      phase: null,
      dayOfCycle: null,
      cycleLength: 28,
      phaseDescription: "Log your first period to start tracking your cycle.",
      tips: ["Start by logging the first day of your last period."],
      recommendations: [],
    });
    return;
  }

  const cycleLength = latestEntry.cycleLength ?? 28;
  const { phase, dayOfCycle } = computePhase(latestEntry.periodStart, cycleLength);
  const info = PHASE_INFO[phase];

  const allProducts = await db.select().from(productsTable);
  const recommendations = allProducts
    .filter(p => info.categories.includes(p.category) && p.inStock)
    .slice(0, 3)
    .map(p => ({ ...p, rating: null, reviewCount: 0 }));

  res.json({
    phase,
    dayOfCycle,
    cycleLength,
    phaseDescription: info.description,
    tips: info.tips,
    recommendations,
  });
});

export default router;
