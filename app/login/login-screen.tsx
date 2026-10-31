"use client";
/* eslint-disable @next/next/no-img-element -- logo SVG statis dari Figma */

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { NAMA_MAKS, validateNickname } from "@/lib/validasi";
import { Button, MobileColumn } from "@/components/ui";
import { ProfilSekolahFields, useProfilSekolahForm } from "@/components/profil/ProfilSekolahFields";

export default function LoginScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const profil = useProfilSekolahForm();
  /** Galat dari Supabase (bukan validasi isian). */
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
    setError(null);
    // Periksa semua kolom sekaligus, lalu fokus ke kolom pertama yang salah.
    const namaGalat = validateNickname(nickname);
    setNicknameError(namaGalat);
    const hasil = profil.validate();
    if (namaGalat || !hasil.ok) {
      document.getElementById(namaGalat || hasil.ok ? "nickname" : hasil.fokus)?.focus();
      return;
    }
    setLoading("guest");
    try {
      const { error } = await getSupabase().auth.signInAnonymously({
        options: { data: { display_name: nickname.trim(), jenjang: hasil.jenjang, sekolah: hasil.sekolah } },
      });
      if (error) throw error;
      router.replace("/lobby");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal masuk sebagai tamu.");
      setLoading(null);
    }
  }

  return (
    <MobileColumn className="px-6 pt-8 pb-6">
      {/* Atas (node 2:34) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
        <div className="flex size-24 items-center justify-center" aria-hidden="true">
          <img src="/figma/logo.svg" alt="" width={83.2} height={45.4232} className="-skew-x-[18deg]" />
        </div>
        <h1 className="text-[28px] font-bold">Study Clash Ranked</h1>
        <p className="text-base leading-6 text-muted">Duel soal matematika 1 lawan 1. Lawanmu selalu selevel.</p>
      </div>

      {/* Bawah (node 2:41) */}
      <form onSubmit={handleGuest} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor="nickname" className="text-sm font-semibold">
            Nama panggilan
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            autoComplete="nickname"
            maxLength={NAMA_MAKS}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameError(null);
            }}
            placeholder="Contoh: Budi"
            aria-invalid={nicknameError ? true : undefined}
            aria-describedby={nicknameError ? "nickname-help nickname-error" : "nickname-help"}
            className="h-13 w-full rounded-xl border-[1.5px] border-ink bg-white px-4 text-base text-ink placeholder:text-subtle focus-visible:outline-offset-2 aria-invalid:border-danger"
          />
          <p id="nickname-help" className="text-sm leading-[21px] text-muted">
            Cukup pakai nama panggilan. Lawan hanya melihat nama ini.
          </p>
          {nicknameError && (
            <p id="nickname-error" className="text-sm font-medium text-danger">
              {nicknameError}
            </p>
          )}
        </div>

        <ProfilSekolahFields form={profil} />

        {error && (
          <p id="login-error" role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={loading !== null}>
            {loading === "guest" ? "Masuk..." : "Mulai"}
          </Button>
          <Button variant="tautan" onClick={handleGoogle} disabled={loading !== null} className="h-11 text-sm">
            {loading === "google" ? "Mengalihkan..." : "Masuk dengan Google"}
          </Button>
        </div>
      </form>
    </MobileColumn>
  );
}
