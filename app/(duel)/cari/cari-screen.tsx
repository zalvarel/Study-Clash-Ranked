"use client";
/* eslint-disable @next/next/no-img-element -- pemuat SVG statis dari Figma */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { useDuel, type DuelMode } from "@/lib/duel";
import { getSocket } from "@/lib/socket";
import { formatClock } from "@/lib/use-now";
import { ButtonLink, MobileColumn } from "@/components/ui";
import { getSupabase } from "@/lib/supabase";

export default function CariScreen() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "bot" ? "bot" : searchParams.get("mode") === "create_room" ? "create_room" : "ranked";
  const joinRoomCode = searchParams.get("room");
  return <Pencarian key={`${mode}-${joinRoomCode}`} mode={mode as DuelMode | "create_room"} joinRoomCode={joinRoomCode} />;
}

function Pencarian({ mode, joinRoomCode }: { mode: DuelMode | "create_room"; joinRoomCode: string | null }) {
  const router = useRouter();
  const user = useCurrentUser();
  const { actions } = useDuel();
  const [seconds, setSeconds] = useState(0);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBot = mode === "bot";
  const isRoom = mode === "create_room" || joinRoomCode != null;

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const profil = readProfilSekolah(user);
    const jenjang = profil?.jenjang;

    async function connect() {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (!token || !active) return;

      const socket = getSocket(token);

      socket.on("room:created", ({ code }) => {
        if (active) setCreatedRoomCode(code);
      });

      socket.on("match:found", (payload) => {
        if (!active) return;
        const duelMode: DuelMode = payload.isBot ? "bot" : mode === "create_room" ? "room" : (mode as DuelMode);
        actions.setQueuing(payload.duelId, duelMode, payload.isBot, payload.opponent);
        router.replace(`/duel?id=${payload.duelId}`);
      });

      socket.on("duel:start", (payload) => {
        if (!active) return;
        actions.setCountdown(payload.startsAt);
      });

      socket.on("error", (err) => {
        if (active) setErrorMsg(err.message);
      });

      if (mode === "create_room") {
        socket.emit("room:create");
      } else if (joinRoomCode) {
        socket.emit("room:join", { code: joinRoomCode });
      } else {
        socket.emit("queue:join", { subject: "math", isBot: isBot, jenjang });
      }
    }

    connect();

    return () => {
      active = false;
    };
  }, [user, mode, joinRoomCode, isBot, actions, router]);

  function handleCancel() {
    getSupabase().auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        const socket = getSocket(data.session.access_token);
        socket.emit("queue:leave");
        socket.off("room:created");
        socket.off("match:found");
        socket.off("duel:start");
        socket.off("error");
      }
    });
    actions.reset();
    router.replace("/lobby");
  }

  return (
    <MobileColumn className="p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <div className="relative size-[120px]">
          <img src="/figma/pemuat-lingkaran.svg" alt="" width={120} height={120} className="absolute inset-0" />
          <div className="animate-putar absolute inset-0" aria-hidden="true">
            <img src="/figma/pemuat-busur.svg" alt="" width={60} height={60} className="absolute top-0 left-1/2" />
          </div>
          <p className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums">
            <span className="sr-only">Waktu mencari: </span>
            {formatClock(seconds)}
          </p>
        </div>

        <h1 className="text-2xl font-bold" aria-live="polite">
          {isBot ? "Menyiapkan bot..." : isRoom ? "Menunggu teman..." : "Mencari lawan..."}
        </h1>

        {createdRoomCode && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-muted">Kode room kamu</p>
            <p className="text-4xl font-black tracking-widest">{createdRoomCode}</p>
            <p className="text-xs text-muted">Bagikan ke temanmu</p>
          </div>
        )}

        {errorMsg && (
          <p role="alert" className="text-sm font-medium text-danger">{errorMsg}</p>
        )}

        <p className="text-base leading-6 text-muted">
          {isBot
            ? "Sebentar lagi latihan dimulai. Latihan tidak mengubah rating."
            : isRoom
              ? "Tunggu temanmu masuk dengan kode room di atas."
              : "Kami cari pemain dengan rating yang berdekatan denganmu, supaya duelnya adil."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {!isBot && !isRoom && (
          <>
            <p className="text-center text-sm leading-[21px] text-muted">
              Belum ketemu lawan? Kamu bisa latihan lawan bot sambil menunggu.
            </p>
            <ButtonLink href="/cari?mode=bot" replace variant="sekunder">
              Latihan Lawan Bot
            </ButtonLink>
          </>
        )}
        <button
          onClick={handleCancel}
          className="inline-flex w-full items-center justify-center rounded-xl px-4 h-12 font-semibold text-ink underline underline-offset-4 hover:decoration-2"
        >
          Batal
        </button>
      </div>
    </MobileColumn>
  );
}
