# SaaS Starter Kit

A production-ready SaaS starter built with Next.js 14, Supabase, Stripe, and shadcn/ui. Ships with authentication, subscriptions, billing, and a dashboard — everything you need to launch a SaaS product.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Payments:** Stripe (subscriptions, webhooks)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

## Project Structure

```
app/
├── (auth)/           # Login, register pages
├── (dashboard)/      # Protected: dashboard, settings, billing
├── (marketing)/      # Public: landing page, pricing
└── api/              # Auth callback, Stripe webhooks

components/
├── auth/             # Login & register forms
├── dashboard/        # Stats, billing, profile, activity
├── layout/           # Navbar, sidebar, header, footer
├── marketing/        # Hero, features, pricing, CTA
├── shared/           # Providers, loading spinner
└── ui/               # shadcn/ui primitives

actions/              # Server Actions (auth, billing)
hooks/                # Custom hooks (useUser, useSubscription)
stores/               # Zustand stores
lib/                  # Utilities, validations, Stripe config
utils/supabase/       # Supabase client/server/middleware helpers
supabase/migrations/  # Database schema & RLS policies
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account

### 1. Clone & install

```bash
git clone https://github.com/plugin87/saas-starterkit.git
cd saas-starterkit
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your keys in `.env.local`:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |

### 3. Set up the database

Run the initial migration in your Supabase SQL Editor, or use the Supabase CLI:

```bash
supabase db push
```

This creates `profiles` and `subscriptions` tables with Row Level Security enabled, plus auto-triggers for profile creation on signup and `updated_at` timestamps.

### 4. Set up Stripe

1. Create products and prices in the Stripe Dashboard
2. Add the price IDs to `.env.local` (`STRIPE_PRICE_PRO_MONTHLY`, etc.)
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe`

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |

## Database Schema

**profiles** — extends Supabase `auth.users` with name, bio, website, and avatar.

**subscriptions** — tracks Stripe customer/subscription IDs, plan tier (FREE/PRO/TEAM), and billing period.

Both tables have RLS enabled. Users can only read/update their own data.

## Subscription Tiers

| Tier | Description |
|---|---|
| Free | Default on signup |
| Pro | Monthly or yearly, via Stripe |
| Team | Monthly, via Stripe |

## License

MIT
