"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDuel } from "@/lib/duel";
import { getSocket } from "@/lib/socket";
import { getSupabase } from "@/lib/supabase";
import { useNow, formatClock } from "@/lib/use-now";
import { displayName, readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/api";
import { tierDariRating, tingkatDariWaktu } from "@/lib/ui-config";
import type { ActiveQuestion, DuelState } from "@/lib/duel";
import {
  Avatar,
  Chip,
  Icon,
  MobileColumn,
  OptionButton,
  SchoolName,
  TingkatChip,
  inputClass,
} from "@/components/ui";
import { TINGKAT_BG } from "@/components/ui/TingkatChip";
import { MathText } from "@/components/MathText";
import { TerputusView } from "../terputus/terputus-view";

const LETTERS = ["A", "B", "C", "D"];

export default function DuelScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duelIdParam = searchParams.get("id");
  const { duel, actions } = useDuel();
  const now = useNow();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [stillOffline, setStillOffline] = useState(false);
  const [paused, setPaused] = useState(false);
  const user = useCurrentUser();
  const namaSaya = user ? displayName(user) : "Kamu";
  const profilSaya = user ? readProfilSekolah(user) : null;
  /** Rating sendiri untuk kartu VS (getProfile yang sama dengan Beranda). */
  const [ratingSaya, setRatingSaya] = useState<number | null>(null);
  const sedangHitungMundur = duel?.status === "countdown" && user !== null;
  useEffect(() => {
    if (!sedangHitungMundur) return;
    let active = true;
    getProfile()
      .then((p) => {
        if (active) setRatingSaya(p.rating);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [sedangHitungMundur]);

  useEffect(() => {
    if (duel === undefined) return;
    if (duel === null) router.replace("/lobby");
    else if (duel.status === "finished") router.replace("/hasil");
  }, [duel, router]);

  useEffect(() => {
    if (!duelIdParam && duel?.status !== "playing" && duel?.status !== "countdown") return;

    let active = true;

    async function attachSocket() {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (!token || !active) return;

      const socket = getSocket(token);

      socket.on("match:found", (payload) => {
        if (!active) return;
        actions.setMatchFound(payload.duelId, "room", payload.isBot, payload.opponent);
      });

      socket.on("duel:start", (payload) => {
        if (!active) return;
        actions.setCountdown(payload.startsAt);
      });

      socket.on("duel:question", (payload) => {
        if (!active) return;
        actions.setQuestion(payload);
      });

      socket.on("duel:question_result", (payload) => {
        if (!active) return;
        actions.setQuestionResult(payload);
      });

      socket.on("duel:opponent_answered", () => {
        if (!active) return;
        actions.setOpponentAnswered();
      });

      socket.on("duel:end", (payload) => {
        if (!active) return;
        actions.setFinished(payload);
        router.replace("/hasil");
      });

      if (duelIdParam) {
        socket.emit("duel:rejoin", { duelId: duelIdParam });
      }
    }

    attachSocket();

    return () => {
      active = false;
      getSupabase().auth.getSession().then(({ data }) => {
        if (data.session?.access_token) {
          const socket = getSocket(data.session.access_token);
          socket.off("match:found");
          socket.off("duel:start");
          socket.off("duel:question");
          socket.off("duel:question_result");
          socket.off("duel:opponent_answered");
          socket.off("duel:end");
        }
      });
    };
  }, [duelIdParam, duel?.status, actions, router]);

  useEffect(() => {
    if (duel?.status === "playing" && !paused) headingRef.current?.focus();
  }, [duel?.status, paused, duel?.currentQuestion?.position]);

  useEffect(() => {
    if (duel?.status !== "playing") return;
    const goOffline = () => {
      setPaused(true);
      window.history.replaceState(null, "", "/terputus");
    };
    if (!navigator.onLine) goOffline();
    window.addEventListener("offline", goOffline);
    return () => window.removeEventListener("offline", goOffline);
  }, [duel?.status]);

  // Pintasan keyboard: A-D atau 1-4 memilih opsi (memanggil handleAnswer yang sama).
  const handleAnswerRef = useRef<(id: string) => void>(() => {});
  const opsiSekarang = duel?.status === "playing" && duel.currentQuestion?.type === "mcq" ? duel.currentQuestion.options : null;
  useEffect(() => {
    if (!opsiSekarang || paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      const i = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);
      if (i < 0 || i >= opsiSekarang.length) return;
      e.preventDefault();
      handleAnswerRef.current(opsiSekarang[i].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opsiSekarang, paused]);

  async function handleAnswer(optionId: string) {
    if (!duel || duel.myAnswer !== null || !duel.currentQuestion) return;
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    actions.setMyAnswer(optionId);
    const socket = getSocket(token);
    socket.emit("duel:answer", {
      duelId: duel.duelId,
      position: duel.currentQuestion.position,
      answer: optionId,
    });
  }

  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  });

  async function handleNumericSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = (form.elements.namedItem("answer") as HTMLInputElement).value.trim();
    if (!input || !duel || duel.myAnswer !== null || !duel.currentQuestion) return;

    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    actions.setMyAnswer(input);
    const socket = getSocket(token);
    socket.emit("duel:answer", {
      duelId: duel.duelId,
      position: duel.currentQuestion.position,
      answer: input,
    });
  }

  if (duel?.status === "countdown" && duel.startsAt) {
    const msLeft = Math.max(0, new Date(duel.startsAt).getTime() - (now ?? 0));
    const secsLeft = Math.ceil(msLeft / 1000);
    return (
      <LawanDitemukan
        mode={duel.mode}
        namaSaya={namaSaya}
        sekolahSaya={profilSaya?.sekolah ?? null}
        ratingSaya={ratingSaya}
        lawan={duel.opponent}
        aturan={duel.currentQuestion}
        detik={secsLeft}
      />
    );
  }

  if (paused) {
    return (
      <TerputusView
        stillOffline={stillOffline}
        onRetry={() => {
          if (!navigator.onLine) return setStillOffline(true);
          setStillOffline(false);
          setPaused(false);
          window.history.replaceState(null, "", `/duel?id=${duel?.duelId}`);
        }}
        onLeave={() => {
          actions.reset();
          router.replace("/lobby");
        }}
      />
    );
  }

  if (!duel || duel.status !== "playing" || !duel.currentQuestion || !now) {
    return (
      <MobileColumn brandBar className="items-center justify-center" width="wide" bareDesktop>
        <p role="status" className="text-muted">Memuat duel...</p>
      </MobileColumn>
    );
  }

  const q = duel.currentQuestion;
  const deadlineMs = new Date(q.deadlineAt).getTime();
  const remainingMs = Math.max(0, deadlineMs - now);
  const limitMs = q.timeLimitSec * 1000;
  const sisa = limitMs > 0 ? remainingMs / limitMs : 0;
  const hampirHabis = sisa <= 0.25;
  const waktuHabis = remainingMs === 0 && duel.myAnswer === null;
  const tingkat = tingkatDariWaktu(q.timeLimitSec);
  const terkunci = duel.myAnswer !== null;

  return (
    <MobileColumn brandBar width="wide" bareDesktop className="gap-4 px-4 pt-5 pb-6 sm:px-6 lg:gap-5 lg:px-0 lg:pt-2">
      <h1 className="sr-only">Duel melawan {duel.opponent.nickname}</h1>

      {/* Skor */}
      <section aria-label="Skor" className="flex items-center gap-2 lg:items-stretch lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:rounded-card-sm lg:border-2 lg:border-violet lg:bg-violet-50 lg:p-5">
          <Avatar name={namaSaya} size={44} className="hidden min-[400px]:flex lg:size-14" />
          <span className="flex min-w-0 flex-col">
            <span className="text-[0.6875rem] font-extrabold tracking-wider text-violet">KAMU</span>
            <span className="truncate text-base font-extrabold lg:text-xl">{namaSaya}</span>
            {profilSaya && <SchoolName name={profilSaya.sekolah} className="hidden text-xs text-muted sm:flex" />}
          </span>
        </div>
        <p className="flex shrink-0 flex-col items-center justify-center leading-none">
          <span className="text-[2.5rem] font-extrabold tabular-nums lg:text-[4rem]">
            <span className="sr-only">Poinmu </span>
            <span className="text-violet">{duel.myTotalPoints}</span>
            <span aria-hidden="true" className="px-1 text-muted">:</span>
            <span className="sr-only">, poin lawan </span>
            <span className="text-orange-ink">{duel.opponentTotalPoints}</span>
          </span>
          <span aria-hidden="true" className="text-xs font-semibold text-muted">poin</span>
        </p>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5 text-right lg:rounded-card-sm lg:border-2 lg:border-orange lg:bg-orange-50 lg:p-5">
          <span className="flex min-w-0 flex-col items-end">
            <span className="text-[0.6875rem] font-extrabold tracking-wider text-orange-ink">LAWAN</span>
            <span className="max-w-full truncate text-base font-extrabold lg:text-xl">{duel.opponent.nickname}</span>
            <span className="text-xs text-muted">
              <span className="sr-only">Rating </span>
              {duel.opponent.rating}
            </span>
          </span>
          <Avatar name={duel.opponent.nickname} tone="orange" size={44} className="hidden min-[400px]:flex lg:size-14" />
        </div>
      </section>

      {/* Langkah per soal */}
      <ol aria-label={`Soal ${q.position + 1} dari ${q.totalQuestions}`} className="flex gap-1.5">
        {Array.from({ length: q.totalQuestions }, (_, i) => (
          <li
            key={i}
            aria-hidden="true"
            className={`h-1.5 flex-1 rounded-full ${
              i < q.position ? "bg-violet" : i === q.position ? TINGKAT_BG[tingkat] : "bg-line"
            }`}
          />
        ))}
      </ol>

      {/* Tingkat dan waktu */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TingkatChip timeLimitSec={q.timeLimitSec} />
          <span className="text-sm font-semibold text-muted">
            Soal {q.position + 1} dari {q.totalQuestions}
          </span>
          <span
            className={`ml-auto text-base font-extrabold tabular-nums lg:text-xl ${hampirHabis ? "text-orange-ink" : "text-violet"}`}
          >
            <span className="hidden sm:inline">Sisa waktu </span>
            <span className="sr-only sm:hidden">Sisa waktu </span>
            {formatClock(Math.ceil(remainingMs / 1000))}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ease-linear ${hampirHabis ? "bg-orange" : "bg-violet"}`}
            style={{ width: `${sisa * 100}%` }}
          />
        </div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <Icon name="perisai" size={14} />
          Waktu dihitung oleh server · {q.timeLimitSec} detik
        </p>
      </div>

      {/* Soal */}
      <div className="relative flex min-h-[9.375rem] items-center justify-center overflow-hidden rounded-card bg-violet-50 px-6 py-8 lg:min-h-[12.5rem] lg:border-[1.5px] lg:border-line lg:bg-white">
        <span aria-hidden="true" className="capsule absolute -top-3 -right-6 h-8 w-28 bg-violet-100" />
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="relative w-full text-center text-[1.375rem] leading-snug font-extrabold outline-none sm:text-2xl lg:text-[2rem]"
        >
          <MathText text={q.body} />
        </h2>
      </div>

      {q.type === "mcq" && q.options ? (
        <div role="group" aria-label="Pilihan jawaban" className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
          {q.options.map((option, i) => (
            <OptionButton
              key={`${q.position}-${option.id}`}
              letter={LETTERS[i]}
              text={option.text}
              selected={duel.myAnswer === option.id}
              locked={terkunci}
              hint={`tombol ${i + 1}`}
              aria-keyshortcuts={`${LETTERS[i]} ${i + 1}`}
              onClick={() => handleAnswer(option.id)}
            />
          ))}
        </div>
      ) : (
        <form onSubmit={handleNumericSubmit} className="flex gap-2">
          <label htmlFor="jawaban" className="sr-only">
            Jawaban
          </label>
          <input
            id="jawaban"
            name="answer"
            type="text"
            inputMode="numeric"
            disabled={duel.myAnswer !== null}
            placeholder="Jawaban..."
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            disabled={duel.myAnswer !== null}
            className="h-[3.25rem] rounded-input bg-violet px-6 text-base font-bold text-white hover:bg-violet-hover disabled:bg-line disabled:text-muted"
          >
            Kirim
          </button>
        </form>
      )}

      <div role="status" className="flex min-h-9 flex-wrap gap-2">
        {terkunci && (
          <Chip tone="violet" size="lg">
            <Icon name="gembok" size={16} />
            Jawaban terkunci · menunggu lawan
          </Chip>
        )}
        {waktuHabis && (
          <Chip tone="bahaya" size="lg">
            Waktu habis
          </Chip>
        )}
        {duel.opponentAnswered && (
          <Chip tone="orange" size="lg">
            <span aria-hidden="true" className="size-2 rounded-full bg-orange" />
            Lawan sudah menjawab
          </Chip>
        )}
      </div>
    </MobileColumn>
  );
}

const MODE_LABEL = { ranked: "Ranked", bot: "Latihan", room: "Room" } as const;
const MODE_SUB = {
  ranked: "Rating kalian berdekatan.",
  bot: "Bot siap. Latihan tidak mengubah rating.",
  room: "Temanmu sudah masuk. Room tidak mengubah rating.",
} as const;

type LawanDitemukanProps = {
  mode: DuelState["mode"];
  namaSaya: string;
  sekolahSaya: string | null;
  ratingSaya: number | null;
  lawan: DuelState["opponent"];
  /** Soal aktif kalau sudah ada; dipakai untuk kartu aturan (angka dari server saja). */
  aturan: ActiveQuestion | null;
  detik: number;
};

/** Layar hitung mundur: kartu VS, peringatan, aturan (bila datanya ada), "Mulai dalam N detik". */
function LawanDitemukan({ mode, namaSaya, sekolahSaya, ratingSaya, lawan, aturan, detik }: LawanDitemukanProps) {
  return (
    <MobileColumn
      brandBar
      width="wide"
      bareDesktop
      className="relative gap-6 overflow-hidden px-5 pt-10 pb-6 sm:px-8 lg:gap-8 lg:overflow-visible lg:px-0 lg:pt-4"
    >
      <span aria-hidden="true" className="capsule absolute bottom-40 -left-10 h-10 w-40 bg-violet-50 lg:hidden" />
      <span aria-hidden="true" className="capsule absolute bottom-24 -right-10 h-10 w-36 bg-orange-50 lg:hidden" />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <Chip tone="violetPenuh" size="lg">
          <Icon name={mode === "bot" ? "bot" : mode === "room" ? "room" : "petir"} size={16} />
          {MODE_LABEL[mode]}
        </Chip>
        <h1 className="text-[1.875rem] leading-tight font-extrabold tracking-tight lg:text-5xl">Lawan ditemukan</h1>
        <p className="text-[0.9375rem] text-muted lg:text-lg">{MODE_SUB[mode]}</p>
      </div>

      <div className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2.5 lg:gap-6">
        <KartuPemain sisi="kamu" nama={namaSaya} sekolah={sekolahSaya} rating={ratingSaya} />
        <span aria-hidden="true" className="self-center text-base font-extrabold text-muted lg:text-2xl">
          VS
        </span>
        <KartuPemain sisi="lawan" nama={lawan.nickname} sekolah={null} rating={lawan.rating} />
      </div>

      {aturan && (
        <section aria-labelledby="aturan-judul" className="relative flex flex-col gap-3 rounded-card-sm border-[1.5px] border-line bg-white p-5 lg:p-7">
          <h2 id="aturan-judul" className="text-base font-extrabold lg:text-xl">
            Aturan {MODE_LABEL[mode].toLowerCase()} · {aturan.totalQuestions} soal
          </h2>
          <p className="text-sm text-muted">
            Soal ini {aturan.timeLimitSec} detik. Waktu tiap soal bisa berbeda.
          </p>
        </section>
      )}

      <div className="relative mt-auto flex flex-col gap-4 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-stretch lg:gap-6">
        <p className="flex items-start gap-2.5 rounded-button bg-violet-50 p-4 text-[0.8125rem] leading-5 text-violet-ink lg:p-5 lg:text-[0.9375rem] lg:leading-6">
          <Icon name="perisai" size={18} className="mt-px shrink-0" />
          {mode === "ranked" ? (
            <span>
              <strong className="font-extrabold">Ranked dimainkan tanpa bantuan AI.</strong> Akun yang terdeteksi curang
              akan direset. Waktu dihitung oleh server dan berpindah tab akan dicatat.
            </span>
          ) : (
            <span className="font-semibold">Waktu dihitung oleh server dan berpindah tab akan dicatat.</span>
          )}
        </p>
        <p
          role="timer"
          aria-live="polite"
          className="flex h-14 items-center justify-center rounded-button bg-ink text-base font-bold text-white lg:h-auto lg:min-h-16 lg:text-lg"
        >
          Mulai dalam {detik} detik
        </p>
      </div>
    </MobileColumn>
  );
}

function KartuPemain({
  sisi,
  nama,
  sekolah,
  rating,
}: {
  sisi: "kamu" | "lawan";
  nama: string;
  sekolah: string | null;
  rating: number | null;
}) {
  const kamu = sisi === "kamu";
  return (
    <div
      className={`flex min-w-0 flex-col items-center gap-2 rounded-card-sm border-2 p-4 text-center lg:flex-row lg:gap-4 lg:p-6 ${
        kamu ? "border-violet bg-violet-50 lg:text-left" : "border-orange bg-orange-50 lg:flex-row-reverse lg:text-right"
      }`}
    >
      <Avatar name={nama} tone={kamu ? "violet" : "orange"} size={60} className="lg:size-20 lg:text-[2rem]" />
      <div className={`flex w-full min-w-0 flex-col items-center gap-0.5 ${kamu ? "lg:items-start" : "lg:items-end"}`}>
        <span className={`text-[0.6875rem] font-extrabold tracking-wider ${kamu ? "text-violet-ink" : "text-orange-ink"}`}>
          {kamu ? "KAMU" : "LAWAN"}
        </span>
        <span className="w-full truncate text-base font-extrabold lg:text-2xl">{nama}</span>
        {sekolah && <SchoolName name={sekolah} className="max-w-full text-xs text-muted lg:text-sm" />}
        <span className={`text-sm font-extrabold lg:text-base ${kamu ? "text-violet" : "text-orange-ink"}`}>
          {rating !== null ? (
            <>
              {tierDariRating(rating)} · <span className="sr-only">rating </span>
              {rating}
            </>
          ) : (
            <span className="text-muted">Memuat...</span>
          )}
        </span>
      </div>
    </div>
  );
}
