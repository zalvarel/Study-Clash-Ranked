"use client";
/* eslint-disable @next/next/no-img-element -- ikon SVG statis dari Figma */

import Link from "next/link";
import { ButtonLink, MobileColumn } from "@/components/ui";
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
    <MobileColumn className="gap-4 px-4 pt-5 pb-6 md:px-6" width="wide">
      <div className="flex items-center gap-3">
        <Link href="/hasil" aria-label="Kembali ke hasil duel"
          className="-m-2.5 flex size-11 items-center justify-center rounded-xl hover:bg-surface"
        >
          <span className="relative size-6">
            <img src="/figma/ikon-kembali.svg" alt="" width={16} height={9} className="absolute top-[11px] left-1" />
          </span>
        </Link>
        <h1 className="text-xl font-bold">Pembahasan</h1>
      </div>

      <p className="text-[15px] leading-[22px] text-muted">
        {wrong.length > 0
          ? `${wrong.length} soal yang perlu kamu pelajari dari duel tadi.`
          : "Semua jawabanmu benar. Tidak ada soal yang perlu dipelajari."}
      </p>

      <ul className="flex flex-col gap-4">
        {wrong.map((item) => (
          <li key={item.position} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-white p-5">
            <p className="text-[13px] font-semibold text-muted">
              Soal {item.position + 1} dari {duel.currentQuestion?.totalQuestions ?? wrong.length}
            </p>
            <h2 className="text-xl leading-7 font-bold">
              <MathText text={item.questionBody} />
            </h2>

            <div className="flex h-12 items-center gap-2.5 rounded-xl border-[1.5px] border-line bg-surface px-3.5">
              <span className="relative size-5 shrink-0">
                <img src="/figma/ikon-silang.svg" alt="" width={12} height={12} className="absolute top-1 left-1" />
              </span>
              <span className="text-sm text-muted">Jawabanmu</span>
              <span className="ml-auto text-base font-bold">
                <MathText text={item.yourAnswer ?? "Tidak dijawab"} />
              </span>
            </div>

            <div className="flex h-12 items-center gap-2.5 rounded-xl bg-ink px-3.5">
              <span className="relative size-5 shrink-0">
                <img src="/figma/ikon-centang-kecil.svg" alt="" width={14.5} height={10.3333} className="absolute top-[4.83px] left-[3.17px]" />
              </span>
              <span className="text-sm text-track">Jawaban benar</span>
              <span className="ml-auto text-base font-bold text-white">
                <MathText text={item.correctAnswer} />
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <h3 className="text-sm font-bold">Penjelasan</h3>
              <p className="text-sm leading-[21px] text-muted">
                <MathText text={item.explanation} />
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <ButtonLink href={duelAgainHref(duel)} variant="sekunder">Duel Lagi</ButtonLink>
        <ButtonLink href="/lobby" variant="tautan">Ke Beranda</ButtonLink>
      </div>
    </MobileColumn>
  );
}
