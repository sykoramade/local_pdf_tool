# Supabase + Stripe Setup Guide

**Who this is for:** Managing Director (human). Do this once before auth and billing go live.
**Time required:** ~30 minutes.
**Prerequisite:** Vercel project deployed (or staging URL known for webhook testing).

---

## Part 0 — Should You Use a New or Existing Supabase Instance?

**Recommendation: New dedicated project. Do not share.**

Reasons:
- Mixing a production SaaS with hobby/personal projects creates shared rate limits — Supabase free tier allows 500MB DB and 2GB bandwidth across the entire *organization*, not per project. A busy personal project eats into LocalPDF's allowance.
- Accidental queries to the wrong project are impossible if LocalPDF has its own org or project.
- Billing is cleaner — you can see exactly what LocalPDF costs in isolation.
- Row-level security policies and auth settings won't conflict with other apps.
- When LocalPDF pays for itself, upgrading to Supabase Pro ($25/month) is a clean decision for this project alone.

**What to do:**
1. Create a **new Supabase organization** named `localpdf` (or add it as a new project in your existing org — either is fine, just keep it isolated).
2. Name the project: `localpdf-production`
3. Choose region closest to your Vercel deployment (US East if using Vercel defaults).
4. Set a strong database password and **save it in your password manager** — you'll need it if you ever connect directly.

---

## Part 1 — Supabase Setup

### 1.1 — Create Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name: `localpdf-production`
3. Database password: generate a strong one, save it
4. Region: `us-east-1` (or nearest to your Vercel region)
5. Click **Create new project** — wait ~2 minutes for provisioning

### 1.2 — Get Your API Keys

1. Dashboard → **Project Settings** → **API**
2. Copy these three values:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" (looks like `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon public" key under "Project API keys" |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" key — **keep this secret, server-side only** |

> The service role key bypasses RLS. Never expose it client-side. It is only used in the Stripe webhook handler (`/api/stripe/webhook`).

### 1.3 — Run the Database Schema

1. Dashboard → **SQL Editor** → **New query**
2. Paste the entire contents of `docs/supabase/schema.sql` (reproduced below for reference)
3. Click **Run**
4. Verify: go to **Table Editor** — you should see `user_profiles` table with columns: `id`, `is_pro`, `stripe_customer_id`, `stripe_subscription_id`, `pro_since`, `created_at`

```sql
-- LocalPDF Supabase schema
-- Run this in the Supabase SQL Editor once your project is created.

-- User profiles table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_pro boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  pro_since timestamptz,
  created_at timestamptz not null default now()
);

-- Row-level security: users can only read/update their own profile
alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 1.4 — Configure Auth Providers

**Magic Link (email):**
1. Dashboard → **Authentication** → **Providers** → **Email** → already enabled by default
2. Confirm "Enable Email Confirmations" is ON (users verify before they can sign in)

**Google OAuth (optional but recommended):**
1. Dashboard → **Authentication** → **Providers** → **Google**
2. Enable it
3. You'll need a Google Cloud project with OAuth credentials:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create project → APIs & Services → Credentials → Create OAuth Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://xxxxx.supabase.co/auth/v1/callback` (use your actual Supabase project URL)
4. Copy Client ID + Client Secret back into Supabase

**Redirect URL (important):**
1. Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-vercel-domain.vercel.app` (or custom domain)
3. Add to **Redirect URLs**: `https://your-vercel-domain.vercel.app/**`

---

## Part 2 — Stripe Setup

### 2.1 — Create Stripe Account / Project

If you already have a Stripe account, use it — Stripe doesn't need isolation the way Supabase does (products and webhooks are scoped per account, and you can use the same account for multiple products).

**Recommendation:** Use test mode until you're ready for real payments. Test mode keys start with `sk_test_`.

### 2.2 — Create the Product

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → **Products** → **Add product**
2. Name: `LocalPDF Pro`
3. Description: `Unlimited edits, annotations, signatures, and priority features`
4. Pricing model: **Recurring**
5. Price: `$9.00 / month` (USD)
6. Click **Save product**

### 2.3 — Get Your IDs

After creating the product, copy:

| Variable | Where to find it |
|----------|-----------------|
| `STRIPE_PRICE_ID` | On the product page, under Pricing — looks like `price_1Abc...` |
| `STRIPE_SECRET_KEY` | Dashboard → **Developers** → **API Keys** → Secret key (starts with `sk_live_` or `sk_test_`) |

> Use `sk_test_` + test price while developing. Switch to `sk_live_` when ready to charge real users.

### 2.4 — Set Up Webhook

The webhook receives events from Stripe when users subscribe or cancel.

**For local development (optional, use Stripe CLI):**
```bash
# Install Stripe CLI, then:
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# This prints a webhook signing secret — use it as STRIPE_WEBHOOK_SECRET for local dev
```

**For production (Vercel):**
1. Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Click on the webhook → **Signing secret** → Reveal → Copy as `STRIPE_WEBHOOK_SECRET`

---

## Part 3 — Configure Environment Variables

### 3.1 — Local development (.env.local)

Create `app/.env.local` (copy from `app/.env.local.example`):

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (use test keys locally)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  (from Stripe CLI when running locally)
STRIPE_PRICE_ID=price_...
```

> **Never commit `.env.local` to git.** It is already in `.gitignore`.

### 3.2 — Vercel (production)

1. Vercel Dashboard → your project → **Settings** → **Environment Variables**
2. Add each variable from the table above (use `sk_live_` keys for production)
3. Set `NEXT_PUBLIC_APP_URL` to your actual domain (e.g., `https://localpdf.tools`)
4. Redeploy after adding variables

---

## Part 4 — Verification Checklist

Run through this after setup to confirm everything works end-to-end:

### Auth
- [ ] Go to `/edit` → click **Sign In** → enter email → receive magic link → click link → returned to app as signed-in user
- [ ] `/account` page shows your email and plan (Free)
- [ ] Sign out works

### Billing
- [ ] Go to `/pricing` → click **Get Pro** → redirected to Stripe Checkout
- [ ] Use Stripe test card `4242 4242 4242 4242` (any future date, any CVC)
- [ ] After checkout: redirected to `/billing/success`
- [ ] `/account` shows plan as **Pro**
- [ ] In Supabase Table Editor → `user_profiles` → your row shows `is_pro = true`

### Webhook
- [ ] In Stripe Dashboard → Webhooks → your endpoint → recent deliveries shows `checkout.session.completed` with status 200

---

## Part 5 — Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is used **only** in `/api/stripe/webhook`. Never pass it to client-side code.
- The `STRIPE_SECRET_KEY` is server-side only. The app never sends it to the browser.
- `STRIPE_WEBHOOK_SECRET` is used to verify that webhook calls genuinely came from Stripe (prevents spoofed payment events). Do not skip this check.
- RLS policies on `user_profiles` ensure users can only read/update their own row — even if someone gets your anon key, they cannot read other users' subscription status.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Magic link goes to `localhost:3000` in production | Set **Site URL** in Supabase Auth settings to your Vercel domain |
| Webhook returns 400 | `STRIPE_WEBHOOK_SECRET` doesn't match — regenerate from Stripe dashboard |
| `is_pro` not updating after payment | Check Stripe webhook delivery logs — likely the webhook URL is wrong or not registered for `checkout.session.completed` |
| Google OAuth redirect error | Authorized redirect URI in Google Cloud must match exactly: `https://xxxxx.supabase.co/auth/v1/callback` |
| Can't sign in locally | Supabase Site URL may be set to production URL — add `http://localhost:3000/**` to Redirect URLs |
