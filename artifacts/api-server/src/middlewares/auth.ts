import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "femwellconnect_jwt_secret_change_in_production";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Authentication required" }); return; }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== "admin") { res.status(403).json({ error: "Admin access required" }); return; }
  next();
}

export function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export { JWT_SECRET };
