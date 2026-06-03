import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { AddToCartBody, RemoveCartItemParams } from "@workspace/api-zod";

const GUEST_USER_ID = 1;

const router: IRouter = Router();

async function buildCart(userId: number) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    items: items.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      price: i.price,
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    total: Math.round(total * 100) / 100,
    promoCode: null,
    discount: null,
  };
}

router.get("/cart", async (req, res): Promise<void> => {
  const userId = GUEST_USER_ID;
  res.json(await buildCart(userId));
});

router.post("/cart", async (req, res): Promise<void> => {
  const userId = GUEST_USER_ID;
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const [existing] = await db.select().from(cartItemsTable).where(
    and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, parsed.data.productId))
  );

  if (existing) {
    await db.update(cartItemsTable)
      .set({ quantity: existing.quantity + parsed.data.quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      userId,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: parsed.data.quantity,
      imageUrl: product.imageUrl,
    });
  }

  res.json(await buildCart(userId));
});

router.delete("/cart", async (_req, res): Promise<void> => {
  const userId = GUEST_USER_ID;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.json({ message: "Cart cleared" });
});

router.delete("/cart/:itemId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = RemoveCartItemParams.safeParse({ itemId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid itemId" }); return; }
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
  res.json(await buildCart(GUEST_USER_ID));
});

export default router;
