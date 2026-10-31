"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { useRouter } from "next/navigation";
import { getDuelStatus, type DuelStatus } from "@/lib/api";
import { questionMs, useDuel } from "@/lib/duel";
import { formatClock, useNow } from "@/lib/use-now";
import { MobileColumn, OptionButton } from "@/components/ui";
import { TerputusView } from "../terputus/terputus-view";

const LETTERS = ["A", "B", "C", "D"];
/** Jeda singkat setelah kedua pemain menjawab, sebelum soal berikutnya. */
const NEXT_DELAY_MS = 800;

export default function DuelScreen() {
  const router = useRouter();
  const { duel, actions } = useDuel();
  const now = useNow();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [stillOffline, setStillOffline] = useState(false);
  const [status, setStatus] = useState<DuelStatus | null>(null);

  // Ikon layar terputus dimuat lebih dulu supaya tetap tampil saat offline.
  preload("/figma/ikon-wifi-mati.svg", { as: "image" });

  const playing = duel?.status === "playing";
  const paused = duel?.pausedAt != null;
  const index = duel?.index ?? 0;
  const startedAt = duel?.questionStartedAt ?? 0;
  const duelId = duel?.duelId;
  // Waktu per soal tergantung jenjang duel (SD 30 dtk, SMP 25, SMA 20).
  const limitMs = questionMs(duel?.jenjang ?? "SMA");

  // Tidak ada duel aktif: arahkan ke tempat yang sesuai.
  useEffect(() => {
    if (duel === undefined) return;
    if (duel === null) router.replace("/lobby");
    else if (duel.status === "finished") router.replace("/hasil");
  }, [duel, router]);

  // Koneksi putus: jeda duel. Layar terputus dirender di tempat (pindah rute
  // butuh jaringan), URL-nya saja yang diganti ke /terputus.
  useEffect(() => {
    if (!playing) return;
    const goOffline = () => {
      actions.pause();
      window.history.replaceState(null, "", "/terputus");
    };
    if (!navigator.onLine) goOffline();
    window.addEventListener("offline", goOffline);
    return () => window.removeEventListener("offline", goOffline);
  }, [playing, actions]);

  // Pindahkan fokus ke soal baru supaya pembaca layar ikut membacakannya.
  useEffect(() => {
    if (playing && !paused) headingRef.current?.focus();
  }, [playing, paused, index]);

  // Status soal (lawan sudah menjawab, skor) dari API, diperbarui berkala
  // sampai lawan menjawab.
  useEffect(() => {
    if (!playing || paused || !duelId) return;
    let active = true;
    const poll = () => {
      getDuelStatus(duelId, index, Math.max(0, Date.now() - startedAt))
        .then((s) => {
          if (!active) return;
          setStatus(s);
          if (s.opponentAnswered) clearInterval(id);
        })
        .catch((e: unknown) => console.error("Gagal memuat status duel:", e));
    };
    const id = setInterval(poll, 250);
    poll();
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [playing, paused, duelId, index, startedAt]);

  const ready = playing && now > 0;
  const elapsed = ready ? Math.max(0, (duel.pausedAt ?? now) - startedAt) : 0;
  const remainingMs = Math.max(0, limitMs - elapsed);
  const myChoice = ready ? duel.myAnswers[index] : null;
  const opponentAnswered = ready && status?.questionIndex === index && status.opponentAnswered;
  const bothAnswered = myChoice !== null && opponentAnswered;

  // Waktu habis atau semua sudah menjawab: lanjut ke soal berikutnya.
  useEffect(() => {
    if (!playing || paused) return;
    const left = Math.max(0, limitMs - (Date.now() - startedAt));
    const wait = bothAnswered ? Math.min(NEXT_DELAY_MS, left) : left;
    const id = setTimeout(() => actions.advance(index), wait);
    return () => clearTimeout(id);
  }, [playing, paused, index, startedAt, bothAnswered, actions, limitMs]);

  if (playing && paused) {
    return (
      <TerputusView
        stillOffline={stillOffline}
        onRetry={() => {
          if (!navigator.onLine) return setStillOffline(true);
          setStillOffline(false);
          actions.resume();
          window.history.replaceState(null, "", "/duel");
        }}
        onLeave={() => {
          actions.reset();
          router.replace("/lobby");
        }}
      />
    );
  }

  if (!ready) {
    return (
      <MobileColumn className="items-center justify-center" width="wide">
        <p role="status" className="text-muted">
          Memuat duel...
        </p>
      </MobileColumn>
    );
  }

  const question = duel.questions[index];
  const total = duel.questions.length;

  return (
    <MobileColumn className="gap-4 px-4 pt-6 pb-4 md:px-6" width="wide">
      <h1 className="sr-only">Duel melawan {duel.opponent.name}</h1>

      {/* Skor (node 2:95) */}
      <section aria-label="Skor" className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] text-muted">Kamu</span>
          <span className="truncate text-base font-bold">{duel.me.name}</span>
          <span className="truncate text-[13px] text-muted">
            <span className="sr-only">Sekolah </span>
            {duel.me.sekolah}
          </span>
          <span className="text-[13px] text-muted">
            <span className="sr-only">Rating </span>
            {duel.me.rating}
          </span>
        </div>
        <p className="shrink-0 text-[32px] font-bold tabular-nums">
          <span className="sr-only">Skor kamu </span>
          {status?.myScore ?? 0}
          <span aria-hidden="true"> : </span>
          <span className="sr-only">, skor lawan </span>
          {status?.opponentScore ?? 0}
        </p>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right">
          <span className="text-[13px] text-muted">Lawan</span>
          <span className="max-w-full truncate text-base font-bold">{duel.opponent.name}</span>
          <span className="max-w-full truncate text-[13px] text-muted">
            <span className="sr-only">Sekolah </span>
            {duel.opponent.sekolah}
          </span>
          <span className="text-[13px] text-muted">
            <span className="sr-only">Rating </span>
            {duel.opponent.rating}
          </span>
        </div>
      </section>

      {/* Waktu (node 2:105) */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-semibold">
          <span>
            Soal {index + 1} dari {total}
          </span>
          <span className="tabular-nums">Sisa waktu {formatClock(Math.ceil(remainingMs / 1000))}</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-track" aria-hidden="true">
          <div
            className="h-full bg-ink transition-[width] duration-300 ease-linear"
            style={{ width: `${(remainingMs / limitMs) * 100}%` }}
          />
        </div>
      </div>

      {/* Soal (node 2:111) */}
      <div className="flex min-h-[120px] items-center justify-center rounded-2xl border-[1.5px] border-line bg-surface px-5 py-6">
        <h2 ref={headingRef} tabIndex={-1} className="w-full outline-none text-center text-2xl leading-8 font-bold">
          {question.text}
        </h2>
      </div>

      {/* Pilihan jawaban (node 2:113) */}
      <div role="group" aria-label="Pilihan jawaban" className="flex flex-col gap-3">
        {question.options.map((option, i) => (
          <OptionButton
            key={`${question.id}-${i}`}
            letter={LETTERS[i]}
            text={option}
            selected={myChoice === i}
            locked={myChoice !== null}
            onClick={() => actions.answer(i)}
          />
        ))}
      </div>

      {/* Status lawan (node 2:130) */}
      <div role="status" className="min-h-9">
        {opponentAnswered && (
          <p className="inline-flex rounded-full bg-surface px-4 py-2 text-sm font-semibold">Lawan sudah menjawab</p>
        )}
      </div>
    </MobileColumn>
  );
}
