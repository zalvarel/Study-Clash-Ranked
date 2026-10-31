"use client";

import Link from "next/link";
import { ButtonLink, Chip, Icon, MobileColumn } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { useFinishedDuel, duelAgainHref } from "../use-finished-duel";

export default function PembahasanScreen() {
  const duel = useFinishedDuel();
  const wrong = duel?.result?.review.filter(r => !r.wasCorrect) ?? null;

  if (!duel || !wrong) {
    return (
      <MobileColumn className="items-center justify-center" width="wide">
        <p role="status" className="text-muted">Memuat pembahasan...</p>
      </MobileColumn>
    );
  }

  return (
    <MobileColumn brandBar width="wide" bareDesktop className="gap-5 px-5 pt-6 pb-6 sm:px-8 lg:px-0 lg:pt-2">
      <div className="flex items-start gap-3">
        <Link
          href="/hasil"
          aria-label="Kembali ke hasil duel"
          className="flex size-11 shrink-0 items-center justify-center rounded-input border-[1.5px] border-line bg-white hover:bg-surface"
        >
          <Icon name="kembali" size={20} />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] leading-tight font-extrabold lg:text-[36px]">Pembahasan</h1>
          <p className="text-[15px] leading-[22px] text-muted">
            {wrong.length > 0
              ? `${wrong.length} soal yang perlu kamu pelajari dari duel tadi.`
              : "Semua jawabanmu benar. Tidak ada soal yang perlu dipelajari."}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {wrong.map((item) => (
          <li key={item.position} className="flex flex-col gap-4 rounded-card border-[1.5px] border-line bg-white p-5 lg:p-7">
            <Chip tone="netral" className="self-start">
              Soal {item.position + 1} dari {duel.currentQuestion?.totalQuestions ?? wrong.length}
            </Chip>
            <h2 className="rounded-card-sm bg-violet-50 px-5 py-5 text-xl leading-7 font-extrabold lg:text-2xl">
              <MathText text={item.questionBody} />
            </h2>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="flex min-h-12 items-center gap-2.5 rounded-input bg-danger-bg px-3.5 py-2 text-danger">
                <Icon name="silang" size={18} strokeWidth={2.5} className="shrink-0" />
                <span className="text-sm font-semibold">Jawabanmu</span>
                <span className="ml-auto text-base font-extrabold text-ink">
                  <MathText text={item.yourAnswer ?? "Tidak dijawab"} />
                </span>
              </div>
              <div className="flex min-h-12 items-center gap-2.5 rounded-input bg-success-bg px-3.5 py-2 text-success">
                <Icon name="centang" size={18} strokeWidth={2.5} className="shrink-0" />
                <span className="text-sm font-semibold">Jawaban benar</span>
                <span className="ml-auto text-base font-extrabold text-ink">
                  <MathText text={item.correctAnswer} />
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <Icon name="buku" size={16} />
                Penjelasan
              </h3>
              <p className="text-[15px] leading-6 text-muted">
                <MathText text={item.explanation} />
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-6 lg:mx-auto lg:w-full lg:max-w-[420px]">
        <ButtonLink href={duelAgainHref(duel)} variant="sekunder">Duel Lagi</ButtonLink>
        <ButtonLink href="/lobby" variant="tautan">Ke Beranda</ButtonLink>
      </div>
    </MobileColumn>
  );
}
