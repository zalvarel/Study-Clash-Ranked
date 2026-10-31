"use client";
/* eslint-disable @next/next/no-img-element -- ikon SVG statis dari Figma */

import { ButtonLink, MobileColumn } from "@/components/ui";
import { useFinishedDuel, duelAgainHref } from "../use-finished-duel";

function formatDelta(delta: number) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `\u2212${Math.abs(delta)}`;
  return "0";
}

type Outcome = "me" | "opponent" | "draw";

const TITLES: Record<Outcome, string> = {
  me: "Kamu menang!",
  opponent: "Kamu kalah",
  draw: "Hasil seri",
};

function Badge({ outcome }: { outcome: Outcome }) {
  if (outcome === "me") {
    return (
      <div className="flex size-18 items-center justify-center rounded-full bg-ink">
        <img src="/figma/ikon-centang.svg" alt="" width={24.5} height={17} />
      </div>
    );
  }
  return (
    <div className="flex size-18 items-center justify-center rounded-full border-[1.5px] border-line bg-surface">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        {outcome === "opponent" ? (
          <path d="M11 11l14 14M25 11L11 25" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M10 14h16M10 22h16" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

export default function HasilScreen() {
  const duel = useFinishedDuel();

  if (!duel || !duel.result) {
    return (
      <MobileColumn className="items-center justify-center">
        <p role="status" className="text-muted">Memuat hasil...</p>
      </MobileColumn>
    );
  }

  const result = duel.result;
  const outcome = result.winner;
  const mine = result.scores.find(s => s.userId !== "bot")?.totalPoints ?? 0;
  const theirs = result.scores.find(s => s.userId === "bot" || s.userId !== result.scores[0]?.userId)?.totalPoints ?? 0;
  const wrong = result.review.filter(r => !r.wasCorrect).length;
  const delta = result.ratingChange;
  const before = result.ratingBefore;
  const after = result.ratingAfter;

  return (
    <MobileColumn className="px-4 py-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
        <Badge outcome={outcome} />
        <h1 className="text-[28px] font-bold">{TITLES[outcome]}</h1>
        <p className="text-base text-muted">Duel melawan {duel.opponent.nickname} selesai.</p>

        <div className="flex w-full items-start gap-3">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface p-4">
            <p className="text-[13px] text-muted">Poin akhir</p>
            <p className="text-[32px] font-bold tabular-nums">{mine} : {theirs}</p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface p-4">
            <p className="text-[13px] text-muted">Rating</p>
            <p className="text-[32px] font-bold tabular-nums">{formatDelta(delta)}</p>
            <p className="text-[13px] font-semibold text-muted">
              {duel.mode === "bot" ? "Mode latihan" : <>{before} <span aria-label="menjadi">&rarr;</span> {after}</>}
            </p>
          </div>
        </div>

        <p className="text-[15px] leading-[23px] text-muted">
          {wrong > 0
            ? `Ada ${wrong} soal yang bisa kamu pelajari.`
            : "Semua jawaban benar. Sempurna!"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {wrong > 0 && <ButtonLink href="/pembahasan">Lihat Pembahasan</ButtonLink>}
        <ButtonLink href={duelAgainHref(duel)} variant={wrong > 0 ? "sekunder" : "utama"}>Duel Lagi</ButtonLink>
        <ButtonLink href="/lobby" variant="tautan">Ke Beranda</ButtonLink>
      </div>
    </MobileColumn>
  );
}
