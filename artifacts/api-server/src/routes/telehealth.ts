import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import { BookAppointmentBody, GetAppointmentParams, CancelAppointmentParams } from "@workspace/api-zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const NURSES = ["Nurse Abena Mensah", "Nurse Akosua Boateng", "Nurse Ama Asante"];

const router: IRouter = Router();

function formatAppt(a: typeof appointmentsTable.$inferSelect) {
  return {
    ...a,
    notes: a.notes ?? null,
    meetingLink: a.meetingLink ?? null,
    concern: a.concern ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/telehealth/appointments", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.userId, req.userId!));
  res.json(appts.map(formatAppt));
});

router.post("/telehealth/appointments", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const parsed = BookAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const nurseName = NURSES[Math.floor(Math.random() * NURSES.length)];
  const meetingLink = `https://meet.femwellconnect.com/session-${Date.now()}`;

  const [appt] = await db.insert(appointmentsTable).values({
    userId: req.userId!,
    date: parsed.data.date,
    time: parsed.data.time,
    type: parsed.data.type,
    status: "scheduled",
    nurseName,
    meetingLink,
    concern: parsed.data.concern,
  }).returning();

  res.status(201).json(formatAppt(appt));
});

router.get("/telehealth/appointments/:id", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAppointmentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [appt] = await db.select().from(appointmentsTable).where(
    and(eq(appointmentsTable.id, params.data.id), eq(appointmentsTable.userId, req.userId!))
  );
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }

  res.json(formatAppt(appt));
});

router.patch("/telehealth/appointments/:id/cancel", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CancelAppointmentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [appt] = await db.update(appointmentsTable)
    .set({ status: "cancelled" })
    .where(and(eq(appointmentsTable.id, params.data.id), eq(appointmentsTable.userId, req.userId!)))
    .returning();

  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(formatAppt(appt));
});

router.get("/telehealth/slots", async (_req, res): Promise<void> => {
  const slots = [];
  const today = new Date();
  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split("T")[0];
    for (const time of times) {
      const nurse = NURSES[d % NURSES.length];
      slots.push({ date: dateStr, time, available: true, nurseName: nurse });
    }
  }
  res.json(slots);
});

export default router;
