"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { NAMA_MAKS, validateNickname } from "@/lib/validasi";
import {
  Button,
  Chip,
  Icon,
  Logo,
  errorClass,
  helpClass,
  inputClass,
  labelClass,
} from "@/components/ui";
import { ProfilSekolahFields, useProfilSekolahForm } from "@/components/profil/ProfilSekolahFields";

export default function LoginScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const profil = useProfilSekolahForm();
  /** Galat dari Supabase (bukan validasi isian). */
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "guest" | null>(null);
  /** Langkah tampilan: pilih cara masuk, atau isi form tamu. */
  const [langkah, setLangkah] = useState<"pilih" | "tamu">("pilih");

  function bukaLangkah(l: "pilih" | "tamu") {
    setError(null);
    setLangkah(l);
    // Pindahkan fokus ke judul langkah baru (untuk keyboard dan pembaca layar).
    requestAnimationFrame(() => {
      const judul = document.querySelectorAll<HTMLElement>(`[data-judul="${l}"]`);
      Array.from(judul).find((el) => el.offsetParent !== null)?.focus();
    });
  }

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
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInAnonymously({
        options: { data: { display_name: nickname.trim(), jenjang: hasil.jenjang, sekolah: hasil.sekolah } },
      });
      if (error) throw error;

      if (data.user) {
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            nickname: nickname.trim(),
            jenjang: hasil.jenjang,
            school: hasil.sekolah,
          }, { onConflict: "id" });
        } catch {
          // Handled on server socket connect
        }
      }

      router.replace("/lobby");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal masuk sebagai tamu.");
      setLoading(null);
    }
  }

  const pesanGalat = error && (
    <p id="login-error" role="alert" className={errorClass}>
      {error}
    </p>
  );

  return (
    <div className="min-h-dvh bg-white sm:bg-surface lg:grid lg:grid-cols-2 lg:bg-white">
      <HeroPanel />

      <div className="relative flex min-h-dvh flex-col overflow-hidden sm:items-center sm:justify-center sm:px-6 sm:py-10 lg:px-16">
        {/* Hiasan latar desktop: kapsul tint di pojok kanan atas. */}
        <span aria-hidden="true" className="capsule absolute top-[7%] -right-10 hidden h-12 w-72 bg-orange-50 lg:block" />
        <span aria-hidden="true" className="capsule absolute top-[14%] right-[5%] hidden h-12 w-56 bg-violet-50 lg:block" />

        <main className="relative flex w-full flex-1 flex-col overflow-hidden bg-white px-6 pt-8 pb-6 sm:min-h-[720px] sm:max-w-[560px] sm:flex-none sm:rounded-card sm:border-[1.5px] sm:border-line sm:px-10 sm:pt-10 sm:pb-8 lg:min-h-0 lg:max-w-[460px] lg:overflow-visible lg:rounded-none lg:border-0 lg:p-0">
          {/* Hiasan latar ponsel/tablet. */}
          <span aria-hidden="true" className="capsule absolute top-12 -left-8 h-8 w-32 bg-violet-50 lg:hidden" />
          <span aria-hidden="true" className="capsule absolute top-28 -right-8 h-8 w-28 bg-orange-50 lg:hidden" />

          {langkah === "pilih" ? (
            <>
              {/* Ponsel/tablet: identitas aplikasi. Desktop: ada di panel kiri. */}
              <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center lg:hidden">
                <Logo size={96} />
                <h1 data-judul="pilih" tabIndex={-1} className="text-[28px] leading-tight font-extrabold focus:outline-none">
                  Study Clash Ranked
                </h1>
                <p className="max-w-[300px] text-base leading-6 text-muted">
                  Duel soal matematika 1 lawan 1. Lawanmu selalu selevel.
                </p>
                <ul className="flex flex-wrap justify-center gap-2" aria-label="Fitur">
                  <li><Chip tone="violet">Duel 1 lawan 1</Chip></li>
                  <li><Chip tone="orange">Selevel</Chip></li>
                  <li><Chip tone="ink">Peringkat</Chip></li>
                </ul>
              </div>

              <div className="relative hidden flex-col gap-2 pb-10 lg:flex">
                <h1 data-judul="pilih" tabIndex={-1} className="text-[40px] leading-tight font-extrabold tracking-tight focus:outline-none">
                  Selamat datang
                </h1>
                <p className="text-base text-muted">Pilih cara masuk untuk mulai bermain.</p>
              </div>

              <div className="relative flex flex-col gap-4">
                <Button onClick={handleGoogle} disabled={loading !== null}>
                  {loading === "google" ? "Mengalihkan..." : "Masuk dengan Google"}
                </Button>
                <div className="flex items-center gap-4 text-sm font-medium text-muted" aria-hidden="true">
                  <span className="h-px flex-1 bg-line" />
                  atau
                  <span className="h-px flex-1 bg-line" />
                </div>
                <Button variant="sekunder" onClick={() => bukaLangkah("tamu")} disabled={loading !== null}>
                  Main sebagai tamu
                </Button>
                {pesanGalat}
                <dl className="mt-2 flex flex-col gap-3 rounded-button border-[1.5px] border-line p-4 text-[13px] leading-5 text-muted sm:text-sm sm:leading-6">
                  <div className="flex items-start gap-3">
                    <dt className="shrink-0"><Chip tone="violet">Google</Chip></dt>
                    <dd>Akunmu bisa dipakai di perangkat mana saja.</dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="shrink-0"><Chip tone="netral">Tamu</Chip></dt>
                    <dd>Akun tamu hanya tersimpan di browser ini.</dd>
                  </div>
                </dl>
              </div>
            </>
          ) : (
            <form onSubmit={handleGuest} noValidate className="relative flex flex-1 flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => bukaLangkah("pilih")}
                  disabled={loading !== null}
                  className="-ml-2 flex h-11 items-center gap-1 rounded-xl px-2 text-sm font-bold text-ink hover:bg-surface disabled:text-subtle"
                >
                  <Icon name="kembali" size={20} />
                  Kembali
                </button>
                <Chip tone="netral">Mode tamu</Chip>
              </div>

              <div className="flex flex-col gap-1.5">
                <h1 data-judul="tamu" tabIndex={-1} className="text-[28px] leading-tight font-extrabold focus:outline-none lg:text-[34px]">
                  Main sebagai tamu
                </h1>
                <p className="text-base text-muted">Biar lawanmu selevel denganmu.</p>
              </div>

              <ProfilSekolahFields
                form={profil}
                note="Lawan hanya melihat nama panggilan dan sekolahmu."
                leading={
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nickname" className={labelClass}>
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
                      className={inputClass}
                    />
                    <p id="nickname-help" className={helpClass}>
                      Cukup pakai nama panggilan.
                    </p>
                    {nicknameError && (
                      <p id="nickname-error" className={errorClass}>
                        {nicknameError}
                      </p>
                    )}
                  </div>
                }
              />

              {pesanGalat}
              <div className="mt-auto flex flex-col gap-3 pt-2">
                <Button type="submit" disabled={loading !== null}>
                  {loading === "guest" ? "Masuk..." : "Mulai bermain"}
                </Button>
                <p className="flex items-center justify-center gap-2 text-center text-[13px] font-medium text-muted">
                  <Icon name="info" size={16} className="shrink-0" />
                  Akun tamu hanya tersimpan di browser ini.
                </p>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

/** Panel kiri desktop (>= 1024px): identitas dan keunggulan aplikasi. */
function HeroPanel() {
  const poin = ["Duel langsung 1 lawan 1", "Lawan dengan rating selevel", "Peringkat SD, SMP, dan SMA/SMK"];
  return (
    <section
      aria-labelledby="hero-judul"
      className="relative hidden min-h-dvh flex-col overflow-hidden bg-violet px-14 py-12 text-white lg:flex xl:px-20"
    >
      <span className="flex items-center gap-2 text-xl font-extrabold">
        <Logo size={48} tone="putih" />
        Study Clash Ranked
      </span>
      <div className="relative mt-[14vh] flex max-w-[520px] flex-col gap-6">
        <p id="hero-judul" className="text-5xl leading-[1.05] font-extrabold tracking-tight xl:text-6xl">
          Adu cepat hitung.
          <br />
          Naik peringkat.
        </p>
        <p className="text-lg leading-8 text-white/90">Duel soal matematika 1 lawan 1. Lawanmu selalu selevel.</p>
        <ul className="mt-4 flex flex-col gap-4">
          {poin.map((p) => (
            <li key={p} className="flex items-center gap-3 text-lg font-bold">
              <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-white/20">
                <Icon name="centang" size={16} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      {/* Hiasan: kapsul besar di pojok kanan bawah. */}
      <span aria-hidden="true" className="capsule absolute right-[-12%] bottom-[22%] h-40 w-[62%] bg-white/15" />
      <span aria-hidden="true" className="capsule absolute right-[-12%] bottom-[-3%] h-40 w-[60%] bg-orange" />
    </section>
  );
}
