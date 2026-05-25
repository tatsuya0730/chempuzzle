# Supabase Specification

Last reviewed: 2026-05-25

## Environment Variables

The project uses these Supabase variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_DATABASE_URL`

Usage:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: browser-safe publishable key used by Auth and REST calls.
- `SUPABASE_SECRET_KEY`: server-only secret key for future privileged server routes. Do not expose it to client components.
- `SUPABASE_DATABASE_URL`: Postgres connection string used by tbls and database tooling.

## Authentication

Authentication uses Supabase Auth email/password endpoints through local Next.js API routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Session cookies:

- `cp_access_token`
- `cp_refresh_token`

Cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.

## Required Tables

### profiles

Stores public player profile data.

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 32),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

create unique index if not exists profiles_username_key
  on public.profiles (username);
```

Recommended RLS:

```sql
alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

### scores

Stores single-player ranking submissions.

```sql
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 0),
  level integer not null check (level >= 1),
  reaction_count integer not null default 0 check (reaction_count >= 0),
  highlight_molecule text,
  dominant_effect text check (dominant_effect in ('clean', 'toxic', 'sleep', 'energy', 'reactive', 'salt', 'inert')),
  dominant_acidity text check (dominant_acidity in ('acidic', 'neutral', 'basic', 'none')),
  created_at timestamptz not null default now()
);

create index if not exists scores_score_created_at_idx
  on public.scores (score desc, created_at asc);

create index if not exists scores_user_id_created_at_idx
  on public.scores (user_id, created_at desc);
```

Recommended RLS:

```sql
alter table public.scores enable row level security;

create policy "scores are publicly readable"
  on public.scores for select
  using (true);

create policy "users insert own scores"
  on public.scores for insert
  with check (auth.uid() = user_id);
```

Ranking query shape:

```sql
select
  scores.id,
  scores.score,
  scores.highlight_molecule,
  scores.created_at,
  profiles.display_name,
  profiles.username,
  profiles.avatar_url
from public.scores
join public.profiles on profiles.id = scores.user_id
order by scores.score desc, scores.created_at asc
limit 100;
```

### play_sessions

Stores single-player run summaries and supports My Page play history.

```sql
create table if not exists public.play_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('single', 'multi')),
  score integer not null check (score >= 0),
  level integer not null check (level >= 1),
  reaction_count integer not null default 0 check (reaction_count >= 0),
  max_chain integer not null default 0 check (max_chain >= 0),
  average_ph numeric(4, 2),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists play_sessions_user_id_created_at_idx
  on public.play_sessions (user_id, created_at desc);
```

Recommended RLS:

```sql
alter table public.play_sessions enable row level security;

create policy "users read own play sessions"
  on public.play_sessions for select
  using (auth.uid() = user_id);

create policy "users insert own play sessions"
  on public.play_sessions for insert
  with check (auth.uid() = user_id);
```

### multiplayer_rooms

Stores room configuration for online matches.

```sql
create table if not exists public.multiplayer_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  guest_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished', 'cancelled')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint multiplayer_rooms_code_length check (char_length(code) between 3 and 12)
);

create index if not exists multiplayer_rooms_status_created_at_idx
  on public.multiplayer_rooms (status, created_at desc);
```

Recommended RLS:

```sql
alter table public.multiplayer_rooms enable row level security;

create policy "participants read rooms"
  on public.multiplayer_rooms for select
  using (auth.uid() = host_user_id or auth.uid() = guest_user_id);

create policy "users create own rooms"
  on public.multiplayer_rooms for insert
  with check (auth.uid() = host_user_id);

create policy "participants update rooms"
  on public.multiplayer_rooms for update
  using (auth.uid() = host_user_id or auth.uid() = guest_user_id)
  with check (auth.uid() = host_user_id or auth.uid() = guest_user_id);
```

### multiplayer_events

Stores append-only match events for audit and replay.

```sql
create table if not exists public.multiplayer_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.multiplayer_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists multiplayer_events_room_id_id_idx
  on public.multiplayer_events (room_id, id);
```

Recommended RLS:

```sql
alter table public.multiplayer_events enable row level security;

create policy "participants read room events"
  on public.multiplayer_events for select
  using (
    exists (
      select 1
      from public.multiplayer_rooms rooms
      where rooms.id = room_id
        and (auth.uid() = rooms.host_user_id or auth.uid() = rooms.guest_user_id)
    )
  );

create policy "participants insert room events"
  on public.multiplayer_events for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.multiplayer_rooms rooms
      where rooms.id = room_id
        and (auth.uid() = rooms.host_user_id or auth.uid() = rooms.guest_user_id)
    )
  );
```

## Storage

For avatar images, use a private or public Storage bucket named `avatars`.

Recommended path convention:

```text
avatars/{user_id}/avatar.png
```

The current UI can crop locally and hold a data URL preview. Production upload should replace that data URL with a Storage object URL after upload.

Recommended Storage policies:

- users can upload to their own `{user_id}/` prefix
- users can update/delete their own avatar
- avatar objects can be publicly readable if the product wants public profile images

## Realtime

For multiplayer, enable Realtime on:

- `public.multiplayer_rooms`
- `public.multiplayer_events`

Suggested channel strategy:

- one room channel per room id
- broadcast board snapshots at a controlled interval
- persist important events to `multiplayer_events`
- use presence to show connection state

Supabase Realtime is enough for turn/event-style or casual 1v1 play. If the game later needs strict low-latency authoritative simulation, add a dedicated game server and use Supabase for auth, persistence, ranking, and post-match history.

## tbls Schema Export

The GitHub Actions workflow `.github/workflows/tbls-public-schema.yml` exports the `public` schema as Markdown using tbls and uploads it as an artifact.

Required GitHub secret:

```text
SUPABASE_DATABASE_URL=postgresql://...
```

The workflow writes generated schema docs to:

```text
docs/db/schema
```
