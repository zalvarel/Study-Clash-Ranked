"use client";

import { tampilanFitur } from "@/lib/ui-config";
import { ButtonLink, Chip, Icon, MobileColumn, type IconName } from "@/components/ui";
import { useFinishedDuel, duelAgainHref } from "../use-finished-duel";

function formatDelta(delta: number) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return "0";
}

type Outcome = "me" | "opponent" | "draw";

const TITLES: Record<Outcome, string> = {
  me: "Kamu menang!",
  opponent: "Kamu kalah",
  draw: "Hasil seri",
};

const BADGE: Record<Outcome, { icon: IconName; kelas: string; cincin: string }> = {
  me: { icon: "trofi", kelas: "bg-violet text-white", cincin: "ring-violet-50" },
  opponent: { icon: "silang", kelas: "bg-orange-50 text-orange-ink", cincin: "ring-orange-50/50" },
  draw: { icon: "seri", kelas: "bg-surface text-ink", cincin: "ring-surface" },
};

const MODE_LABEL = { ranked: "Ranked", bot: "Latihan", room: "Room" } as const;

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
  const delta = result.ratingChange;
  const before = result.ratingBefore;
  const after = result.ratingAfter;
  const benar = result.review.filter((r) => r.wasCorrect).length;
  const badge = BADGE[outcome];
  const laporkan = duel.mode !== "bot" ? tampilanFitur("laporkan") : null;

  return (
    <MobileColumn brandBar width="full" bareDesktop className="px-5 pt-6 pb-6 sm:px-8 lg:px-0 lg:pt-2">
      <div className="flex flex-1 flex-col gap-6 lg:grid lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Ringkasan */}
        <section className="relative flex flex-col items-center gap-4 overflow-hidden text-center lg:rounded-card lg:border-[1.5px] lg:border-line lg:bg-white lg:p-8">
          <span aria-hidden="true" className="capsule absolute -top-2 -left-6 h-9 w-36 bg-violet-100/70" />
          <span aria-hidden="true" className="capsule absolute top-6 -right-6 h-9 w-24 bg-orange-100/70" />
          <Chip tone="violetPenuh" className="relative">{MODE_LABEL[duel.mode]}</Chip>
          <span
            aria-hidden="true"
            className={`relative flex size-20 items-center justify-center rounded-full ring-[10px] ${badge.kelas} ${badge.cincin}`}
          >
            <Icon name={badge.icon} size={34} />
          </span>
          <div className="relative flex flex-col gap-1">
            <h1 className="text-[32px] leading-tight font-extrabold tracking-tight">{TITLES[outcome]}</h1>
            <p className="text-base text-muted">Duel melawan {duel.opponent.nickname} selesai.</p>
          </div>

          <div className="relative grid w-full grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-card-sm border-[1.5px] border-line bg-white p-4 lg:border-0 lg:bg-surface">
              <p className="text-[13px] font-semibold text-muted">Total poin</p>
              <p className="text-[34px] leading-tight font-extrabold tabular-nums">
                <span className="sr-only">Kamu </span>
                <span className="text-violet">{mine}</span>
                <span aria-hidden="true" className="px-1 text-muted">:</span>
                <span className="sr-only">, lawan </span>
                <span className="text-orange-ink">{theirs}</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-card-sm bg-violet p-4 text-white">
              <p className="text-[13px] font-semibold text-white/85">Rating</p>
              <p className="text-[34px] leading-tight font-extrabold tabular-nums">{formatDelta(delta)}</p>
              <p className="text-xs font-semibold text-white/85">
                {duel.mode === "bot" ? "Mode latihan" : <>{before} <span aria-label="menjadi">&rarr;</span> {after}</>}
              </p>
            </div>
          </div>

          <div className="relative mt-2 hidden w-full flex-col gap-3 lg:flex">
            <Tombol href={duelAgainHref(duel)} />
          </div>
        </section>

        {/* Rincian per soal */}
        <section aria-labelledby="rincian-judul" className="flex flex-col rounded-card border-[1.5px] border-line bg-white p-5 lg:p-8">
          <div className="flex items-baseline justify-between gap-3 pb-3">
            <h2 id="rincian-judul" className="text-lg font-extrabold lg:text-2xl">Rincian jawaban</h2>
            <p className="text-[13px] text-muted">
              {benar} dari {result.review.length} benar
            </p>
          </div>
          <ol className="flex flex-col">
            {result.review.map((r) => (
              <li key={r.position} className="flex items-center gap-4 border-b border-line py-3.5 last:border-b-0">
                <span className="w-16 shrink-0 text-[15px] font-bold text-muted">Soal {r.position + 1}</span>
                <span className="flex-1" />
                <span
                  className={`inline-flex items-center gap-2 text-sm font-bold ${r.wasCorrect ? "text-success" : "text-danger"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-7 items-center justify-center rounded-full ${r.wasCorrect ? "bg-success-bg" : "bg-danger-bg"}`}
                  >
                    <Icon name={r.wasCorrect ? "centang" : "silang"} size={16} strokeWidth={2.5} />
                  </span>
                  {r.wasCorrect ? "Benar" : "Salah"}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-1 flex items-center justify-between border-t-2 border-ink pt-4">
            <span className="text-base font-bold">Total poin</span>
            <span className="text-2xl font-extrabold text-violet tabular-nums">{mine}</span>
          </div>
        </section>

        <div className="flex flex-col gap-3 lg:hidden">
          <Tombol href={duelAgainHref(duel)} />
        </div>

        {laporkan && (
          <div className="flex items-center justify-center gap-2 lg:col-start-2 lg:justify-end">
            <button
              type="button"
              disabled
              className="text-sm font-bold text-subtle underline underline-offset-4"
            >
              Laporkan lawan
            </button>
            <Chip tone="netral">Segera hadir</Chip>
          </div>
        )}
      </div>
    </MobileColumn>
  );
}

function Tombol({ href }: { href: string }) {
  return (
    <>
      <ButtonLink href={href}>Main Lagi</ButtonLink>
      <ButtonLink href="/pembahasan" variant="sekunder">Lihat Pembahasan</ButtonLink>
      <ButtonLink href="/lobby" variant="tautan">Kembali ke Beranda</ButtonLink>
    </>
  );
}
