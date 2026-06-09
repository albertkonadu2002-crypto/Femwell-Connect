import { Router, type IRouter } from "express";
import { eq, count, sql, avg, countDistinct } from "drizzle-orm";
import { db, ordersTable, appointmentsTable, subscriptionsTable, usersTable, reviewsTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.userId!));
  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));
  const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.userId, req.userId!));

  const today = new Date().toISOString().split("T")[0];
  const upcomingAppts = appts.filter(a => a.date >= today && a.status === "scheduled");
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const lastOrder = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  res.json({
    totalOrders: orders.length,
    activeSubscription: sub?.status === "active" ? true : false,
    upcomingAppointments: upcomingAppts.length,
    totalSpent: Math.round(totalSpent * 100) / 100,
    lastOrderStatus: lastOrder?.status ?? null,
    nextDeliveryDate: sub?.nextDelivery ?? null,
  });
});

router.get("/dashboard/recent-activity", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.userId!));
  const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.userId, req.userId!));
  const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));

  const activity = [
    ...orders.map((o, i) => ({
      id: i + 1,
      type: "order" as const,
      title: `Order #${o.id} placed`,
      description: `${o.status} — GHS ${o.total.toFixed(2)} via ${o.paymentMethod}`,
      createdAt: o.createdAt.toISOString(),
    })),
    ...appts.map((a, i) => ({
      id: orders.length + i + 1,
      type: "appointment" as const,
      title: `Appointment with ${a.nurseName}`,
      description: `${a.type.replace(/_/g, " ")} — ${a.date} at ${a.time}`,
      createdAt: a.createdAt.toISOString(),
    })),
    ...subs.map((s, i) => ({
      id: orders.length + appts.length + i + 1,
      type: "subscription" as const,
      title: `Subscribed to ${s.planName}`,
      description: `Status: ${s.status} — Next delivery: ${s.nextDelivery}`,
      createdAt: s.createdAt.toISOString(),
    })),
  ];

  activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(activity.slice(0, 10));
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [userCount] = await db.select({ count: count(usersTable.id) }).from(usersTable);
  const [orderCount] = await db.select({ count: count(ordersTable.id) }).from(ordersTable);

  const [uniCount] = await db
    .select({ count: countDistinct(usersTable.university) })
    .from(usersTable)
    .where(sql`${usersTable.university} IS NOT NULL`);

  const [ratingResult] = await db
    .select({ avg: avg(reviewsTable.rating) })
    .from(reviewsTable);

  const satisfactionRate = ratingResult?.avg
    ? Math.round(Number(ratingResult.avg) * 20 * 10) / 10
    : 98.5;

  res.json({
    totalUsers: Number(userCount?.count ?? 0),
    totalOrders: Number(orderCount?.count ?? 0),
    universitiesServed: Number(uniCount?.count ?? 0),
    satisfactionRate,
  });
});

export default router;
