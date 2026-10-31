"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { isJenjang } from "@/lib/data/sekolah";
import type { Jenjang } from "@/lib/types";

export function displayName(user: User): string {
  const meta = user.user_metadata ?? {};
  return (
    meta.display_name ??
    meta.full_name ??
    meta.name ??
    user.email?.split("@")[0] ??
    "Pemain"
  );
}

export type ProfilSekolah = { jenjang: Jenjang; sekolah: string };

/** Jenjang dan sekolah dari user metadata; null kalau belum lengkap. */
export function readProfilSekolah(user: User): ProfilSekolah | null {
  const meta = user.user_metadata ?? {};
  const sekolah = typeof meta.sekolah === "string" ? meta.sekolah.trim() : "";
  return isJenjang(meta.jenjang) && sekolah ? { jenjang: meta.jenjang, sekolah } : null;
}

/** Simpan jenjang dan sekolah ke user metadata (dipakai /lengkapi). */
export async function saveProfilSekolah(profil: ProfilSekolah): Promise<void> {
  const { error } = await getSupabase().auth.updateUser({ data: profil });
  if (error) throw error;
}

/** Pengguna dari sesi yang tersimpan, tanpa redirect. */
export async function getSessionUser(): Promise<User | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.user ?? null;
}

type UseCurrentUserOptions = {
  /**
   * Wajib punya jenjang & sekolah. Kalau belum, diarahkan ke /lengkapi.
   * Default true; /lengkapi sendiri memakai false.
   */
  requireProfil?: boolean;
};

/** Pengguna yang sedang masuk. Kalau belum masuk, diarahkan ke /login. */
export function useCurrentUser({ requireProfil = true }: UseCurrentUserOptions = {}): User | null {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      router.replace("/login");
      return;
    }

    const terima = (u: User) => {
      if (requireProfil && !readProfilSekolah(u)) router.replace("/lengkapi");
      else setUser(u);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) terima(data.session.user);
      else router.replace("/login");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) terima(session.user);
      else router.replace("/login");
    });

    return () => sub.subscription.unsubscribe();
  }, [router, requireProfil]);

  return user;
}
