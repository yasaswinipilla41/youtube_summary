-- ============================================================================
-- AI Learning Platform — schema, triggers, and Row Level Security
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

-- ── Users (profile mirror of auth.users) ───────────────────────────────────
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  google_id  text,
  name       text,
  email      text not null unique,
  photo      text,
  role       text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now(),
  last_login timestamptz not null default now()
);

-- ── Search history ──────────────────────────────────────────────────────────
create table public.searches (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users (id) on delete cascade,
  topic              text not null,
  processing_time_ms integer,
  created_at         timestamptz not null default now()
);
create index searches_user_id_idx on public.searches (user_id, created_at desc);
create index searches_topic_idx on public.searches (lower(topic));

-- ── Videos fetched for a search ────────────────────────────────────────────
create table public.videos (
  id           uuid primary key default gen_random_uuid(),
  search_id    uuid not null references public.searches (id) on delete cascade,
  youtube_id   text not null,
  title        text not null,
  youtube_url  text not null,
  thumbnail    text,
  channel      text,
  duration     text,
  views        bigint,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);
create index videos_search_id_idx on public.videos (search_id);

-- ── AI-generated summaries ──────────────────────────────────────────────────
create table public.summaries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  search_id  uuid not null references public.searches (id) on delete cascade,
  topic      text not null,
  summary    text not null,
  pdf_url    text,
  created_at timestamptz not null default now()
);
create index summaries_user_id_idx on public.summaries (user_id, created_at desc);

-- ── Token usage ─────────────────────────────────────────────────────────────
create table public.token_usage (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users (id) on delete cascade,
  search_id         uuid references public.searches (id) on delete set null,
  topic             text,
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens      integer not null default 0,
  created_at        timestamptz not null default now()
);
create index token_usage_user_id_idx on public.token_usage (user_id, created_at desc);

-- ── Login history ───────────────────────────────────────────────────────────
create table public.login_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index login_history_user_id_idx on public.login_history (user_id, created_at desc);

-- ── PDF export history ──────────────────────────────────────────────────────
create table public.pdf_exports (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  summary_id uuid references public.summaries (id) on delete set null,
  topic      text,
  created_at timestamptz not null default now()
);
create index pdf_exports_user_id_idx on public.pdf_exports (user_id, created_at desc);

-- ============================================================================
-- Auto-create a profile row when a user signs in with Google for the first
-- time. Existing users keep their row; last_login is updated by the app.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, google_id, name, email, photo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'provider_id', new.raw_user_meta_data ->> 'sub'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
--
-- Students can only touch rows where user_id = auth.uid().
-- The admin dashboard NEVER queries with the anon/user key — it uses the
-- service-role key in server-side code only, which bypasses RLS.
-- ============================================================================
alter table public.users         enable row level security;
alter table public.searches      enable row level security;
alter table public.videos        enable row level security;
alter table public.summaries     enable row level security;
alter table public.token_usage   enable row level security;
alter table public.login_history enable row level security;
alter table public.pdf_exports   enable row level security;

-- users: read/update own profile only (role changes blocked below)
create policy "users_select_own" on public.users
  for select using (id = auth.uid());
create policy "users_update_own" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Prevent privilege escalation: users may not change their own role.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'role can only be changed server-side';
  end if;
  return new;
end;
$$;
create trigger users_role_guard
  before update on public.users
  for each row execute function public.prevent_role_change();

-- searches
create policy "searches_select_own" on public.searches
  for select using (user_id = auth.uid());
create policy "searches_insert_own" on public.searches
  for insert with check (user_id = auth.uid());
create policy "searches_delete_own" on public.searches
  for delete using (user_id = auth.uid());

-- videos: visible only via a search the student owns
create policy "videos_select_own" on public.videos
  for select using (
    exists (select 1 from public.searches s where s.id = search_id and s.user_id = auth.uid())
  );
create policy "videos_insert_own" on public.videos
  for insert with check (
    exists (select 1 from public.searches s where s.id = search_id and s.user_id = auth.uid())
  );

-- summaries
create policy "summaries_select_own" on public.summaries
  for select using (user_id = auth.uid());
create policy "summaries_insert_own" on public.summaries
  for insert with check (user_id = auth.uid());
create policy "summaries_delete_own" on public.summaries
  for delete using (user_id = auth.uid());

-- token_usage: students can read their own; only the server writes rows
create policy "token_usage_select_own" on public.token_usage
  for select using (user_id = auth.uid());

-- login_history: students can read their own; only the server writes rows
create policy "login_history_select_own" on public.login_history
  for select using (user_id = auth.uid());

-- pdf_exports
create policy "pdf_exports_select_own" on public.pdf_exports
  for select using (user_id = auth.uid());
create policy "pdf_exports_insert_own" on public.pdf_exports
  for insert with check (user_id = auth.uid());
