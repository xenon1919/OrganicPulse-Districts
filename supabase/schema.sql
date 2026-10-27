-- OrganicPulse Districts - initial schema
-- Run in the Supabase SQL editor (or via `supabase db push` once linked).

create extension if not exists "pgcrypto";

create table if not exists hubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  neighborhood text not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('household', 'receiver', 'partner')),
  name text not null,
  hub_id uuid references hubs (id) on delete set null,
  receiver_type text check (receiver_type in ('manufacturer', 'gardener', 'both')),
  green_points integer not null default 0,
  tier text not null default 'Sprout',
  created_at timestamptz not null default now()
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references profiles (id) on delete cascade,
  hub_id uuid not null references hubs (id) on delete cascade,
  category_a_kg numeric(6, 2) not null default 0,
  category_b_kg numeric(6, 2) not null default 0,
  category_c_kg numeric(6, 2) not null default 0,
  photo_url text,
  sam_verification jsonb,
  collected_at timestamptz not null default now(),
  verified_by uuid references profiles (id) on delete set null
);

-- One active "what's in my caddy right now" declaration per household, built
-- up from the 3-button log screen between collection days. The partner scan
-- consumes it (becomes a `collections` row) and it's cleared/reset.
create table if not exists caddy_declarations (
  household_id uuid primary key references profiles (id) on delete cascade,
  category_a_kg numeric(6, 2) not null default 0,
  category_b_kg numeric(6, 2) not null default 0,
  category_c_kg numeric(6, 2) not null default 0,
  photo_url text,
  updated_at timestamptz not null default now()
);

create table if not exists inventory_batches (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid not null references hubs (id) on delete cascade,
  category text not null check (category in ('A', 'B', 'C')),
  available_kg numeric(6, 2) not null default 0,
  status text not null default 'open' check (status in ('open', 'claimed', 'fulfilled')),
  created_at timestamptz not null default now()
);

create table if not exists demand_requests (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references profiles (id) on delete cascade,
  category text not null check (category in ('A', 'B', 'C')),
  desired_kg numeric(6, 2) not null,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  inventory_batch_id uuid not null references inventory_batches (id) on delete cascade,
  demand_request_id uuid not null references demand_requests (id) on delete cascade,
  agent_rationale text,
  status text not null default 'proposed' check (status in ('proposed', 'claimed', 'fulfilled')),
  matched_at timestamptz not null default now()
);

create table if not exists green_points_ledger (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references profiles (id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Row level security: every table is owner/role scoped. Service-role key bypasses RLS
-- for the SAM verification + matching agent server routes.

alter table hubs enable row level security;
alter table profiles enable row level security;
alter table caddy_declarations enable row level security;
alter table collections enable row level security;
alter table inventory_batches enable row level security;
alter table demand_requests enable row level security;
alter table matches enable row level security;
alter table green_points_ledger enable row level security;

create policy "hubs are readable by any authenticated user" on hubs
  for select to authenticated using (true);

create policy "users can read their own profile" on profiles
  for select to authenticated using (auth.uid() = id);

create policy "users can update their own profile" on profiles
  for update to authenticated using (auth.uid() = id);

create policy "users can insert their own profile" on profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "households manage their own caddy declaration" on caddy_declarations
  for all to authenticated using (auth.uid() = household_id) with check (auth.uid() = household_id);

create policy "partners can read caddy declarations at their hub" on caddy_declarations
  for select to authenticated using (
    exists (
      select 1 from profiles p
      join profiles h on h.id = caddy_declarations.household_id
      where p.id = auth.uid() and p.role = 'partner' and p.hub_id = h.hub_id
    )
  );

create policy "households manage their own collections" on collections
  for all to authenticated using (auth.uid() = household_id) with check (auth.uid() = household_id);

create policy "partners can read collections at their hub" on collections
  for select to authenticated using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'partner' and p.hub_id = collections.hub_id
    )
  );

create policy "inventory is readable by any authenticated user" on inventory_batches
  for select to authenticated using (true);

create policy "receivers manage their own demand requests" on demand_requests
  for all to authenticated using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

create policy "matches are readable by the related receiver" on matches
  for select to authenticated using (
    exists (
      select 1 from demand_requests d
      where d.id = matches.demand_request_id and d.receiver_id = auth.uid()
    )
  );

create policy "households can read their own points ledger" on green_points_ledger
  for select to authenticated using (auth.uid() = household_id);
