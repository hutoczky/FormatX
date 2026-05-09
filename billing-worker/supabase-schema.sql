create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  billing_address text not null,
  tax_number text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_name, contact_email)
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  plan_id text not null,
  plan_name text not null,
  billing_cycle text not null,
  amount_huf integer not null,
  currency text not null default 'HUF',
  max_technicians integer not null,
  max_devices integer not null,
  payment_provider text not null,
  payment_mode text not null,
  provider_customer_id text,
  provider_subscription_id text unique,
  provider_checkout_session_id text not null unique,
  checkout_url text not null,
  subscription_status text not null,
  payment_status text not null,
  valid_until timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null unique references subscriptions(id) on delete cascade,
  license_key text not null unique,
  license_status text not null default 'active',
  company_name text not null,
  contact_email text not null,
  plan_id text not null,
  billing_cycle text not null,
  max_technicians integer not null,
  max_devices integer not null,
  payment_provider text not null,
  provider_customer_id text,
  provider_subscription_id text,
  payment_status text not null,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  valid_until timestamptz not null
);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  event_type text not null,
  status text not null,
  payload jsonb not null,
  processed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists license_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references licenses(id) on delete set null,
  verification_source text not null,
  request_ip text,
  user_agent text,
  result text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_subscriptions_company_id on subscriptions(company_id);
create index if not exists idx_subscriptions_status on subscriptions(subscription_status, payment_status);
create index if not exists idx_licenses_license_key on licenses(license_key);
create index if not exists idx_payment_events_provider_event_id on payment_events(provider_event_id);
create index if not exists idx_license_activations_license_id on license_activations(license_id);
