"use client";

import { useEffect, useState } from "react";
import { readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { DAFTAR_JENJANG, getLeaderboard, JENJANG_LABEL, type Jenjang, type Leaderboard } from "@/lib/api";
import { MobileColumn, RankRow } from "@/components/ui";

type Filter = Jenjang | "semua";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "semua", label: "Semua" },
  ...DAFTAR_JENJANG.map((j) => ({ id: j, label: JENJANG_LABEL[j] })),
];

export default function PeringkatScreen() {
  const user = useCurrentUser();
  const jenjangSendiri = user ? readProfilSekolah(user)?.jenjang : undefined;
  // Default: jenjang sendiri, sampai pengguna memilih filter lain.
  const [pilihan, setPilihan] = useState<Filter | null>(null);
  const filter: Filter | null = pilihan ?? jenjangSendiri ?? null;
  const [board, setBoard] = useState<Leaderboard | null>(null);

  useEffect(() => {
    if (!filter) return;
    let active = true;
    getLeaderboard(filter === "semua" ? undefined : filter).then((b) => {
      if (active) setBoard(b);
    });
    return () => {
      active = false;
    };
  }, [filter]);

  // Abaikan data milik filter sebelumnya.
  const current = board && (board.jenjang ?? "semua") === filter ? board : null;
  const filterLabel = FILTERS.find((f) => f.id === filter)?.label;

  return (
    <MobileColumn className="gap-2.5 px-4 pt-6 pb-4" nav="peringkat" width="wide">
      <h1 className="text-2xl font-bold">Peringkat</h1>
      <p className="text-sm text-muted">
        {filter && filter !== "semua"
          ? `Pemain ${filterLabel}, diurutkan berdasarkan rating.`
          : "Semua pemain, diurutkan berdasarkan rating."}
      </p>

      <div role="group" aria-label="Filter jenjang" className="mb-1.5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const aktif = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={aktif}
              onClick={() => setPilihan(f.id)}
              className={`h-9 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                aktif ? "bg-ink text-white" : "border-[1.5px] border-line bg-white text-ink hover:border-ink hover:bg-surface"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {current ? (
        <>
          <ol className="flex flex-col gap-2.5" aria-label={`5 pemain teratas, ${filterLabel}`}>
            {current.entries.map((row) => (
              <li key={`${row.rank}-${row.name}`}>
                <RankRow rank={row.rank} name={row.name} rating={row.rating} school={row.sekolah} />
              </li>
            ))}
          </ol>
          <p aria-hidden="true" className="text-center text-xl font-bold text-subtle">
            ...
          </p>
          <RankRow rank={current.me.rank} name={current.me.name} rating={current.me.rating} school={current.me.sekolah} isMe />
        </>
      ) : (
        <p role="status" className="text-muted">
          Memuat peringkat...
        </p>
      )}
    </MobileColumn>
  );
}
