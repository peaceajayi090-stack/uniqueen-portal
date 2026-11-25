-- Uniqueen Interiors client portal — database setup. Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'client',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  name text not null,
  address text,
  stage text not null default 'Discovery',
  status text not null default 'Active',
  start_date date,
  target_date date,
  created_at timestamptz not null default now()
);

create or replace function public.owns_project(pid uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from public.projects where id = pid and client_id = auth.uid());
$$;

create table if not exists public.questionnaires (
  project_id uuid primary key references public.projects on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  number text not null unique,
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'Unpaid',
  vat_rate numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices on delete cascade,
  description text not null,
  qty numeric not null default 1,
  rate numeric not null default 0,
  position int not null default 0
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices on delete cascade,
  tx_ref text not null unique,
  flw_transaction_id text,
  amount numeric not null,
  currency text not null default 'NGN',
  method text not null default 'Flutterwave',
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  item text not null,
  room text,
  qty numeric not null default 1,
  total numeric not null default 0,
  paid numeric not null default 0,
  status text not null default 'Awaiting approval',
  expected_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.boq_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  section text not null,
  description text not null,
  spec text,
  unit text,
  qty numeric not null default 1,
  rate numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.questionnaires enable row level security;
alter table public.updates enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.orders enable row level security;
alter table public.boq_items enable row level security;

drop policy if exists "read own or admin" on public.profiles;
create policy "read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "admin writes" on public.profiles;
create policy "admin writes" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.projects;
create policy "admin all" on public.projects for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.projects;
create policy "client reads own" on public.projects for select using (client_id = auth.uid());
drop policy if exists "admin all" on public.questionnaires;
create policy "admin all" on public.questionnaires for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.questionnaires;
create policy "client reads own" on public.questionnaires for select using (public.owns_project(project_id));
drop policy if exists "admin all" on public.updates;
create policy "admin all" on public.updates for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.updates;
create policy "client reads own" on public.updates for select using (public.owns_project(project_id));
drop policy if exists "admin all" on public.invoices;
create policy "admin all" on public.invoices for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.invoices;
create policy "client reads own" on public.invoices for select using (public.owns_project(project_id));
drop policy if exists "admin all" on public.orders;
create policy "admin all" on public.orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.orders;
create policy "client reads own" on public.orders for select using (public.owns_project(project_id));
drop policy if exists "admin all" on public.boq_items;
create policy "admin all" on public.boq_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.boq_items;
create policy "client reads own" on public.boq_items for select using (public.owns_project(project_id));
drop policy if exists "client inserts own" on public.questionnaires;
create policy "client inserts own" on public.questionnaires for insert with check (public.owns_project(project_id));
drop policy if exists "client updates own" on public.questionnaires;
create policy "client updates own" on public.questionnaires for update using (public.owns_project(project_id)) with check (public.owns_project(project_id));
drop policy if exists "admin all" on public.invoice_items;
create policy "admin all" on public.invoice_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.invoice_items;
create policy "client reads own" on public.invoice_items for select using (exists (select 1 from public.invoices i where i.id = invoice_id and public.owns_project(i.project_id)));
drop policy if exists "admin all" on public.payments;
create policy "admin all" on public.payments for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.payments;
create policy "client reads own" on public.payments for select using (exists (select 1 from public.invoices i where i.id = invoice_id and public.owns_project(i.project_id)));

-- Make yourself admin (after creating your user in Authentication > Users):
-- update public.profiles set role = 'admin' where email = 'you@example.com';

-- ── Version 2: leads, approvals, files ──
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text, phone text, package text, location text,
  preferred_date date, message text, status text not null default 'New', notes text,
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
drop policy if exists "admin all" on public.leads;
create policy "admin all" on public.leads for all using (public.is_admin()) with check (public.is_admin());
alter table public.updates add column if not exists needs_approval boolean not null default false;
alter table public.updates add column if not exists approved_at timestamptz;
alter table public.updates add column if not exists approval_note text;
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  name text not null, path text not null unique, category text not null default 'Other',
  size_bytes bigint, uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.project_files enable row level security;
drop policy if exists "admin all" on public.project_files;
create policy "admin all" on public.project_files for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client reads own" on public.project_files;
create policy "client reads own" on public.project_files for select using (public.owns_project(project_id));
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 52428800) on conflict (id) do nothing;

-- ── Version 3: portfolio and testimonials (shown publicly on the home page) ──
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(), title text not null, location text, category text,
  image_path text not null, position int not null default 0, created_at timestamptz not null default now()
);
alter table public.portfolio_items enable row level security;
drop policy if exists "public reads" on public.portfolio_items;
create policy "public reads" on public.portfolio_items for select using (true);
drop policy if exists "admin all" on public.portfolio_items;
create policy "admin all" on public.portfolio_items for all using (public.is_admin()) with check (public.is_admin());
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(), client_name text not null, detail text, quote text not null,
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists "public reads" on public.testimonials;
create policy "public reads" on public.testimonials for select using (true);
drop policy if exists "admin all" on public.testimonials;
create policy "admin all" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());
insert into storage.buckets (id, name, public, file_size_limit)
values ('portfolio', 'portfolio', true, 20971520) on conflict (id) do nothing;
