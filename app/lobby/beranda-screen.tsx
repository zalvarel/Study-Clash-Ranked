"use client";
/* eslint-disable @next/next/no-img-element -- avatar SVG statis dari Figma */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { displayName, useCurrentUser } from "@/lib/auth";
import { getProfile, JENJANG_LABEL, type Profile } from "@/lib/api";
import { Button, ButtonLink, MobileColumn } from "@/components/ui";

export default function BerandaScreen() {
  const user = useCurrentUser();
  const router = useRouter();
  const [stats, setStats] = useState<Profile | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ambil profil setelah sesi dipastikan lengkap (useCurrentUser sudah mengalihkan kalau belum).
  const siap = user !== null;
  useEffect(() => {
    if (!siap) return;
    let active = true;
    getProfile().then((s) => {
      if (active) setStats(s);
    });
    return () => {
      active = false;
    };
  }, [siap]);

  // Fokus ke input kode saat modal terbuka.
  useEffect(() => {
    if (showRoomModal) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showRoomModal]);

  function closeModal() {
    setShowRoomModal(false);
    setRoomCode("");
    setRoomError(null);
  }

  function handleBuatRoom() {
    closeModal();
    router.push("/cari?mode=create_room");
  }

  function handleGabungRoom() {
    const code = roomCode.trim().toUpperCase();
    if (code.length !== 4) {
      setRoomError("Kode room harus 4 karakter.");
      inputRef.current?.focus();
      return;
    }
    closeModal();
    router.push(`/cari?room=${code}`);
  }

  if (!user) {
    return (
      <MobileColumn className="items-center justify-center" nav="beranda">
        <p role="status" className="text-muted">
          Memuat...
        </p>
      </MobileColumn>
    );
  }

  return (
    <>
    <MobileColumn className="gap-5 px-4 pt-6 pb-4" nav="beranda">
      {/* Header (node 2:50) */}
      <div className="flex items-center gap-3">
        <img src="/figma/avatar-beranda.svg" alt="" width={44} height={44} className="size-11 shrink-0" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-normal text-muted">Halo,</span>
            <span className="truncate text-lg font-bold">{displayName(user)}</span>
          </h1>
          {stats && (
            <p className="truncate text-sm text-muted">
              {JENJANG_LABEL[stats.jenjang]} · {stats.sekolah}
            </p>
          )}
        </div>
      </div>

      {/* Kartu rating (node 2:55) */}
      <section
        aria-label="Rating kamu"
        className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-line bg-surface p-5"
      >
        <p className="text-sm font-medium text-muted">Rating kamu</p>
        <p className="text-[44px] leading-none font-bold">{stats?.rating ?? "–"}</p>
        <p className="text-sm text-muted">
          {stats ? `Peringkat #${stats.rank} dari semua pemain` : "Memuat peringkat..."}
        </p>
      </section>

      {/* Tombol (node 2:59) */}
      <div className="flex flex-col gap-3">
        <ButtonLink href="/cari">Cari Lawan</ButtonLink>
        <ButtonLink href="/cari?mode=bot" variant="sekunder">
          Latihan Lawan Bot
        </ButtonLink>
        <Button variant="sekunder" onClick={() => setShowRoomModal(true)}>
          Main dengan Teman
        </Button>
        <p className="text-center text-sm leading-[21px] text-muted">
          Lawan dicari dari pemain dengan rating yang berdekatan denganmu.
        </p>
      </div>
    </MobileColumn>

    {/** Modal kode room */}
    {showRoomModal && (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      >
        <div className="w-full max-w-sm rounded-2xl border-[1.5px] border-line bg-white p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Main dengan Teman</h2>
            <p className="text-sm leading-[21px] text-muted">
              Buat room baru atau masukkan kode dari temanmu.
            </p>
          </div>

          {/** Buat room baru */}
          <Button onClick={handleBuatRoom}>Buat Room Baru</Button>

          {/** Gabung room dengan kode */}
          <div className="flex flex-col gap-2">
            <label htmlFor="room-code" className="text-sm font-semibold">
              Atau masukkan kode room
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                id="room-code"
                type="text"
                maxLength={4}
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setRoomError(null);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleGabungRoom(); }}
                placeholder="ABCD"
                aria-invalid={roomError ? true : undefined}
                aria-describedby={roomError ? "room-code-error" : undefined}
                className="h-13 flex-1 rounded-xl border-[1.5px] border-ink bg-white px-4 text-center text-base font-bold uppercase tracking-widest placeholder:text-subtle placeholder:font-normal placeholder:tracking-normal focus-visible:outline-offset-2 aria-invalid:border-danger"
              />
              <Button
                onClick={handleGabungRoom}
                className="h-13 w-auto flex-none px-5"
              >
                Gabung
              </Button>
            </div>
            {roomError && (
              <p id="room-code-error" role="alert" className="text-sm font-medium text-danger">
                {roomError}
              </p>
            )}
          </div>

          <Button variant="tautan" onClick={closeModal}>
            Batal
          </Button>
        </div>
      </div>
    )}
  </>
  );
}
