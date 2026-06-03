import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const cycleEntriesTable = pgTable("cycle_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end"),
  cycleLength: integer("cycle_length").default(28),
  symptoms: text("symptoms").array().default([]),
  flow: text("flow").default("medium"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCycleEntrySchema = createInsertSchema(cycleEntriesTable).omit({ id: true, createdAt: true });
export type InsertCycleEntry = z.infer<typeof insertCycleEntrySchema>;
export type CycleEntry = typeof cycleEntriesTable.$inferSelect;
