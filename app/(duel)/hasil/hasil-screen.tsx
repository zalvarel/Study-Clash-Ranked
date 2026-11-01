"use client";

import { useState } from "react";
import { useCurrentUser } from "@/lib/auth";
import { reportEnabled, tierBerikutnya, UI_DEMO } from "@/lib/ui-config";
import { ButtonLink, Chip, Icon, MobileColumn, type IconName } from "@/components/ui";
import { ReportSheet } from "@/components/duel/ReportSheet";
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
const MAIN_LAGI = { ranked: "Main Ranked Lagi", bot: "Latihan Lagi", room: "Main Ranked" } as const;

export default function HasilScreen() {
  const duel = useFinishedDuel();
  const user = useCurrentUser();
  const [lapor, setLapor] = useState(false);

  if (!duel || !duel.result) {
    return (
      <MobileColumn brandBar className="items-center justify-center">
        <p role="status" className="text-muted">Memuat hasil...</p>
      </MobileColumn>
    );
  }

  const result = duel.result;
  const outcome = result.winner;
  // Skor sendiri dicocokkan dengan id pengguna; kalau belum ada, pakai urutan bawaan.
  const skorSaya =
    result.scores.find((s) => user && s.userId === user.id) ?? result.scores.find((s) => s.userId !== "bot");
  const skorLawan = result.scores.find((s) => s !== skorSaya);
  const mine = skorSaya?.totalPoints ?? duel.myTotalPoints;
  const theirs = skorLawan?.totalPoints ?? 0;
  const benar = result.review.filter((r) => r.wasCorrect).length;
  const badge = BADGE[outcome];
  const ranked = duel.mode === "ranked";
  // Rating berubah di Ranked dan Room (Elo yang sama); Latihan bot tidak mengubah rating.
  const ubahRating = duel.mode !== "bot";
  // Tautan laporan disembunyikan sampai endpoint laporan di backend ada (kecuali mode demo UI).
  const bisaLapor = ranked && (reportEnabled || UI_DEMO);
  // Kemajuan tier untuk duel yang mengubah rating, dari rating setelah duel yang dikirim server.
  const berikut = ubahRating ? tierBerikutnya(result.ratingAfter) : null;

  return (
    <MobileColumn brandBar width="full" bareDesktop className="px-5 pt-6 pb-6 sm:px-8 lg:px-0 lg:pt-0">
      <div className="flex flex-1 flex-col gap-6 lg:grid lg:grid-cols-[minmax(22rem,27rem)_minmax(0,1fr)] lg:items-start lg:gap-8 min-[1440px]:gap-10">
        {/* Ringkasan */}
        <section className="relative flex flex-col items-center gap-4 overflow-hidden text-center lg:rounded-card lg:border-[1.5px] lg:border-line lg:bg-white lg:p-8 min-[1440px]:p-10">
          <span aria-hidden="true" className="capsule absolute -top-2 -left-6 h-9 w-36 bg-violet-100/70" />
          <span aria-hidden="true" className="capsule absolute top-6 -right-6 h-9 w-24 bg-orange-100/70" />
          <Chip tone="violetPenuh" className="relative">{MODE_LABEL[duel.mode]}</Chip>
          <span
            aria-hidden="true"
            className={`relative flex size-20 items-center justify-center rounded-full ring-[0.625rem] ${badge.kelas} ${badge.cincin}`}
          >
            <Icon name={badge.icon} size={34} />
          </span>
          <div className="relative flex flex-col gap-1">
            <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight lg:text-[2.25rem]">{TITLES[outcome]}</h1>
            <p className="text-base text-muted">Duel melawan {duel.opponent.nickname} selesai.</p>
          </div>

          <div className={`relative grid w-full gap-3 ${ubahRating ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="flex flex-col items-center gap-1 rounded-card-sm border-[1.5px] border-line bg-white p-4 lg:border-0 lg:bg-surface">
              <p className="text-[0.8125rem] font-semibold text-muted">Total poin</p>
              <p className="text-[2.125rem] leading-tight font-extrabold tabular-nums">
                <span className="sr-only">Kamu </span>
                <span className="text-violet">{mine}</span>
                <span aria-hidden="true" className="px-1 text-muted">:</span>
                <span className="sr-only">, lawan </span>
                <span className="text-orange-ink">{theirs}</span>
              </p>
            </div>
            {ubahRating && (
              <div className="flex flex-col items-center gap-1 rounded-card-sm bg-violet p-4 text-white">
                <p className="text-[0.8125rem] font-semibold text-white/85">Rating</p>
                <p className="text-[2.125rem] leading-tight font-extrabold tabular-nums">{formatDelta(result.ratingChange)}</p>
                <p className="text-xs font-semibold text-white/85">
                  {result.ratingBefore} <span aria-label="menjadi">&rarr;</span> {result.ratingAfter}
                </p>
              </div>
            )}
          </div>
          {!ubahRating && (
            <p className="relative text-[0.8125rem] font-medium text-muted">Latihan tidak mengubah rating.</p>
          )}

          {berikut && (
            <div className="relative flex w-full flex-col gap-2 text-left">
              <div className="flex justify-between text-[0.8125rem] font-medium text-muted">
                <span>Menuju {berikut.tier}</span>
                <span>{berikut.kurang} poin lagi</span>
              </div>
              <div
                role="progressbar"
                aria-label={`Kemajuan menuju ${berikut.tier}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(berikut.kemajuan * 100)}
                className="h-2 overflow-hidden rounded-full bg-line"
              >
                <div className="h-full rounded-full bg-violet" style={{ width: `${berikut.kemajuan * 100}%` }} />
              </div>
            </div>
          )}

          <div className="relative mt-2 hidden w-full flex-col gap-3 lg:flex">
            <Tombol href={duelAgainHref(duel)} label={MAIN_LAGI[duel.mode]} />
            {bisaLapor && <TautanLapor onClick={() => setLapor(true)} />}
          </div>
        </section>

        {/* Rincian per soal */}
        <section aria-labelledby="rincian-judul" className="flex flex-col rounded-card border-[1.5px] border-line bg-white p-5 lg:p-8 min-[1440px]:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pb-3">
            <h2 id="rincian-judul" className="text-lg font-extrabold lg:text-2xl">Rincian jawaban</h2>
            <p className="text-[0.8125rem] text-muted">
              {benar} dari {result.review.length} benar
            </p>
          </div>
          <table className="w-full">
            <thead className="sr-only lg:not-sr-only">
              <tr className="border-b border-line text-left text-xs font-bold tracking-wider text-muted uppercase">
                <th scope="col" className="w-20 py-3 font-bold">#</th>
                <th scope="col" className="py-3 font-bold">Hasil</th>
              </tr>
            </thead>
            <tbody>
              {result.review.map((r) => (
                <tr key={r.position} className="border-b border-line last:border-b-0">
                  <th scope="row" className="w-20 py-3.5 text-left text-[0.9375rem] font-bold text-muted lg:text-base">
                    <span className="lg:hidden">Soal </span>
                    {r.position + 1}
                  </th>
                  <td className="py-3.5 text-right lg:text-left">
                    <span
                      className={`inline-flex items-center gap-2 text-sm font-bold lg:text-base ${r.wasCorrect ? "text-success" : "text-danger"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-7 items-center justify-center rounded-full ${r.wasCorrect ? "bg-success-bg" : "bg-danger-bg"}`}
                      >
                        <Icon name={r.wasCorrect ? "centang" : "silang"} size={16} strokeWidth={2.5} />
                      </span>
                      {r.wasCorrect ? "Benar" : "Salah"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1 flex items-center justify-between border-t-2 border-ink pt-4">
            <span className="text-base font-bold">Total poin</span>
            <span className="text-2xl font-extrabold text-violet tabular-nums">{mine}</span>
          </div>
        </section>

        <div className="flex flex-col gap-3 lg:hidden">
          <Tombol href={duelAgainHref(duel)} label={MAIN_LAGI[duel.mode]} />
          {bisaLapor && <TautanLapor onClick={() => setLapor(true)} />}
        </div>
      </div>

      {lapor && <ReportSheet duelId={duel.duelId} lawan={duel.opponent.nickname} onClose={() => setLapor(false)} />}
    </MobileColumn>
  );
}

function Tombol({ href, label }: { href: string; label: string }) {
  return (
    <>
      <ButtonLink href={href}>{label}</ButtonLink>
      <ButtonLink href="/pembahasan" variant="sekunder">Lihat Pembahasan</ButtonLink>
      <ButtonLink href="/lobby" variant="tautan">Kembali ke Beranda</ButtonLink>
    </>
  );
}

function TautanLapor({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mt-2 inline-flex h-11 items-center justify-center gap-1.5 self-center rounded-xl px-3 text-sm font-bold text-danger underline underline-offset-4 hover:decoration-2"
    >
      <Icon name="bendera" size={16} />
      Laporkan lawan
    </button>
  );
}
