-- Kompas — database schema, row-level security and profile trigger.
-- Run this once in the Supabase SQL editor (or via the CLI) for your project.

-- ------------------------------------------------------------------ profiles
-- One row per registered user, holding the freelancer's business details
-- that appear on quotes and invoices. Created automatically on sign-up.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  voornaam   text,
  achternaam text,
  bedrijf    text,
  adres      text,
  postcode   text,
  plaats     text,
  telefoon   text,
  website    text,
  iban       text,
  kvk        text,
  btw        text,
  created_at timestamptz not null default now()
);

-- For databases created before contact fields existed:
alter table public.profiles add column if not exists telefoon text;
alter table public.profiles add column if not exists website  text;

-- ------------------------------------------------------------------- clients
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  bedrijf    text not null,
  contact    text,
  email      text,
  plaats     text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ projects
create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  naam       text not null,
  klant_id   uuid references public.clients (id) on delete set null,
  status     text not null default 'concept',
  deadline   text,
  uren        numeric not null default 0,
  raming      numeric not null default 0,
  tarief      numeric not null default 0,
  offerte_id  uuid,
  time_entries jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- For databases created before time tracking existed:
alter table public.projects
  add column if not exists time_entries jsonb not null default '[]'::jsonb;

-- -------------------------------------------------------------------- quotes
create table if not exists public.quotes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  nr         text not null,
  klant_id   uuid references public.clients (id) on delete set null,
  project    text,
  status     text not null default 'concept',
  datum      text,
  geldig_tot text,
  notitie    text,
  lines      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.quotes add column if not exists notitie text;

-- ------------------------------------------------------------------ invoices
create table if not exists public.invoices (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  nr         text not null,
  klant_id   uuid references public.clients (id) on delete set null,
  status     text not null default 'open',
  verval     text,
  datum      text,
  notitie    text,
  lines      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.invoices add column if not exists notitie text;

-- ------------------------------------------------------- row level security
alter table public.profiles enable row level security;
alter table public.clients  enable row level security;
alter table public.projects enable row level security;
alter table public.quotes   enable row level security;
alter table public.invoices enable row level security;

-- Profiles: a user may only read/write their own row.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Business data: every row is scoped to its owner.
do $$
declare t text;
begin
  foreach t in array array['clients','projects','quotes','invoices'] loop
    execute format('drop policy if exists "own rows" on public.%I;', t);
    execute format(
      'create policy "own rows" on public.%I for all
         using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- ------------------------------------------ auto-create profile on sign-up
-- Reads the extra fields passed in auth.signUp({ options: { data } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles
    (id, email, voornaam, achternaam, bedrijf, adres, postcode, plaats,
     telefoon, website, iban, kvk, btw)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'voornaam',
    new.raw_user_meta_data ->> 'achternaam',
    new.raw_user_meta_data ->> 'bedrijf',
    new.raw_user_meta_data ->> 'adres',
    new.raw_user_meta_data ->> 'postcode',
    new.raw_user_meta_data ->> 'plaats',
    new.raw_user_meta_data ->> 'telefoon',
    new.raw_user_meta_data ->> 'website',
    new.raw_user_meta_data ->> 'iban',
    new.raw_user_meta_data ->> 'kvk',
    new.raw_user_meta_data ->> 'btw'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
