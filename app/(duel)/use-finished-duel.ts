"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDuel, type DuelState } from "@/lib/duel";

export function useFinishedDuel(): DuelState | null {
  const router = useRouter();
  const { duel } = useDuel();

  useEffect(() => {
    if (duel === undefined || duel?.status === "finished") return;
    router.replace(duel?.status === "playing" || duel?.status === "countdown" ? "/duel" : "/lobby");
  }, [duel, router]);

  return duel?.status === "finished" ? duel : null;
}

export function duelAgainHref(duel: { mode: DuelState["mode"] }) {
  return duel.mode === "bot" ? "/cari?mode=bot" : "/cari";
}
