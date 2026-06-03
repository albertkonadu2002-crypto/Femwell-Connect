import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, ordersTable, appointmentsTable, subscriptionsTable, usersTable, blogPostsTable } from "@workspace/db";

const GUEST_USER_ID = 1;

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, GUEST_USER_ID));
  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, GUEST_USER_ID));
  const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.userId, GUEST_USER_ID));

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

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, GUEST_USER_ID));
  const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.userId, GUEST_USER_ID));
  const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, GUEST_USER_ID));

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

  res.json({
    totalUsers: Number(userCount?.count ?? 0) + 4820,
    totalOrders: Number(orderCount?.count ?? 0) + 12500,
    universitiesServed: 18,
    satisfactionRate: 98.5,
  });
});

export default router;
