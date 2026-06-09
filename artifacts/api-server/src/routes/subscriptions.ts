import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, subscriptionsTable, subscriptionPlansTable } from "@workspace/db";
import { CreateSubscriptionBody, CancelSubscriptionParams } from "@workspace/api-zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

function formatSub(sub: typeof subscriptionsTable.$inferSelect) {
  return {
    ...sub,
    startDate: sub.startDate.toISOString(),
    deliveryAddress: sub.deliveryAddress ?? null,
  };
}

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  const plans = await db.select().from(subscriptionPlansTable);
  res.json(plans);
});

router.get("/subscriptions", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const [sub] = await db.select().from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, req.userId!));
  if (!sub) { res.status(200).json(null); return; }
  res.json(formatSub(sub));
});

router.post("/subscriptions", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, parsed.data.planId));
  if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }

  const nextDelivery = new Date();
  nextDelivery.setDate(nextDelivery.getDate() + 30);

  const [sub] = await db.insert(subscriptionsTable).values({
    userId: req.userId!,
    planId: parsed.data.planId,
    planName: plan.name,
    status: "active",
    nextDelivery: nextDelivery.toISOString().split("T")[0],
    deliveryAddress: parsed.data.deliveryAddress,
    paymentMethod: parsed.data.paymentMethod,
  }).returning();

  res.status(201).json(formatSub(sub));
});

router.patch("/subscriptions/:id/cancel", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CancelSubscriptionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [sub] = await db.update(subscriptionsTable)
    .set({ status: "cancelled" })
    .where(and(eq(subscriptionsTable.id, params.data.id), eq(subscriptionsTable.userId, req.userId!)))
    .returning();

  if (!sub) { res.status(404).json({ error: "Subscription not found" }); return; }
  res.json(formatSub(sub));
});

export default router;
