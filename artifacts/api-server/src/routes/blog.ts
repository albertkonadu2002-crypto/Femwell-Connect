import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, blogPostsTable } from "@workspace/db";
import { ListBlogPostsQueryParams, GetBlogPostParams, CreateBlogPostBody } from "@workspace/api-zod";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

function formatPost(p: typeof blogPostsTable.$inferSelect) {
  return {
    ...p,
    publishedAt: p.publishedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/blog/posts", async (req, res): Promise<void> => {
  const query = ListBlogPostsQueryParams.safeParse(req.query);
  let posts = await db.select().from(blogPostsTable);

  if (query.success) {
    if (query.data.category) {
      posts = posts.filter(p => p.category === query.data.category);
    }
    if (query.data.featured !== undefined) {
      posts = posts.filter(p => p.featured === query.data.featured);
    }
    if (query.data.search) {
      const s = query.data.search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.excerpt.toLowerCase().includes(s)
      );
    }
  }

  res.json(posts.map(formatPost));
});

router.post("/blog/posts", authMiddleware, adminMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [post] = await db.insert(blogPostsTable).values(parsed.data).returning();
  res.status(201).json(formatPost(post));
});

router.get("/blog/posts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetBlogPostParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, params.data.id));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  res.json(formatPost(post));
});

router.get("/blog/categories", async (_req, res): Promise<void> => {
  const posts = await db.select().from(blogPostsTable);
  const categoryMap = new Map<string, number>();

  posts.forEach(p => {
    categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1);
  });

  const CATEGORIES = [
    { name: "Menstrual Hygiene", slug: "menstrual-hygiene", description: "Tips and education on period care" },
    { name: "Reproductive Health", slug: "reproductive-health", description: "Comprehensive reproductive health guidance" },
    { name: "Family Planning", slug: "family-planning", description: "Contraception and family planning resources" },
    { name: "Women's Wellness", slug: "womens-wellness", description: "Holistic health and wellbeing for women" },
    { name: "Student Health", slug: "student-health", description: "Health tips for university students" },
  ];

  const result = CATEGORIES.map(cat => ({
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    postCount: categoryMap.get(cat.name) ?? 0,
  }));

  res.json(result);
});

export default router;
