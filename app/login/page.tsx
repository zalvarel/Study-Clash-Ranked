"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const MIN_LETTERS = 2;
const MAX_LENGTH = 20;

function validateNickname(raw: string): string | null {
  const name = raw.trim();
  const letters = name.match(/\p{L}/gu)?.length ?? 0;
  if (letters < MIN_LETTERS) return `Nama panggilan minimal ${MIN_LETTERS} huruf.`;
  if (name.length > MAX_LENGTH) return `Nama panggilan maksimal ${MAX_LENGTH} karakter.`;
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "guest" | null>(null);

  // Kalau sudah login, langsung ke lobby.
  useEffect(() => {
    let active = true;
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (active && data.session) router.replace("/lobby");
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      // Browser akan diarahkan ke Google.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal masuk dengan Google.");
      setLoading(null);
    }
  }

  async function handleGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateNickname(nickname);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setLoading("guest");
    try {
      const { error } = await getSupabase().auth.signInAnonymously({
        options: { data: { display_name: nickname.trim() } },
      });
      if (error) throw error;
      router.replace("/lobby");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal masuk sebagai tamu.");
      setLoading(null);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Study Clash Ranked</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Duel matematika 1 vs 1. Naik peringkat, kuasai leaderboard.
          </p>
        </header>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading !== null}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
        >
          {loading === "google" ? "Mengalihkan..." : "Masuk dengan Google"}
        </button>

        <div className="flex items-center gap-3 text-xs uppercase text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          atau
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <form onSubmit={handleGuest} className="space-y-3" noValidate>
          <label htmlFor="nickname" className="block text-sm font-medium">
            Nama panggilan
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            autoComplete="nickname"
            maxLength={MAX_LENGTH}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="mis. Budi"
            aria-invalid={error !== null}
            aria-describedby={error ? "login-error" : undefined}
            className="w-full rounded-lg border border-zinc-300 bg-transparent px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700"
          />
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "guest" ? "Masuk..." : "Main sebagai tamu"}
          </button>
        </form>

        {error && (
          <p id="login-error" role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
