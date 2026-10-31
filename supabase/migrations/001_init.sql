-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique not null,
  school text,
  rating int not null default 1000,
  games_played int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── QUESTIONS ───────────────────────────────────────────────────────────────
create table questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null default 'math',
  topic text not null,
  difficulty int not null check (difficulty between 1 and 5),
  type text not null check (type in ('mcq','numeric')),
  body text not null,
  options jsonb,
  answer text not null,
  explanation text not null,
  time_limit_sec int not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── DUELS ───────────────────────────────────────────────────────────────────
create table duels (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('ranked','bot','room')),
  status text not null check (status in ('waiting','running','finished','abandoned')),
  room_code text,
  player1_id uuid references profiles(id),
  player2_id uuid references profiles(id),
  bot_level int,
  winner_id uuid references profiles(id),
  p1_rating_before int, p1_rating_after int,
  p2_rating_before int, p2_rating_after int,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── DUEL QUESTIONS ──────────────────────────────────────────────────────────
create table duel_questions (
  duel_id uuid references duels(id) on delete cascade,
  position int not null,
  question_id uuid references questions(id),
  primary key (duel_id, position)
);

-- ─── DUEL ANSWERS ────────────────────────────────────────────────────────────
create table duel_answers (
  id uuid primary key default gen_random_uuid(),
  duel_id uuid references duels(id) on delete cascade,
  user_id uuid references profiles(id),
  is_bot boolean not null default false,
  position int not null,
  answer text,
  is_correct boolean not null,
  response_ms int not null,
  points int not null default 0,
  unique (duel_id, user_id, position)
);

-- ─── LEADERBOARD VIEW ────────────────────────────────────────────────────────
create view leaderboard_global as
  select id, nickname, school, rating, games_played,
         rank() over (order by rating desc) as rank
  from profiles where games_played > 0;

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index idx_profiles_rating on profiles(rating desc);
create index idx_duels_player1 on duels(player1_id);
create index idx_duels_player2 on duels(player2_id);
create index idx_duel_answers_duel on duel_answers(duel_id);
create index idx_questions_subject_difficulty on questions(subject, difficulty);
create index idx_questions_active on questions(is_active) where is_active = true;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table questions enable row level security;
alter table duels enable row level security;
alter table duel_questions enable row level security;
alter table duel_answers enable row level security;

-- profiles: public read (nickname/school/rating only), own write
create policy "profiles_public_read" on profiles
  for select using (true);

create policy "profiles_own_insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_own_update" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- questions: NO client access (service role only)
-- (No policies created = no access for anon/authenticated role)

-- duels: players can read their own duels
create policy "duels_read_own" on duels
  for select using (
    auth.uid() = player1_id or auth.uid() = player2_id
  );

-- duel_questions: players in the duel can read (but server filters out answer)
create policy "duel_questions_read_own" on duel_questions
  for select using (
    exists (
      select 1 from duels
      where duels.id = duel_questions.duel_id
      and (duels.player1_id = auth.uid() or duels.player2_id = auth.uid())
    )
  );

-- duel_answers: players can read their own answers
create policy "duel_answers_read_own" on duel_answers
  for select using (
    auth.uid() = user_id
  );

-- NOTE: writes to duels, duel_questions, duel_answers, and profiles.rating
-- are handled exclusively by the server using service role key (bypasses RLS).
