"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDuel } from "@/lib/duel";
import { TerputusView } from "./terputus-view";

/** Versi rute /terputus, mis. kalau halaman dimuat ulang saat duel dijeda. */
export default function TerputusScreen() {
  const router = useRouter();
  const { duel, actions } = useDuel();
  const [stillOffline, setStillOffline] = useState(false);

  // Tidak ada duel yang sedang berjalan: tidak ada yang perlu disambung lagi.
  useEffect(() => {
    if (duel === undefined) return;
    if (duel === null) router.replace("/lobby");
    else if (duel.status === "finished") router.replace("/hasil");
  }, [duel, router]);

  return (
    <TerputusView
      stillOffline={stillOffline}
      onRetry={() => {
        if (!navigator.onLine) return setStillOffline(true);
        actions.resume();
        router.replace("/duel");
      }}
      onLeave={() => {
        actions.reset();
        router.replace("/lobby");
      }}
    />
  );
}
