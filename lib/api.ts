/**
 * Pintu akses data untuk layar.
 * Fungsi-fungsi yang sebelumnya mock kini terhubung ke Supabase / Socket.IO.
 */
import { getSupabase } from "@/lib/supabase";
import { readProfilSekolah } from "@/lib/auth";
import type { Jenjang } from "@/lib/duel";

export type { Jenjang };
export type DuelMode = "ranked" | "bot" | "room";

export type PlayerSummary = {
  name: string;
  rating: number;
  jenjang: Jenjang;
  sekolah: string;
};

export type Profile = PlayerSummary & { rank: number };

export type LeaderboardEntry = PlayerSummary & { rank: number };

export type Leaderboard = {
  jenjang: Jenjang | null;
  entries: LeaderboardEntry[];
  me: LeaderboardEntry;
};

export { cariSekolah, DAFTAR_JENJANG, JENJANG_LABEL, isJenjang } from "@/lib/data/sekolah";

export async function getProfile(): Promise<Profile> {
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error("Sesi tidak ditemukan.");

  const profil = readProfilSekolah(user);
  if (!profil) throw new Error("Profil belum lengkap.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rating, games_played")
    .eq("id", user.id)
    .maybeSingle();

  const currentRating = profile?.rating ?? 1000;

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("rating", currentRating);

  const meta = user.user_metadata ?? {};
  const name = meta.display_name ?? meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "Pemain";

  return {
    name,
    rating: currentRating,
    jenjang: profil.jenjang,
    sekolah: profil.sekolah,
    rank: (count ?? 0) + 1,
  };
}

export async function getLeaderboard(jenjang?: Jenjang): Promise<Leaderboard> {
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  const profil = user ? readProfilSekolah(user) : null;
  const meta = user?.user_metadata ?? {};
  const myName = meta.display_name ?? meta.full_name ?? meta.name ?? user?.email?.split("@")[0] ?? "Pemain";

  let entries: LeaderboardEntry[] = [];
  let myRating = 1000;
  let myRank = 1;

  try {
    let query = supabase
      .from("profiles")
      .select("id, nickname, jenjang, school, rating")
      .order("rating", { ascending: false });

    if (jenjang) query = query.eq("jenjang", jenjang);
    const { data: rows } = await query.limit(10);

    if (rows && rows.length > 0) {
      entries = rows.map((r, index) => ({
        name: r.nickname || "Pemain",
        rating: r.rating || 1000,
        jenjang: (r.jenjang ?? profil?.jenjang ?? "SMA") as Jenjang,
        sekolah: r.school ?? "",
        rank: index + 1,
      }));
    }

    if (user?.id) {
      const { data: p } = await supabase.from("profiles").select("rating").eq("id", user.id).maybeSingle();
      if (p?.rating) myRating = p.rating;

      let countQuery = supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gt("rating", myRating);

      if (jenjang) countQuery = countQuery.eq("jenjang", jenjang);
      const { count } = await countQuery;
      myRank = (count ?? 0) + 1;
    }
  } catch (err) {
    console.warn("Failed to load leaderboard from database:", err);
  }

  const me: LeaderboardEntry = {
    name: myName,
    rating: myRating,
    jenjang: profil?.jenjang ?? "SMA",
    sekolah: profil?.sekolah ?? "",
    rank: myRank,
  };

  return { jenjang: jenjang ?? null, entries, me };
}
