"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useDuel } from "@/lib/duel";
import { getSocket } from "@/lib/socket";
import { getSupabase } from "@/lib/supabase";
import { useNow, formatClock } from "@/lib/use-now";
import { MobileColumn, OptionButton } from "@/components/ui";
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

  preload("/figma/ikon-wifi-mati.svg", { as: "image" });

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
      <MobileColumn className="items-center justify-center gap-4">
        <p className="text-muted text-sm">Duel melawan</p>
        <p className="text-2xl font-bold">{duel.opponent.nickname}</p>
        <p className="text-[64px] font-black tabular-nums leading-none">{secsLeft}</p>
        <p className="text-muted text-sm">Bersiap...</p>
      </MobileColumn>
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
      <MobileColumn className="items-center justify-center" width="wide">
        <p role="status" className="text-muted">Memuat duel...</p>
      </MobileColumn>
    );
  }

  const q = duel.currentQuestion;
  const deadlineMs = new Date(q.deadlineAt).getTime();
  const remainingMs = Math.max(0, deadlineMs - now);
  const limitMs = q.timeLimitSec * 1000;

  return (
    <MobileColumn className="gap-4 px-4 pt-6 pb-4 md:px-6" width="wide">
      <h1 className="sr-only">Duel melawan {duel.opponent.nickname}</h1>

      <section aria-label="Skor" className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] text-muted">Kamu</span>
          <span className="text-[13px] text-muted">
            <span className="sr-only">Rating </span>{duel.opponent.rating}
          </span>
        </div>
        <p className="shrink-0 text-[32px] font-bold tabular-nums">
          <span className="sr-only">Poinmu </span>
          {duel.myTotalPoints}
          <span aria-hidden="true"> : </span>
          <span className="sr-only">, poin lawan </span>
          {duel.opponentTotalPoints}
        </p>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right">
          <span className="text-[13px] text-muted">Lawan</span>
          <span className="max-w-full truncate text-base font-bold">{duel.opponent.nickname}</span>
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-semibold">
          <span>Soal {q.position + 1} dari {q.totalQuestions}</span>
          <span className="tabular-nums">Sisa waktu {formatClock(Math.ceil(remainingMs / 1000))}</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-track" aria-hidden="true">
          <div
            className="h-full bg-ink transition-[width] duration-300 ease-linear"
            style={{ width: `${(remainingMs / limitMs) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex min-h-[120px] items-center justify-center rounded-2xl border-[1.5px] border-line bg-surface px-5 py-6">
        <h2 ref={headingRef} tabIndex={-1} className="w-full outline-none text-center text-2xl leading-8 font-bold">
          <MathText text={q.body} />
        </h2>
      </div>

      {q.type === "mcq" && q.options ? (
        <div role="group" aria-label="Pilihan jawaban" className="flex flex-col gap-3">
          {q.options.map((option, i) => (
            <OptionButton
              key={`${q.position}-${option.id}`}
              letter={LETTERS[i]}
              text={option.text}
              selected={duel.myAnswer === option.id}
              locked={duel.myAnswer !== null}
              onClick={() => handleAnswer(option.id)}
            />
          ))}
        </div>
      ) : (
        <form onSubmit={handleNumericSubmit} className="flex gap-2">
          <input
            name="answer"
            type="text"
            inputMode="numeric"
            disabled={duel.myAnswer !== null}
            placeholder="Jawaban..."
            className="h-13 flex-1 rounded-xl border-[1.5px] border-ink bg-white px-4 text-base focus-visible:outline-offset-2 disabled:border-line disabled:bg-surface disabled:text-muted"
          />
          <button
            type="submit"
            disabled={duel.myAnswer !== null}
            className="h-13 rounded-xl bg-ink px-5 text-base font-bold text-white disabled:bg-line disabled:text-muted"
          >
            Kirim
          </button>
        </form>
      )}

      <div role="status" className="min-h-9">
        {duel.opponentAnswered && (
          <p className="inline-flex rounded-full bg-surface px-4 py-2 text-sm font-semibold">
            Lawan sudah menjawab
          </p>
        )}
      </div>
    </MobileColumn>
  );
}
