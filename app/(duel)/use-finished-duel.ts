"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDuel, type DuelState } from "@/lib/duel";

/** Duel yang sudah selesai. Kalau tidak ada, arahkan ke duel aktif atau beranda. */
function useFinishedDuel(): DuelState | null {
  const router = useRouter();
  const { duel } = useDuel();

  useEffect(() => {
    if (duel === undefined || duel?.status === "finished") return;
    router.replace(duel?.status === "playing" ? "/duel" : "/lobby");
  }, [duel, router]);

  return duel?.status === "finished" ? duel : null;
}

type Loaded<T> = { duelId: string; data: T } | { duelId: string; error: string };

/**
 * Ambil data dari lib/api untuk duel yang sudah selesai.
 * `load` harus fungsi yang stabil (mis. getDuelResult dari lib/api).
 */
export function useFinishedDuelData<T>(load: (duelId: string) => Promise<T>) {
  const duel = useFinishedDuel();
  const duelId = duel?.duelId;
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null);

  useEffect(() => {
    if (!duelId) return;
    let active = true;
    load(duelId).then(
      (data) => active && setLoaded({ duelId, data }),
      (e: unknown) => active && setLoaded({ duelId, error: e instanceof Error ? e.message : String(e) }),
    );
    return () => {
      active = false;
    };
  }, [duelId, load]);

  // Abaikan data milik duel sebelumnya.
  const current = loaded && loaded.duelId === duelId ? loaded : null;
  return {
    duel,
    data: current && "data" in current ? current.data : null,
    error: current && "error" in current ? current.error : null,
  };
}

export function duelAgainHref(duel: { mode: DuelState["mode"] }) {
  return duel.mode === "bot" ? "/cari?mode=bot" : "/cari";
}
