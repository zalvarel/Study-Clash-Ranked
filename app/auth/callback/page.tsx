"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const TIMEOUT_MS = 10_000;

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") ?? params.get("error");

    let supabase;
    try {
      supabase = getSupabase();
    } catch (e) {
      queueMicrotask(() => setError(e instanceof Error ? e.message : String(e)));
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      router.replace("/lobby");
    };

    // Client otomatis menukar ?code= dengan session (PKCE); tunggu hasilnya.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish();
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (data.session) finish();
      else if (error || oauthError) setError(error?.message ?? oauthError);
    });

    const timer = setTimeout(() => {
      if (!done) setError(oauthError ?? "Sesi tidak ditemukan. Silakan coba masuk lagi.");
    }, TIMEOUT_MS);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      {error ? (
        <div className="space-y-4 text-center">
          <p role="alert" className="text-red-600">
            Gagal masuk: {error}
          </p>
          <Link href="/login" className="text-indigo-600 underline">
            Kembali ke halaman login
          </Link>
        </div>
      ) : (
        <p className="text-zinc-500">Menyelesaikan proses masuk...</p>
      )}
    </main>
  );
}
