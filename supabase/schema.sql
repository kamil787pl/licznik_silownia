-- Schemat zastosowany w projekcie Supabase "licznik-silownia" (migracja init_schema)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_emoji text not null default '💪',
  avatar_color text not null default '#c6f432',
  height_cm numeric(5,1) check (height_cm is null or (height_cm between 80 and 260)),
  birth_date date,
  sex text check (sex is null or sex in ('M','K','I')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.body_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  measured_on date not null default current_date,
  weight_kg numeric(5,1) not null check (weight_kg between 20 and 400),
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);
create table public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table public.workouts (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null default '',
  started_at timestamptz not null,
  ended_at timestamptz,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.profiles enable row level security;
alter table public.body_weights enable row level security;
alter table public.app_state enable row level security;
alter table public.workouts enable row level security;
create policy "profiles_own_select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_own_insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_own_update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "bw_own_all" on public.body_weights for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "state_own_all" on public.app_state for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "workouts_own_all" on public.workouts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- trigger: profil tworzony przy rejestracji (handle_new_user), touch_updated_at – patrz migracja w Supabase
