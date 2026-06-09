# Femwell Connect

A women's health e-commerce and telehealth platform for university students in Ghana. Features menstrual care products, wellness subscriptions, telehealth consultations, a health education blog, and a menstrual cycle tracker.

## Run & Operate

- `pnpm --filter @workspace/bloomher run dev` — run the frontend (Vite dev server)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — seed database with demo data (products, blog posts, subscription plans)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7.3, Tailwind CSS 4.1, shadcn/ui, TanStack Query, Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- **DB schema:** `lib/db/src/schema/` — 7 tables (users, products, orders, subscriptions, telehealth, blog, tracker)
- **API contract:** `lib/api-spec/openapi.yaml` — OpenAPI 3.1 spec (source of truth)
- **API routes:** `artifacts/api-server/src/routes/` — 10 route modules
- **Frontend pages:** `artifacts/bloomher/src/pages/` — 15 pages
- **Theme:** `artifacts/bloomher/src/index.css` — Femwell Connect brand colors (soft pinks, warm cream, eggplant darks)
- **Seed data:** `lib/db/src/seed.ts` — Demo products, blog posts, subscription plans

## Architecture decisions

- **OpenAPI-first:** The `openapi.yaml` is the single source of truth. React Query hooks and Zod schemas are auto-generated via Orval.
- **Domain-driven routes:** Both API routes and DB schemas are organized by business domain (products, cart, orders, subscriptions, telehealth, blog, tracker).
- **Guest user pattern:** Cart and orders use a hardcoded `GUEST_USER_ID = 1` for demo purposes. In production, this would use JWT-based auth.
- **Security-conscious dependencies:** `pnpm-workspace.yaml` enforces 1-day minimum release age for npm packages.

## Product

- E-commerce for menstrual care kits (Standard, Premium, Teen, Wellness Bundle)
- Subscription plans (Monthly, Quarterly, Semester)
- Telehealth consultations with qualified nurses
- Health education blog with articles on menstrual hygiene, family planning, wellness
- Menstrual cycle tracker with phase detection and product recommendations
- Payment via MTN MoMo, Telecel Cash, AirtelTigo, Visa, Mastercard

## Demo Credentials

- Email: `demo@femwellconnect.com`
- Password: `password123`

## Gotchas

- Run `pnpm --filter @workspace/db run push` before `seed` to ensure schema exists
- The frontend requires `PORT` and `BASE_PATH` env vars to run (defaults: 5173 and /)
- Orval codegen must run after any OpenAPI spec changes
