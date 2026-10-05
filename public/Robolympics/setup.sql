-- Run once in the Supabase SQL editor for the configured project.
create table if not exists public.robolympics_state (
  id integer primary key check (id = 1),
  state jsonb not null default '{"teams":[],"activeTeamId":null,"startedAt":null,"stoppedAt":null}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.robolympics_state enable row level security;
revoke all on public.robolympics_state from anon, authenticated;
grant all on public.robolympics_state to service_role;

insert into public.robolympics_state (id) values (1) on conflict (id) do nothing;
