import { pgTable, text, serial, timestamp, real, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  items: jsonb("items").notNull().default([]),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  deliveryAddress: text("delivery_address"),
  trackingNumber: text("tracking_number"),
  estimatedDelivery: text("estimated_delivery"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("idx_orders_user_id").on(t.userId)]);

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  productName: text("product_name").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  imageUrl: text("image_url").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("idx_cart_user_id").on(t.userId)]);

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;
