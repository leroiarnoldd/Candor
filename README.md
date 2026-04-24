# Candor — Platform

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Payments**: Stripe + Stripe Connect
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **Language**: TypeScript

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at supabase.com
2. Run `supabase-schema.sql` in the Supabase SQL editor
3. Copy your project URL and anon key

### 3. Set up Stripe
1. Create a Stripe account at stripe.com
2. Enable Stripe Connect for candidate wallet payouts
3. Copy your publishable and secret keys

### 4. Environment variables
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=https://app.getcandor.net
```

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy to Cloudflare Pages
1. Push to GitHub
2. Connect repo in Cloudflare Pages
3. Set environment variables in Cloudflare dashboard
4. Build command: `npm run build`
5. Output directory: `.next`

## Project Structure
```
src/
  app/                    # Next.js App Router pages
    auth/                 # Login, signup, verify
    onboarding/           # Candidate + company onboarding
    dashboard/            # Candidate + company dashboards
    profile/              # Profile management
    pitch/                # Pitch flow
    wallet/               # Wallet management
    api/                  # API routes
  components/             # Reusable components
    ui/                   # Base UI components
    forms/                # Form components
    layout/               # Layout components
    candidate/            # Candidate-specific
    company/              # Company-specific
    pitch/                # Pitch-specific
  lib/                    # Utility libraries
    supabase.ts           # Supabase client
    stripe.ts             # Stripe client + payment constants
  types/                  # TypeScript types
    database.ts           # Database types + interfaces
  styles/                 # Global styles
    globals.css           # Tailwind + custom CSS
```

## Payment Constants (pence)
| Action | Amount |
|--------|--------|
| Read a pitch | £2.70 |
| Decline with feedback | £7.10 |
| Confirmed hire | £30.00 |
| Confirmed freelance | £25.00 |
| Community answer | £15.00 |
| Office hours session | £30.00 |
| Case study published | £20.00 |
| Min withdrawal | £50.00 |
| Expert take rate | 10% |
| Sponsored problem (Candor keeps) | 40% |

## Pitch Prices
| Type | Price |
|------|-------|
| Employment | £50 |
| Freelance | £35 |

## Company Plans
| Plan | Price |
|------|-------|
| Starter | £299/month |
| Growth | £799/month |
| Enterprise | £2,000/month |
| Candidate Pro | £9.99/month |
| Candidate Expert | £24.99/month |
