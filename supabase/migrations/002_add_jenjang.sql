-- Tambah kolom jenjang ke profiles dan questions

-- Profil: jenjang sekolah pemain
alter table profiles add column if not exists jenjang text check (jenjang in ('SD', 'SMP', 'SMA'));

-- Questions: jenjang untuk filter soal per jenjang sekolah
alter table questions add column if not exists jenjang text check (jenjang in ('SD', 'SMP', 'SMA'));

-- Recreate leaderboard view dengan kolom jenjang (termasuk pemain baru)
drop view if exists leaderboard_global;
create view leaderboard_global as
  select id, nickname, jenjang, school, rating, games_played,
         rank() over (order by rating desc) as rank
  from profiles;

-- Index untuk query per jenjang
create index if not exists idx_profiles_jenjang on profiles(jenjang);
create index if not exists idx_questions_jenjang on questions(jenjang);
