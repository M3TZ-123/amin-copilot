# CopilotTN — Full Project Context

> **Purpose:** This document captures the complete context of the CopilotTN project so any AI agent or developer can continue work seamlessly.

---

## 1. Project Overview

**CopilotTN** is a SaaS dashboard for a Tunisian reseller of GitHub Copilot subscriptions. The admin manages user subscriptions, credits, and payments. Regular users can view their subscription status, credit balance, and payment history.

- **Repository:** https://github.com/M3TZ-123/amin-copilot.git
- **Branch:** `main`
- **Admin account (Clerk):** `moataz.ouertani@fsb.ucar.tn` — has `publicMetadata: { role: "admin" }` set in Clerk dashboard

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.1.6 | App Router, Turbopack, uses `proxy.ts` instead of deprecated `middleware.ts` |
| React | React | 19.2.3 | Server Components + Client Components |
| Language | TypeScript | 5.x | Strict mode |
| ORM | Prisma | 7.3.0 | Uses driver adapter pattern (NOT `new PrismaClient()` without args) |
| DB Adapter | `@prisma/adapter-neon` | 7.3.0 | Required for Prisma v7 |
| Database | Neon PostgreSQL | — | Serverless Postgres, connection via `@neondatabase/serverless` |
| Auth | Clerk (`@clerk/nextjs`) | 6.37.3 | Google OAuth, dark theme, `publicMetadata.role` for admin detection |
| UI | shadcn/ui | new-york style | 18+ components installed, slate base color, dark mode |
| CSS | Tailwind CSS | v4 | CSS-first config (no `tailwind.config` file), imports in `globals.css` |
| Data Fetching | React Query (`@tanstack/react-query`) | 5.90.20 | Client-side data fetching for admin pages |
| Charts | Recharts | 2.15.4 | Revenue chart on admin dashboard |
| Toasts | Sonner | 2.0.7 | Toast notifications |
| Validation | Zod | v4 (4.3.6) | Uses `.issues` (NOT `.errors` from Zod v3) |
| Webhook Verification | Svix | 1.84.1 | Clerk webhook signature verification |
| Date Utils | date-fns | 4.1.0 | Date formatting |
| Icons | lucide-react | 0.563.0 | Icon library |
| Fonts | Geist, Geist Mono | — | Via `next/font/google` |

---

## 3. Environment Variables

Required in `.env`:

```env
DATABASE_URL=               # Neon PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  # Clerk publishable key
CLERK_SECRET_KEY=           # Clerk secret key
CLERK_WEBHOOK_SECRET=       # Svix webhook signing secret (from Clerk dashboard → Webhooks)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 4. Project Structure

```
d:\copilot-dashboard\
├── prisma/
│   └── schema.prisma              # DB schema (4 models, 2 enums)
├── public/
├── src/
│   ├── proxy.ts                   # Next.js 16 proxy (replaces middleware.ts) — route protection
│   ├── app/
│   │   ├── layout.tsx             # Root layout: ClerkProvider + dark theme + Providers
│   │   ├── page.tsx               # Root redirect: admin → /admin, user → /dashboard
│   │   ├── globals.css            # Tailwind v4 CSS-first config
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (admin)/               # Route group for admin pages
│   │   │   ├── layout.tsx         # AdminGuard + Sidebar(admin) + TopBar(admin)
│   │   │   └── admin/
│   │   │       ├── page.tsx       # Admin overview: analytics cards + revenue chart
│   │   │       ├── loading.tsx    # Loading skeleton
│   │   │       ├── revenue-chart.tsx  # Recharts area chart component
│   │   │       ├── add-user/
│   │   │       │   └── page.tsx   # Sync Clerk users, activate pending, manage subscriptions
│   │   │       └── users/
│   │   │           ├── page.tsx   # Searchable users table
│   │   │           ├── new/
│   │   │           │   └── page.tsx  # Manual user creation form
│   │   │           └── [id]/
│   │   │               └── page.tsx  # User detail: credits, payments, status management
│   │   ├── (dashboard)/           # Route group for user pages
│   │   │   ├── layout.tsx         # Redirects admins to /admin + Sidebar(user) + TopBar(user)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       # User dashboard: credit card, status, activity feed
│   │   │   │   └── loading.tsx
│   │   │   └── history/
│   │   │       ├── page.tsx       # Full credit + payment history tables
│   │   │       └── loading.tsx
│   │   └── api/
│   │       ├── payments/
│   │       │   └── route.ts       # GET (revenue data), POST (record payment)
│   │       ├── users/
│   │       │   ├── route.ts       # GET (all users + balances), POST (create user)
│   │       │   ├── sync/
│   │       │   │   └── route.ts   # POST — sync all Clerk users into DB
│   │       │   └── [id]/
│   │       │       ├── route.ts   # GET (user detail), PATCH (update user)
│   │       │       ├── activate/
│   │       │       │   └── route.ts  # POST — activate pending subscription
│   │       │       └── credits/
│   │       │           └── route.ts  # GET (balance + history), POST (add credit)
│   │       └── webhooks/
│   │           └── clerk/
│   │               └── route.ts   # Clerk webhook: user.created/updated/deleted
│   ├── components/
│   │   ├── providers.tsx          # QueryClientProvider + TooltipProvider + Sonner
│   │   ├── admin/
│   │   │   ├── AddPaymentDialog.tsx   # Dialog for recording payments
│   │   │   ├── AnalyticsCards.tsx     # 4 stat cards on admin overview
│   │   │   ├── CreditAdjustDialog.tsx # Dialog for adjusting credits
│   │   │   └── UsersTable.tsx         # Searchable users table with React Query
│   │   ├── dashboard/
│   │   │   ├── ActivityFeed.tsx       # Recent credits + payments list
│   │   │   ├── CreditCard.tsx         # Credit balance display card
│   │   │   └── StatusBadge.tsx        # PENDING_ACTIVATION / ACTIVE / SUSPENDED / EXPIRED badge
│   │   ├── layout/
│   │   │   ├── AdminGuard.tsx         # Server component: redirects non-admins
│   │   │   ├── Sidebar.tsx            # Client component: variant="user"|"admin"
│   │   │   └── TopBar.tsx             # Client component: mobile nav + UserButton
│   │   └── ui/                        # shadcn/ui components (18 installed)
│   ├── generated/
│   │   └── prisma/                    # Auto-generated Prisma client
│   ├── lib/
│   │   ├── auth.ts                    # getRole(), isAdmin(), getClerkUserId()
│   │   ├── db.ts                      # Prisma client singleton with Neon adapter
│   │   ├── utils.ts                   # cn(), formatTND(), formatDate(), formatDateTime()
│   │   └── queries/
│   │       ├── credits.ts             # getCreditBalance, getCreditHistory, addCreditEntry, getTotalCreditsDistributed
│   │       ├── payments.ts            # getPaymentsByUser, createPayment, getTotalRevenue, getRevenueByMonth, getRecentPayments
│   │       └── users.ts              # getAllUsers, getUserByClerkId, getUserById, getUserWithDetails, createUser, updateUser, updateUserByClerkId, deleteUserByClerkId, getTotalUsers, getActiveSubscriptionCount, createSubscription, updateSubscriptionStatus, getLatestSubscription, getPendingUsers, getAllClerkDbUsers, upsertUserFromClerk
│   └── types/
│       └── index.ts                   # UserWithDetails, AdminAnalytics, RevenueByMonth, CreditEntry, PaymentEntry
├── .env                               # Environment variables (NOT committed)
├── .gitignore
├── components.json                    # shadcn/ui config
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── prisma.config.ts                   # Prisma v7 config file
└── tsconfig.json
```

---

## 5. Database Schema

### Enums

- **`Role`**: `ADMIN`, `USER`
- **`SubscriptionStatus`**: `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, `EXPIRED`

### Models

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `id` (UUID), `clerkId` (unique), `email` (unique), `fullName`, `role`, `createdAt` | Maps to `users` table. Has relations to subscriptions, credits, payments. |
| **Subscription** | `id` (UUID), `userId`, `status`, `startedAt`, `expiresAt`, `createdAt` | Maps to `subscriptions` table. Cascade deletes with User. |
| **CreditLedger** | `id` (UUID), `userId`, `delta` (int), `note`, `adminId`, `createdAt` | Maps to `credit_ledger` table. Tracks credit additions/deductions. Balance = SUM(delta). |
| **Payment** | `id` (UUID), `userId`, `amountTnd` (Decimal 10,3), `month` (YYYY-MM), `paidAt`, `note` | Maps to `payments` table. Amounts in Tunisian Dinar. |

### Key Design Decisions
- Credit balance is computed via `aggregate({ _sum: { delta: true } })` — no stored balance column.
- Payments use `Decimal(10,3)` for TND (Tunisian Dinar, 3 decimal places: millimes).
- All tables use `snake_case` in DB via `@@map` / `@map`, while Prisma uses `camelCase`.
- Generated Prisma client output: `src/generated/prisma/`.

---

## 6. Authentication & Authorization

### How Roles Work

1. **Clerk `publicMetadata`**: Admin role is set by adding `{ "role": "admin" }` to a user's public metadata in the Clerk dashboard.

2. **Role Detection** (`src/lib/auth.ts`):
   - First checks `sessionClaims.metadata.role` (fast path — requires custom session token config in Clerk).
   - Falls back to `currentUser()` from Clerk which always returns full `publicMetadata` (reliable).
   - Returns `"admin"` or `"user"`.

3. **Proxy-level Detection** (`src/proxy.ts`):
   - Cannot use `currentUser()` (runs in edge runtime).
   - Falls back to `clerkClient().users.getUser(userId)` to read `publicMetadata`.

### Route Protection (3 layers)

| Layer | File | Logic |
|---|---|---|
| **Proxy (edge)** | `src/proxy.ts` | Admins: only `/admin/*` and `/api/*` allowed, everything else → `/admin`. Users: `/admin/*` → `/dashboard`. Unauthenticated → `/sign-in`. |
| **Dashboard layout** | `src/app/(dashboard)/layout.tsx` | Server-side `redirect("/admin")` if admin (safety net). |
| **AdminGuard** | `src/components/layout/AdminGuard.tsx` | Server-side `redirect("/dashboard")` if not admin (safety net). |
| **API routes** | All admin API routes | Call `isAdmin()` and return 403 if not admin. |

### Strict Isolation
- **Admins are RESTRICTED to `/admin/*` routes only.** They cannot access `/dashboard`, `/history`, or any non-admin route.
- **Users are RESTRICTED from `/admin/*` routes.** They can access `/dashboard`, `/history`, and the root `/` (which redirects to `/dashboard`).
- The sidebar does NOT show cross-links. Admin sidebar only has admin routes, user sidebar only has user routes.

### Optional Optimization
To avoid the `clerkClient().users.getUser()` API call on every proxy request, configure a custom session token in Clerk:
1. Go to Clerk Dashboard → **Sessions** → **Customize session token**
2. Add: `{ "metadata": "{{user.public_metadata}}" }`
3. This embeds the role in the JWT so the proxy uses the fast path.

---

## 7. User Lifecycle & Subscription Flow

```
User signs up via Clerk
        │
        ▼
Clerk webhook (user.created) fires
        │
        ▼
User created in DB with role=USER
Subscription created with status=PENDING_ACTIVATION
        │
        ▼
Admin goes to /admin/add-user
        │
        ├─→ Clicks "Sync from Clerk" (imports any Clerk users not yet in DB)
        │
        ▼
Admin sees pending users in table
        │
        ▼
Admin clicks "Activate" on a user
        │
        ├─→ Sets initial credits (optional)
        ├─→ Records first payment (optional)
        │
        ▼
Subscription status → ACTIVE
User can now see their dashboard with credits, status, payment history
```

---

## 8. API Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/users` | Admin | All users with credit balances, latest subscription, last payment |
| POST | `/api/users` | Admin | Create user manually (with optional credits, payment, subscription) |
| POST | `/api/users/sync` | Admin | Sync all Clerk users into DB (upsert + create PENDING_ACTIVATION subs) |
| GET | `/api/users/[id]` | Admin | User detail with subscriptions, credits, payments |
| PATCH | `/api/users/[id]` | Admin | Update user name/email/subscription status |
| POST | `/api/users/[id]/activate` | Admin | Activate a pending subscription (+ optional credits & payment) |
| GET | `/api/users/[id]/credits` | Admin | Credit balance + history for a user |
| POST | `/api/users/[id]/credits` | Admin | Add credit entry (positive or negative delta) |
| GET | `/api/payments` | Admin | Revenue by month + recent payments |
| POST | `/api/payments` | Admin | Record a payment for a user |
| POST | `/api/webhooks/clerk` | Public | Clerk webhook: user.created / user.updated / user.deleted |

---

## 9. Key Pages

### Admin Pages (`/admin/*`)

| Route | Description |
|---|---|
| `/admin` | Overview dashboard with analytics cards (total users, active subs, revenue, credits distributed) + revenue area chart |
| `/admin/add-user` | **Main user management hub**: Sync from Clerk button, pending activation table with Activate button, stats cards, already activated table. |
| `/admin/users` | Searchable/filterable users table with status badges, credit balances, last payment |
| `/admin/users/new` | Manual user creation form (name, email, subscription status, initial credits, first payment) |
| `/admin/users/[id]` | User detail page with credit adjust dialog, add payment dialog, subscription management |

### User Pages (`/dashboard/*`)

| Route | Description |
|---|---|
| `/dashboard` | User's own dashboard: credit balance card, subscription status badge, recent activity feed |
| `/history` | Full credit history and payment history tables |

---

## 10. Components Architecture

### Providers (`src/components/providers.tsx`)
Wraps the entire app with:
- `QueryClientProvider` (React Query, 30s stale time, no refetch on window focus)
- `TooltipProvider` (shadcn/ui)
- `Sonner Toaster` (top-right, rich colors)

### Layout Components
- **`Sidebar`**: Client component, takes `variant: "user" | "admin"`. Renders appropriate nav links.
- **`TopBar`**: Client component, takes `variant`. Has mobile Sheet trigger + Clerk `UserButton`.
- **`AdminGuard`**: Server component wrapper for admin layout, redirects non-admins.

### Admin Components
- **`AnalyticsCards`**: Fetches `getTotalUsers()`, `getActiveSubscriptionCount()`, `getTotalRevenue()`, `getTotalCreditsDistributed()`.
- **`UsersTable`**: React Query `queryKey: ["admin-users"]`, search/filter, row click to navigate.
- **`CreditAdjustDialog`**: Mutation dialog for adjusting credits with delta + note.
- **`AddPaymentDialog`**: Mutation dialog for recording payments with amount + month + note.

### Dashboard Components
- **`CreditCard`**: Displays credit balance number.
- **`StatusBadge`**: Renders colored badge for `PENDING_ACTIVATION` (orange), `ACTIVE` (emerald), `SUSPENDED` (yellow), `EXPIRED` (red).
- **`ActivityFeed`**: Lists recent credit entries and payments.

---

## 11. Critical Technical Notes

### Next.js 16 Specifics
- **No `middleware.ts`** — Next.js 16 uses `proxy.ts` with an exported `proxy(request)` function and `config` object.
- The proxy function wraps Clerk's `clerkMiddleware` and passes a mock context object.

### Prisma v7 Specifics
- **Cannot use `new PrismaClient()` without arguments** — must pass a driver adapter.
- Uses `@prisma/adapter-neon` + `@neondatabase/serverless` for serverless Postgres.
- Config file: `prisma.config.ts` (not `.prismarc` or similar).
- Generated client at `src/generated/prisma/` (configured in schema.prisma).
- `prisma db push --skip-generate` is NOT supported in v7 — use `prisma db push` then `prisma generate` separately.

### Zod v4 Specifics
- Error property is `.issues` (NOT `.errors` from Zod v3).
- All API routes use `error.issues` in catch blocks.

### Tailwind CSS v4 Specifics
- CSS-first configuration — no `tailwind.config.js/ts` file.
- Config is in `src/app/globals.css` with `@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`.
- Required packages: `tw-animate-css`, `shadcn` (for `shadcn/tailwind.css`).

### Clerk Auth Specifics
- `publicMetadata` is NOT included in JWT session claims by default.
- Code uses a two-step detection: check `sessionClaims.metadata.role` first, then fall back to `currentUser()` (or `clerkClient().users.getUser()` in proxy).
- Clerk themes: uses `dark` from `@clerk/themes` in the root `ClerkProvider`.

---

## 12. Query Layer Reference

### `src/lib/queries/users.ts`
| Function | Returns | Notes |
|---|---|---|
| `getAllUsers()` | All users with latest subscription, latest payment, credit entries | Used by `GET /api/users` |
| `getUserByClerkId(clerkId)` | Single user with latest subscription | Used for admin lookup |
| `getUserById(id)` | User with full history | |
| `getUserWithDetails(id)` | User with all subs, credits (with admin names), payments | |
| `createUser(data)` | Created user | `data: { clerkId, email, fullName, role? }` |
| `updateUser(id, data)` | Updated user | |
| `updateUserByClerkId(clerkId, data)` | Updated user | Used by webhook |
| `deleteUserByClerkId(clerkId)` | Deleted user | Used by webhook |
| `getTotalUsers()` | Count of users with role=USER | |
| `getActiveSubscriptionCount()` | Count of ACTIVE subscriptions | |
| `createSubscription(data)` | Created subscription | `data: { userId, status?, expiresAt? }` |
| `updateSubscriptionStatus(id, status)` | Updated subscription | |
| `getLatestSubscription(userId)` | Most recent subscription | |
| `getPendingUsers()` | Users with PENDING_ACTIVATION and no ACTIVE sub | |
| `getAllClerkDbUsers()` | All users with role=USER + latest sub | |
| `upsertUserFromClerk(data)` | Upserted user | Used by sync endpoint |

### `src/lib/queries/credits.ts`
| Function | Returns |
|---|---|
| `getCreditBalance(userId)` | Sum of all deltas (number) |
| `getCreditHistory(userId, limit?)` | Credit entries with admin names |
| `addCreditEntry(data)` | Created entry (`data: { userId, delta, note?, adminId }`) |
| `getTotalCreditsDistributed()` | Sum of all positive deltas |

### `src/lib/queries/payments.ts`
| Function | Returns |
|---|---|
| `getPaymentsByUser(userId, limit?)` | Payment list |
| `createPayment(data)` | Created payment (`data: { userId, amountTnd, month, note? }`) — uses `new Prisma.Decimal()` |
| `getTotalRevenue()` | Sum of all payment amounts (number) |
| `getRevenueByMonth()` | Array of `{ month, total }` |
| `getRecentPayments(limit)` | Payments with user info |

---

## 13. shadcn/ui Components Installed

`avatar`, `badge`, `button`, `card`, `chart`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `table`, `textarea`, `tooltip`

To add more: `npx shadcn@latest add <component>`

---

## 14. Development Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:push      # Push schema to DB
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

---

## 15. Known Issues & Future Work

### Current State
- All features are functional and build passes cleanly.
- Admin role detection works via Clerk `publicMetadata` with `currentUser()` fallback.
- Webhook creates users with `PENDING_ACTIVATION` on Clerk signup.
- Sync endpoint imports existing Clerk users into the DB.

### Potential Improvements
- **Clerk custom session token**: Configure `{ "metadata": "{{user.public_metadata}}" }` in Clerk dashboard to avoid API calls on every request in the proxy.
- **Clerk webhook setup**: Ensure the webhook endpoint (`/api/webhooks/clerk`) is registered in Clerk dashboard → Webhooks with events: `user.created`, `user.updated`, `user.deleted`.
- **Subscription expiry handling**: Add a cron job or scheduled function to auto-expire subscriptions past their `expiresAt` date.
- **Email notifications**: Notify users when their subscription is activated, about to expire, or suspended.
- **Pagination**: The users list currently fetches all users — add cursor-based pagination for scale.
- **Dashboard for users**: The user dashboard reads data server-side — consider adding React Query for real-time updates.
- **Audit logging**: Track admin actions (who activated whom, who adjusted credits, etc.) beyond what CreditLedger already captures.
- **Deployment**: Ready for Vercel deployment. Set all env vars in Vercel project settings.

---

## 16. Conversation History Summary

1. **Initial spec**: User described a full SaaS dashboard for managing GitHub Copilot subscriptions in Tunisia. Originally specified Drizzle ORM.
2. **Changed to Prisma**: User explicitly requested Prisma instead of Drizzle.
3. **Added React Query**: User requested React Query for client-side data fetching.
4. **Full implementation**: All dependencies installed, Prisma schema created and pushed to Neon, shadcn/ui initialized, DB client created, query layer built, types/utils/providers set up, Clerk auth configured, API routes built, user dashboard pages built, admin pages built, loading states added.
5. **Build error fixes** (iterative):
   - Missing `tw-animate-css` → installed
   - Missing `shadcn` package (for `shadcn/tailwind.css`) → installed
   - Missing `@clerk/themes` → installed
   - `middleware.ts` conflicts with `proxy.ts` in Next.js 16 → deleted `middleware.ts`
   - Zod v4 uses `.issues` not `.errors` → fixed in all API routes
   - Prisma v7 requires adapter → installed `@prisma/adapter-neon` + `@neondatabase/serverless`, rewrote `db.ts`
6. **Admin role bug**: User set admin role in Clerk but wasn't redirected. Root cause: Clerk doesn't include `publicMetadata` in JWT by default. Fixed by creating `src/lib/auth.ts` with `currentUser()` fallback, and updating proxy to use `clerkClient().users.getUser()` fallback.
7. **Route enforcement**: Made admins strictly restricted to `/admin/*` and users restricted from `/admin/*`. Three layers of protection (proxy, layout redirects, AdminGuard).
8. **Add User feature**: Added `PENDING_ACTIVATION` status, updated webhook to create pending users on Clerk signup, built `/api/users/sync` to import Clerk users, built `/api/users/[id]/activate` to activate subscriptions, created `/admin/add-user` page with sync button + activation UI.
9. **Pushed to GitHub**: https://github.com/M3TZ-123/amin-copilot.git

---

*Last updated: February 11, 2026*
