import { pgTable, text, serial, timestamp, real, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  interval: text("interval").notNull(),
  features: text("features").array().notNull().default([]),
  popular: boolean("popular").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlansTable.id),
  planName: text("plan_name").notNull(),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  nextDelivery: text("next_delivery").notNull(),
  deliveryAddress: text("delivery_address"),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("idx_subscriptions_user_id").on(t.userId)]);

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlansTable).omit({ id: true, createdAt: true });
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlansTable.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true, createdAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
