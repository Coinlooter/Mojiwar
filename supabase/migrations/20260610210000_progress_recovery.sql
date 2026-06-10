create table public.progress_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  color_slug text not null,
  animal_slug text not null,
  number_suffix text not null check (number_suffix ~ '^\d{2}$'),
  created_at timestamptz not null default now(),
  unique (color_slug, animal_slug, number_suffix)
);

create table public.progress_recovery_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  attempted_at timestamptz not null default now()
);

create index progress_recovery_attempts_ip_hash_attempted_at_idx
  on public.progress_recovery_attempts (ip_hash, attempted_at desc);

alter table public.progress_recovery_codes enable row level security;
alter table public.progress_recovery_attempts enable row level security;

revoke all on public.progress_recovery_codes from anon, authenticated;
revoke all on public.progress_recovery_attempts from anon, authenticated;

grant select on public.progress_recovery_codes to authenticated;

create policy "Users can read their own recovery code"
on public.progress_recovery_codes
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.lookup_progress_recovery_code(
  p_color_slug text,
  p_animal_slug text,
  p_number_suffix text
)
returns uuid
language sql
security definer
set search_path = public
as $$
  select user_id
  from public.progress_recovery_codes
  where color_slug = p_color_slug
    and animal_slug = p_animal_slug
    and number_suffix = p_number_suffix
  limit 1;
$$;

revoke execute on function public.lookup_progress_recovery_code(text, text, text)
  from public, anon, authenticated;

grant execute on function public.lookup_progress_recovery_code(text, text, text)
  to service_role;
