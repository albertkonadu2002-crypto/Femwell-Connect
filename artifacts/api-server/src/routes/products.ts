import { Router, type IRouter } from "express";
import { eq, avg, count } from "drizzle-orm";
import { db, productsTable, reviewsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
  CreateProductBody,
  ListProductReviewsParams,
  CreateReviewParams,
  CreateReviewBody,
} from "@workspace/api-zod";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  const products = await db.select().from(productsTable);

  let result = products;
  if (query.success && query.data.category) {
    result = result.filter(p => p.category === query.data.category);
  }
  if (query.success && query.data.featured !== undefined) {
    result = result.filter(p => p.featured === query.data.featured);
  }

  const withRatings = await Promise.all(result.map(async (p) => {
    const ratingResult = await db
      .select({ avg: avg(reviewsTable.rating), count: count(reviewsTable.id) })
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, p.id));
    return {
      ...p,
      rating: ratingResult[0]?.avg ? Number(ratingResult[0].avg) : null,
      reviewCount: Number(ratingResult[0]?.count ?? 0),
    };
  }));

  res.json(withRatings);
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).where(eq(productsTable.featured, true));
  const withRatings = await Promise.all(products.map(async (p) => {
    const ratingResult = await db
      .select({ avg: avg(reviewsTable.rating), count: count(reviewsTable.id) })
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, p.id));
    return {
      ...p,
      rating: ratingResult[0]?.avg ? Number(ratingResult[0].avg) : null,
      reviewCount: Number(ratingResult[0]?.count ?? 0),
    };
  }));
  res.json(withRatings);
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const ratingResult = await db
    .select({ avg: avg(reviewsTable.rating), count: count(reviewsTable.id) })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, product.id));

  res.json({
    ...product,
    rating: ratingResult[0]?.avg ? Number(ratingResult[0].avg) : null,
    reviewCount: Number(ratingResult[0]?.count ?? 0),
  });
});

router.post("/products", authMiddleware, adminMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json({ ...product, rating: null, reviewCount: 0 });
});

router.get("/products/:productId/reviews", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = ListProductReviewsParams.safeParse({ productId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid productId" }); return; }
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, params.data.productId));
  res.json(reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/products/:productId/reviews", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = CreateReviewParams.safeParse({ productId: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid productId" }); return; }
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [review] = await db.insert(reviewsTable).values({ ...parsed.data, productId: params.data.productId }).returning();
  res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
});

export default router;
