import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    amount: number;
    currency: string;
    reference: string;
    metadata: {
      orderId?: number;
      userId?: number;
    };
  };
}

const router: IRouter = Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

router.post("/payments/initialize", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const { orderId, email } = req.body as { orderId?: number; email?: string };

  if (!orderId || !email) {
    res.status(400).json({ error: "orderId and email are required" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order || order.userId !== req.userId!) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.status === "paid") {
    res.status(400).json({ error: "Order already paid" });
    return;
  }

  if (!PAYSTACK_SECRET) {
    res.status(500).json({ error: "Payment gateway not configured" });
    return;
  }

  const amountInPesewas = Math.round(order.total * 100);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountInPesewas,
      currency: "GHS",
      reference: `FW-${order.id}-${Date.now()}`,
      callback_url: `${FRONTEND_URL}/payment/verify`,
      metadata: {
        orderId: order.id,
        userId: req.userId!,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order.id,
          },
        ],
      },
    }),
  });

  const body = (await response.json()) as PaystackResponse;

  if (!body.status) {
    res.status(400).json({ error: body.message || "Payment initialization failed" });
    return;
  }

  res.json({
    authorization_url: body.data.authorization_url,
    reference: body.data.reference,
    access_code: body.data.access_code,
  });
});

router.get("/payments/verify/:reference", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const reference = Array.isArray(req.params.reference)
    ? req.params.reference[0]
    : req.params.reference;

  if (!reference) {
    res.status(400).json({ error: "Reference is required" });
    return;
  }

  if (!PAYSTACK_SECRET) {
    res.status(500).json({ error: "Payment gateway not configured" });
    return;
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  });

  const body = (await response.json()) as PaystackVerifyResponse;

  if (!body.status) {
    res.status(400).json({ error: body.message || "Verification failed" });
    return;
  }

  const tx = body.data;

  if (tx.status === "success") {
    const orderId = tx.metadata?.orderId;
    if (orderId) {
      await db
        .update(ordersTable)
        .set({ status: "paid" })
        .where(eq(ordersTable.id, Number(orderId)));
    }
  }

  res.json({
    status: tx.status,
    amount: tx.amount / 100,
    currency: tx.currency,
    reference: tx.reference,
    orderId: tx.metadata?.orderId,
  });
});

export default router;
