import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, cartItemsTable } from "@workspace/db";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

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

router.get("/orders", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.userId!));
  res.json(orders.map(formatOrder));
});

router.post("/orders", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
  if (cartItems.length === 0) { res.status(400).json({ error: "Cart is empty" }); return; }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const [order] = await db.insert(ordersTable).values({
    userId: req.userId!,
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

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order || order.userId !== req.userId!) { res.status(404).json({ error: "Order not found" }); return; }

  res.json(formatOrder(order));
});

export default router;
