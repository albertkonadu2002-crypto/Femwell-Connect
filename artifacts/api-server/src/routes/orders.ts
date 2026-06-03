import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, cartItemsTable } from "@workspace/db";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";

const GUEST_USER_ID = 1;

const router: IRouter = Router();

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    items: order.items as any[],
    createdAt: order.createdAt.toISOString(),
    estimatedDelivery: order.estimatedDelivery ?? null,
    trackingNumber: order.trackingNumber ?? null,
    deliveryAddress: order.deliveryAddress ?? null,
  };
}

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, GUEST_USER_ID));
  res.json(orders.map(formatOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, GUEST_USER_ID));
  if (cartItems.length === 0) { res.status(400).json({ error: "Cart is empty" }); return; }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const [order] = await db.insert(ordersTable).values({
    userId: GUEST_USER_ID,
    items: cartItems.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      price: i.price,
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    total: Math.round(total * 100) / 100,
    status: "confirmed",
    paymentMethod: parsed.data.paymentMethod,
    deliveryAddress: parsed.data.deliveryAddress,
    estimatedDelivery: deliveryDate.toISOString().split("T")[0],
    trackingNumber: `BHK${Date.now()}`,
  }).returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, GUEST_USER_ID));

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  res.json(formatOrder(order));
});

export default router;
