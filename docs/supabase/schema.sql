-- LocalPDF Supabase schema
-- Run this in the Supabase SQL Editor once your project is created.
-- Dashboard: https://supabase.com/dashboard → your project → SQL Editor

-- User profiles table
-- Extends Supabase auth.users with app-specific data
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
