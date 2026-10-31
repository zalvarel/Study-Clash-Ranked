"use client";
/* eslint-disable @next/next/no-img-element -- pemuat SVG statis dari Figma */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { displayName, readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { useDuel } from "@/lib/duel";
import { findMatch, getDuelQuestions, type DuelMode } from "@/lib/api";
import { formatClock } from "@/lib/use-now";
import { ButtonLink, MobileColumn } from "@/components/ui";

/** Membaca ?mode=bot; ganti mode = mulai pencarian baru dari 00:00. */
export default function CariScreen() {
  const mode: DuelMode = useSearchParams().get("mode") === "bot" ? "bot" : "ranked";
  return <Pencarian key={mode} mode={mode} />;
}

function Pencarian({ mode }: { mode: DuelMode }) {
  const router = useRouter();
  const user = useCurrentUser();
  const name = user ? displayName(user) : null;
  const profil = user ? readProfilSekolah(user) : null;
  const jenjang = profil?.jenjang;
  const sekolah = profil?.sekolah;
  const { actions } = useDuel();
  const [seconds, setSeconds] = useState(0);

  // Timer naik dari 00:00.
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Cari lawan; begitu ketemu, langsung pindah ke duel.
  useEffect(() => {
    if (!name || !jenjang || !sekolah) return;
    const controller = new AbortController();
    // Lawan selalu sejenjang dengan pemain.
    findMatch(mode, jenjang, { signal: controller.signal })
      .then(async (match) => {
        const questions = await getDuelQuestions(match.duelId);
        if (controller.signal.aborted) return;
        actions.start({ name, jenjang, sekolah }, match, questions);
        router.replace("/duel");
      })
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) throw e;
      });
    return () => controller.abort();
  }, [name, jenjang, sekolah, mode, actions, router]);

  const isBot = mode === "bot";

  return (
    <MobileColumn className="p-6">
      {/* Tengah (node 2:79) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <div className="relative size-[120px]">
          <img src="/figma/pemuat-lingkaran.svg" alt="" width={120} height={120} className="absolute inset-0" />
          <div className="animate-putar absolute inset-0" aria-hidden="true">
            <img src="/figma/pemuat-busur.svg" alt="" width={60} height={60} className="absolute top-0 left-1/2" />
          </div>
          <p className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums">
            <span className="sr-only">Waktu mencari: </span>
            {formatClock(seconds)}
          </p>
        </div>
        <h1 className="text-2xl font-bold" aria-live="polite">
          {isBot ? "Menyiapkan bot..." : "Mencari lawan..."}
        </h1>
        <p className="text-base leading-6 text-muted">
          {isBot
            ? "Sebentar lagi latihan dimulai. Latihan tidak mengubah rating."
            : "Kami cari pemain dengan rating yang berdekatan denganmu, supaya duelnya adil."}
        </p>
      </div>

      {/* Bawah (node 2:88) */}
      <div className="flex flex-col gap-3">
        {!isBot && (
          <>
            <p className="text-center text-sm leading-[21px] text-muted">
              Belum ketemu lawan? Kamu bisa latihan lawan bot sambil menunggu.
            </p>
            <ButtonLink href="/cari?mode=bot" replace variant="sekunder">
              Latihan Lawan Bot
            </ButtonLink>
          </>
        )}
        <ButtonLink href="/lobby" variant="tautan">
          Batal
        </ButtonLink>
      </div>
    </MobileColumn>
  );
}
