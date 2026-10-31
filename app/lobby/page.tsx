"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

function displayName(user: User): string {
  const meta = user.user_metadata ?? {};
  return (
    meta.display_name ??
    meta.full_name ??
    meta.name ??
    user.email?.split("@")[0] ??
    "Pemain"
  );
}

export default function LobbyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      router.replace("/login");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
      else router.replace("/login");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUser(session.user);
      else router.replace("/login");
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    await getSupabase().auth.signOut();
    router.replace("/login");
  }

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Memuat...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
        <p className="text-sm uppercase tracking-wide text-zinc-500">Lobby</p>
        <h1 className="text-2xl font-bold">Halo, {displayName(user)}!</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {user.is_anonymous ? "Masuk sebagai tamu" : user.email}
        </p>
        <p className="text-sm text-zinc-400">Matchmaking segera hadir.</p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 font-medium transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {signingOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </main>
  );
}
