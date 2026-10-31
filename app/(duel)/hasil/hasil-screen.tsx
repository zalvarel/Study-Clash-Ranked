"use client";
/* eslint-disable @next/next/no-img-element -- ikon SVG statis dari Figma */

import { getDuelResult, type DuelOutcome as Outcome } from "@/lib/api";
import { ButtonLink, MobileColumn } from "@/components/ui";
import { duelAgainHref, useFinishedDuelData } from "../use-finished-duel";

const TITLES: Record<Outcome, string> = {
  menang: "Kamu menang!",
  kalah: "Kamu kalah",
  seri: "Hasil seri",
};

function formatDelta(delta: number) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return "0";
}

/** Lencana (node 3:21). Desain hanya punya varian menang; kalah/seri memakai bentuk yang sama. */
function Badge({ outcome }: { outcome: Outcome }) {
  if (outcome === "menang") {
    return (
      <div className="flex size-18 items-center justify-center rounded-full bg-ink">
        <img src="/figma/ikon-centang.svg" alt="" width={24.5} height={17} />
      </div>
    );
  }
  return (
    <div className="flex size-18 items-center justify-center rounded-full border-[1.5px] border-line bg-surface">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        {outcome === "kalah" ? (
          <path d="M11 11l14 14M25 11L11 25" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M10 14h16M10 22h16" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

export default function HasilScreen() {
  const { data: result, error } = useFinishedDuelData(getDuelResult);

  if (!result) {
    return (
      <MobileColumn className="items-center justify-center">
        <p role={error ? "alert" : "status"} className={error ? "text-danger" : "text-muted"}>
          {error ? `Gagal memuat hasil: ${error}` : "Memuat hasil..."}
        </p>
      </MobileColumn>
    );
  }

  const { outcome, myScore: mine, opponentScore: theirs, ratingDelta: delta, ratingBefore: before } = result;
  const total = result.totalQuestions;
  const wrong = total - result.correctCount;

  return (
    <MobileColumn className="px-4 py-6">
      {/* Tengah (node 3:20) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
        <Badge outcome={outcome} />
        <h1 className="text-[28px] font-bold">{TITLES[outcome]}</h1>
        <p className="text-base text-muted">Duel melawan {result.opponent.name} selesai.</p>

        <div className="flex w-full items-start gap-3">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface p-4">
            <p className="text-[13px] text-muted">Skor akhir</p>
            <p className="text-[32px] font-bold tabular-nums">
              {mine} : {theirs}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface p-4">
            <p className="text-[13px] text-muted">Rating</p>
            <p className="text-[32px] font-bold tabular-nums">{formatDelta(delta)}</p>
            <p className="text-[13px] font-semibold text-muted">
              {result.mode === "bot" ? (
                "Mode latihan"
              ) : (
                <>
                  {before} <span aria-label="menjadi">→</span> {result.ratingAfter}
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-[15px] leading-[23px] text-muted">
          {wrong > 0
            ? `Kamu menjawab benar ${result.correctCount} dari ${total} soal. Ada ${wrong} soal yang bisa kamu pelajari.`
            : `Kamu menjawab benar ${result.correctCount} dari ${total} soal. Sempurna!`}
        </p>
      </div>

      {/* Tombol (node 3:36) */}
      <div className="flex flex-col gap-3">
        {wrong > 0 && <ButtonLink href="/pembahasan">Lihat Pembahasan</ButtonLink>}
        <ButtonLink href={duelAgainHref(result)} variant={wrong > 0 ? "sekunder" : "utama"}>
          Duel Lagi
        </ButtonLink>
        <ButtonLink href="/lobby" variant="tautan">
          Ke Beranda
        </ButtonLink>
      </div>
    </MobileColumn>
  );
}
