'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { useDuelStore } from '../../../store/duelStore';
import { getSocket } from '../../../lib/socket';
import { MathText } from '../../../components/MathText';
import { Timer } from '../../../components/Timer';
import type { McqOption, DuelEndPayload } from '../../../shared/events';

export default function DuelPage() {
  const params = useParams();
  const duelId = params?.id as string;
  const router = useRouter();

  const profile = useAuthStore((s) => s.profile);
  const accessToken = useAuthStore((s) => s.accessToken);

  const phase = useDuelStore((s) => s.phase);
  const opponent = useDuelStore((s) => s.opponent);
  const startsAt = useDuelStore((s) => s.startsAt);
  const currentQuestion = useDuelStore((s) => s.currentQuestion);
  const opponentAnswered = useDuelStore((s) => s.opponentAnswered);
  const myTotalPoints = useDuelStore((s) => s.myTotalPoints);
  const lastResult = useDuelStore((s) => s.lastResult);
  const endPayload = useDuelStore((s) => s.endPayload);

  const [answered, setAnswered] = React.useState(false);
  const [numericAnswer, setNumericAnswer] = React.useState('');
  const [countdownSec, setCountdownSec] = React.useState(3);

  React.useEffect(() => {
    if (!profile || !accessToken) {
      router.replace('/');
      return;
    }

    const socket = getSocket(accessToken);
    socket.emit('duel:rejoin', { duelId });

    socket.on('duel:start', ({ startsAt }) => {
      useDuelStore.getState().setCountdown(startsAt);
    });

    socket.on('duel:question', (q) => {
      useDuelStore.getState().setQuestion(q);
      setAnswered(false);
      setNumericAnswer('');
    });

    socket.on('duel:opponent_answered', ({ position }) => {
      const activeQ = useDuelStore.getState().currentQuestion;
      if (activeQ?.position === position) {
        useDuelStore.getState().setOpponentAnswered();
      }
    });

    socket.on('duel:question_result', ({ correct, points, myTotalPoints }) => {
      useDuelStore.getState().setQuestionResult(correct, points, myTotalPoints);
    });

    socket.on('duel:end', (payload) => {
      useDuelStore.getState().setDuelEnd(payload);
    });

    return () => {
      socket.off('duel:start');
      socket.off('duel:question');
      socket.off('duel:opponent_answered');
      socket.off('duel:question_result');
      socket.off('duel:end');
    };
  }, [duelId, profile, accessToken, router]);

  {/** Hitung mundur sebelum duel dimulai */}
  React.useEffect(() => {
    if (phase !== 'countdown' || !startsAt) return;

    const tick = () => {
      const diff = Math.max(0, Math.ceil((new Date(startsAt).getTime() - Date.now()) / 1000));
      setCountdownSec(diff);
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [phase, startsAt]);

  const handleSendAnswer = (answer: string) => {
    if (answered || !currentQuestion || !accessToken) return;
    setAnswered(true);

    const socket = getSocket(accessToken);
    socket.emit('duel:answer', {
      duelId,
      position: currentQuestion.position,
      answer,
    });
  };

  const handleNumericSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAnswer.trim()) {
      handleSendAnswer(numericAnswer.trim());
    }
  };

  {/** Tampilan duel selesai dan review soal */}
  if (phase === 'finished' && endPayload) {
    return (
      <DuelResultView
        payload={endPayload}
        onBackHome={() => {
          useDuelStore.getState().reset();
          router.replace('/home');
        }}
      />
    );
  }

  {/** Tampilan hitung mundur persiapan duel */}
  if (phase === 'countdown' || phase === 'idle') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="card w-full mb-8 py-5 border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Lawan Duel</p>
          <h2 className="text-2xl font-black text-white">{opponent?.nickname || 'Bot'}</h2>
          <p className="text-xs text-primary-400 mt-1 font-mono">Rating: {opponent?.rating || 1000}</p>
        </div>

        {countdownSec > 0 ? (
          <div>
            <div className="text-8xl font-black text-primary-400 animate-pulse my-4 tabular-nums">
              {countdownSec}
            </div>
            <p className="text-gray-400 text-sm">Bersiaplah, duel segera dimulai!</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Memuat soal...</p>
          </div>
        )}
      </main>
    );
  }

  {/** Tampilan arena duel saat menjawab soal */}
  if ((phase === 'question' || phase === 'question_result') && currentQuestion) {
    return (
      <main className="min-h-screen flex flex-col p-4 max-w-sm mx-auto justify-between">
        <div>
          {/** Status bar: nomor soal, lawan menjawab, poin */}
          <div className="flex items-center justify-between mt-2 mb-4">
            <span className="text-xs font-mono font-bold text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
              Soal {currentQuestion.position + 1} / {currentQuestion.totalQuestions}
            </span>

            <div className="flex items-center gap-2">
              {opponentAnswered && (
                <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-1 rounded-full font-bold">
                  Lawan sudah menjawab
                </span>
              )}
              <span className="text-xs font-mono font-bold text-primary-400 bg-primary-950/60 border border-primary-800 px-3 py-1 rounded-full">
                {myTotalPoints} Poin
              </span>
            </div>
          </div>

          {/** Timer server-authoritative */}
          <div className="mb-4">
            <Timer
              deadlineAt={currentQuestion.deadlineAt}
              onExpire={() => {
                if (!answered) handleSendAnswer('');
              }}
            />
          </div>

          {/** Konten soal dengan KaTeX */}
          <div className="card mb-4 min-h-[120px] flex items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-gray-900/60">
            <div className="text-lg font-medium leading-relaxed">
              <MathText text={currentQuestion.body} />
            </div>
          </div>

          {/** Form pilihan jawaban atau umpan balik hasil */}
          {phase === 'question_result' && lastResult ? (
            <div
              className={`card text-center p-6 ${
                lastResult.correct
                  ? 'border-green-500 bg-green-950/20'
                  : 'border-red-500 bg-red-950/20'
              }`}
            >
              <h3 className="text-2xl font-black tracking-wider">
                {lastResult.correct ? 'BENAR' : 'KURANG TEPAT'}
              </h3>
              <p className="text-sm font-mono text-gray-400 mt-1">
                {lastResult.correct ? `+${lastResult.points} Poin` : '+0 Poin'}
              </p>
              <p className="text-xs text-gray-500 mt-3 animate-pulse">Menunggu soal berikutnya...</p>
            </div>
          ) : currentQuestion.type === 'mcq' ? (
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options?.map((opt: McqOption) => (
                <button
                  key={opt.id}
                  onClick={() => handleSendAnswer(opt.id)}
                  disabled={answered}
                  className={`card p-4 text-center font-bold text-base transition-all active:scale-95 ${
                    answered
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:border-primary-500 hover:bg-gray-800 cursor-pointer active:bg-primary-950'
                  }`}
                >
                  <MathText text={opt.text} />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleNumericSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={numericAnswer}
                onChange={(e) => setNumericAnswer(e.target.value)}
                placeholder="Ketik jawaban angka..."
                disabled={answered}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white text-2xl text-center font-black tracking-widest focus:outline-none focus:border-primary-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={answered || !numericAnswer.trim()}
                className="btn-primary py-4"
              >
                Kirim Jawaban
              </button>
            </form>
          )}
        </div>

        {/** Info lawan */}
        <div className="text-center text-xs text-gray-600 py-2">
          Lawan: {opponent?.nickname || 'Bot'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center text-gray-400">
      Memuat duel...
    </main>
  );
}

{/** Tampilan hasil akhir duel dan pembahasan soal yang salah */}
function DuelResultView({
  payload,
  onBackHome,
}: {
  payload: DuelEndPayload;
  onBackHome: () => void;
}) {
  const { winner, scores, ratingChange, ratingBefore, ratingAfter, review } = payload;

  const isWin = winner === 'me';
  const isDraw = winner === 'draw';
  const wrongReviews = review.filter((r) => !r.wasCorrect);

  return (
    <main className="min-h-screen flex flex-col p-5 max-w-sm mx-auto justify-between">
      <div>
        {/** Banner status pemenang */}
        <div className="text-center my-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-1">
            Hasil Pertandingan
          </div>
          <h1 className="text-3xl font-black">
            {isWin ? 'Kamu Menang!' : isDraw ? 'Hasil Seri!' : 'Kamu Kalah'}
          </h1>
          <p className="text-gray-400 text-xs mt-1">Pertandingan selesai</p>
        </div>

        {/** Perbandingan skor akhir */}
        <div className="card mb-4 p-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Skor Akhir</p>
          <div className="flex flex-col gap-2">
            {scores.map((s) => (
              <div
                key={s.userId}
                className="flex items-center justify-between border-b border-gray-800/60 pb-2 last:border-none last:pb-0"
              >
                <span className="font-bold text-sm text-gray-200">{s.nickname}</span>
                <span className="font-mono font-black text-lg text-primary-400">{s.totalPoints}</span>
              </div>
            ))}
          </div>
        </div>

        {/** Perubahan rating Elo */}
        <div className="card text-center mb-5 p-4 bg-gray-900 border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Perubahan Rating</p>
          <div className="text-2xl font-black my-1">
            <span className="text-gray-400">{ratingBefore}</span>
            <span className="mx-2 text-gray-600">→</span>
            <span className={ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}>
              {ratingAfter}
            </span>
          </div>
          <p
            className={`text-xs font-bold font-mono ${
              ratingChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {ratingChange >= 0 ? `+${ratingChange}` : ratingChange} poin
          </p>
        </div>

        {/** Pembahasan langkah penyelesaian untuk soal yang salah */}
        {wrongReviews.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-black text-gray-300 mb-3">
              Pembahasan Soal yang Salah ({wrongReviews.length})
            </h2>

            <div className="flex flex-col gap-3">
              {wrongReviews.map((item) => (
                <div key={item.position} className="card p-4 border-red-900/40 bg-gray-900/90 text-left">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="font-bold">Soal #{item.position + 1}</span>
                    <span className="text-red-400 font-bold">Jawabanmu: {item.yourAnswer || 'Kosong'}</span>
                  </div>

                  <div className="text-sm mb-2 text-gray-200">
                    <MathText text={item.questionBody} />
                  </div>

                  <div className="text-xs text-green-400 font-bold mb-2">
                    Kunci Benar: {item.correctAnswer}
                  </div>

                  <div className="border-t border-gray-800 pt-2 text-xs text-gray-300 bg-gray-950/40 p-2.5 rounded-lg">
                    <span className="font-bold text-gray-400 block mb-1">Langkah Penyelesaian:</span>
                    <MathText text={item.explanation} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={onBackHome} className="btn-primary py-4 mb-4">
        Kembali ke Beranda
      </button>
    </main>
  );
}
