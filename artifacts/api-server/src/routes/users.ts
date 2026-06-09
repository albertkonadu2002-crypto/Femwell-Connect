import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { RegisterUserBody, LoginUserBody, UpdateProfileBody } from "@workspace/api-zod";
import { authMiddleware, generateToken, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const SALT_ROUNDS = 10;

function formatUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash, ...rest } = u;
  return {
    ...rest,
    createdAt: rest.createdAt.toISOString(),
    phone: rest.phone ?? null,
    university: rest.university ?? null,
    deliveryAddress: rest.deliveryAddress ?? null,
  };
}

router.post("/users/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (existing) { res.status(400).json({ error: "Email already registered" }); return; }

  const passwordHash = await bcrypt.hash(parsed.data.password, SALT_ROUNDS);
  const [user] = await db.insert(usersTable).values({
    email: parsed.data.email,
    passwordHash,
    name: parsed.data.name,
    phone: parsed.data.phone,
    university: parsed.data.university,
  }).returning();

  res.status(201).json({ token: generateToken(user.id, user.role), user: formatUser(user) });
});

router.post("/users/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.json({ token: generateToken(user.id, user.role), user: formatUser(user) });
});

router.get("/users/me", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/users/me", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, string | undefined> = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.phone) updates.phone = parsed.data.phone;
  if (parsed.data.university) updates.university = parsed.data.university;
  if (parsed.data.deliveryAddress) updates.deliveryAddress = parsed.data.deliveryAddress;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

export default router;
