"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { displayName, readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { getLeaderboard, getProfile, JENJANG_LABEL, type Jenjang, type Leaderboard, type Profile } from "@/lib/api";
import { tampilanFitur, tierBerikutnya, tierDariRating } from "@/lib/ui-config";
import { CONTOH_PERTANDINGAN_TERAKHIR } from "@/lib/ui-demo";
import {
  Avatar,
  Button,
  ButtonLink,
  Card,
  Chip,
  ComingSoon,
  ContohChip,
  Icon,
  JenjangChip,
  MobileColumn,
  RankRow,
  SchoolName,
  UserBar,
  errorClass,
} from "@/components/ui";
import { useLogout } from "../use-logout";

export default function BerandaScreen() {
  const user = useCurrentUser();
  const router = useRouter();
  const handleLogout = useLogout();
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
      <MobileColumn className="items-center justify-center" nav="beranda" width="full" bareDesktop>
        <p role="status" className="text-muted">
          Memuat...
        </p>
      </MobileColumn>
    );
  }

  const nama = displayName(user);
  const profil = readProfilSekolah(user);
  const jenjang = stats?.jenjang ?? profil?.jenjang;
  const sekolah = stats?.sekolah ?? profil?.sekolah;
  const tamu = user.is_anonymous === true;

  return (
    <>
      <MobileColumn
        nav="beranda"
        width="full"
        bareDesktop
        className="gap-5 px-5 pt-6 pb-6 sm:px-8 sm:pt-8 lg:gap-6 lg:px-0 lg:pt-4"
        topBarRight={<UserBar nama={nama} sekolah={sekolah} jenjang={jenjang} />}
      >
        {/* Header ponsel/tablet */}
        <header className="flex items-start gap-3 lg:hidden">
          <Avatar name={nama} size={44} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h1 className="flex min-w-0 flex-col">
              <span className="text-[0.8125rem] font-medium text-muted">Halo,</span>
              <span className="truncate text-xl leading-tight font-extrabold">{nama}</span>
            </h1>
            <div className="flex min-w-0 items-center gap-2 text-[0.8125rem] text-muted">
              {jenjang && <JenjangChip jenjang={jenjang} size="sm" />}
              {sekolah && <SchoolName name={sekolah} />}
            </div>
          </div>
        </header>

        {/* Judul desktop */}
        <div className="hidden flex-col gap-1 lg:flex">
          <h1 className="text-[2.5rem] leading-tight font-extrabold tracking-tight">Halo, {nama}</h1>
          <p className="text-base text-muted">Pilih cara bermainmu hari ini.</p>
        </div>

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)] lg:items-start lg:gap-6 min-[1440px]:gap-8">
          <div className="flex flex-col gap-4 lg:gap-6">
            <RankedCard stats={stats} />

            <div className="grid grid-cols-2 gap-3 lg:gap-6">
              <button
                type="button"
                onClick={() => setShowRoomModal(true)}
                className="flex flex-col items-start gap-1 rounded-card-sm border-[1.5px] border-line bg-white p-4 text-left transition-colors hover:border-violet sm:p-5 lg:p-7"
              >
                <span aria-hidden="true" className="mb-3 flex size-11 items-center justify-center rounded-xl bg-violet-50 text-violet lg:size-14">
                  <Icon name="room" size={22} />
                </span>
                <span className="text-base font-extrabold lg:text-2xl">Room</span>
                <span className="text-[0.8125rem] leading-5 text-muted lg:text-base">Main bareng teman pakai kode.</span>
              </button>
              <Link
                href="/cari?mode=bot"
                className="flex flex-col items-start gap-1 rounded-card-sm border-[1.5px] border-line bg-white p-4 transition-colors hover:border-orange sm:p-5 lg:p-7"
              >
                <span aria-hidden="true" className="mb-3 flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-ink lg:size-14">
                  <Icon name="bot" size={22} />
                </span>
                <span className="text-base font-extrabold lg:text-2xl">Latihan Bot</span>
                <span className="text-[0.8125rem] leading-5 text-muted lg:text-base">Tanpa rating, bebas coba.</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:gap-6">
            {tamu && <GuestCard onLogout={handleLogout} />}
            <PertandinganTerakhir />
            {jenjang && <PeringkatSingkat jenjang={jenjang} />}
          </div>
        </div>
      </MobileColumn>

      {showRoomModal && (
        <RoomModal
          inputRef={inputRef}
          roomCode={roomCode}
          roomError={roomError}
          onChange={(v) => {
            // Tempel kode apa pun: ambil huruf/angka saja, kapital, maks 4 karakter.
            setRoomCode(v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
            setRoomError(null);
          }}
          onJoin={handleGabungRoom}
          onCreate={handleBuatRoom}
          onClose={closeModal}
        />
      )}
    </>
  );
}

/** Kartu Ranked gelap: tier, rating, peringkat, kemajuan tier, tombol Main Ranked. */
function RankedCard({ stats }: { stats: Profile | null }) {
  const berikut = stats ? tierBerikutnya(stats.rating) : null;
  return (
    <section
      aria-labelledby="ranked-judul"
      className="relative overflow-hidden rounded-card bg-ink p-5 text-white sm:p-6 lg:p-10"
    >
      {/* Hiasan kapsul. */}
      <span aria-hidden="true" className="capsule absolute top-10 -right-8 h-9 w-28 bg-violet-ink lg:top-24 lg:h-24 lg:w-[30%]" />
      <span aria-hidden="true" className="capsule absolute top-[5.25rem] -right-10 h-9 w-28 bg-[#8a400f] lg:top-[13.5rem] lg:h-24 lg:w-[30%]" />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 id="ranked-judul" className="sr-only">Ranked</h2>
          {stats ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-bold">
              <span aria-hidden="true" className="size-2 rounded-full bg-white/80" />
              {tierDariRating(stats.rating)}
            </span>
          ) : (
            <span className="h-7 w-20 rounded-full bg-white/10" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="text-[3.5rem] leading-none font-extrabold tracking-tight tabular-nums lg:text-[7rem]">
            <span className="sr-only">Rating </span>
            {stats?.rating ?? "–"}
          </p>
          <p className="pb-1.5 text-sm font-semibold text-white/80 lg:pb-4 lg:text-xl">
            {stats ? `Peringkat #${stats.rank}` : "Memuat..."}
          </p>
        </div>

        {berikut && (
          <div className="flex max-w-[31.25rem] flex-col gap-2">
            <div className="flex justify-between text-[0.8125rem] font-medium text-white/80 lg:text-base">
              <span>Menuju {berikut.tier}</span>
              <span>{berikut.kurang} poin lagi</span>
            </div>
            <div
              role="progressbar"
              aria-label={`Kemajuan menuju ${berikut.tier}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(berikut.kemajuan * 100)}
              className="h-2 overflow-hidden rounded-full bg-white/15"
            >
              <div className="h-full rounded-full bg-orange" style={{ width: `${berikut.kemajuan * 100}%` }} />
            </div>
          </div>
        )}

        <ButtonLink href="/cari" className="mt-1 lg:w-auto lg:self-start lg:px-24">
          <Icon name="petir" size={20} />
          Main Ranked
        </ButtonLink>
      </div>
    </section>
  );
}

/** Akun tamu: ajakan masuk dengan Google. Memakai logika keluar yang sudah ada. */
function GuestCard({ onLogout }: { onLogout: () => void }) {
  const [konfirmasi, setKonfirmasi] = useState(false);
  return (
    <section aria-labelledby="tamu-judul" className="flex flex-col gap-3 rounded-card-sm bg-orange-50 p-5">
      <div className="flex items-center gap-2">
        <Chip tone="netral">Tamu</Chip>
        <h2 id="tamu-judul" className="text-base font-extrabold">Mode tamu</h2>
      </div>
      <p className="text-sm leading-6 text-[#8a3a0b]">
        Akun tamu hanya tersimpan di browser ini. Masuk dengan Google supaya akunmu bisa dipakai di perangkat lain.
      </p>
      {konfirmasi ? (
        <div className="flex flex-col gap-2" role="group" aria-label="Konfirmasi keluar">
          <p className={`${errorClass} text-[#8a3a0b]`}>
            Akun Google dibuat terpisah. Akun tamu ini akan keluar dari browser ini.
          </p>
          <Button onClick={onLogout}>Keluar lalu masuk Google</Button>
          <Button variant="tautan" onClick={() => setKonfirmasi(false)}>
            Batal
          </Button>
        </div>
      ) : (
        <Button onClick={() => setKonfirmasi(true)}>Masuk dengan Google</Button>
      )}
    </section>
  );
}

/** Tiga teratas di jenjangmu (getLeaderboard yang sama dengan halaman Peringkat). Desktop saja. */
function PeringkatSingkat({ jenjang }: { jenjang: Jenjang }) {
  const [board, setBoard] = useState<Leaderboard | null>(null);
  useEffect(() => {
    let active = true;
    getLeaderboard(jenjang)
      .then((b) => {
        if (active) setBoard(b);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [jenjang]);

  return (
    <Card padding="md" className="hidden flex-col gap-3 lg:flex">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-extrabold lg:text-xl">Peringkat · {JENJANG_LABEL[jenjang]}</h2>
        <Link href="/peringkat" className="text-sm font-bold underline underline-offset-4 hover:decoration-2">
          Lihat semua
        </Link>
      </div>
      {!board ? (
        <p role="status" className="text-sm text-muted">Memuat peringkat...</p>
      ) : board.entries.length === 0 ? (
        <p className="text-sm text-muted">Belum ada pemain di jenjang ini.</p>
      ) : (
        <ol className="flex flex-col gap-1" aria-label="Tiga teratas">
          {board.entries.slice(0, 3).map((r) => (
            <li key={`${r.rank}-${r.name}`}>
              <RankRow rank={r.rank} name={r.name} rating={r.rating} school={r.sekolah} />
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/** Pertandingan terakhir: belum ada datanya di backend (flag pertandinganTerakhir). */
function PertandinganTerakhir() {
  const tampilan = tampilanFitur("pertandinganTerakhir");
  if (tampilan === "segera") {
    return <ComingSoon title="Pertandingan terakhir">Riwayat duelmu akan tampil di sini.</ComingSoon>;
  }
  const m = CONTOH_PERTANDINGAN_TERAKHIR;
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-extrabold lg:text-xl">Pertandingan terakhir</h2>
        <ContohChip />
      </div>
      <div className="flex items-center gap-3 rounded-button border-[1.5px] border-line p-3">
        <span
          aria-hidden="true"
          className={`flex size-10 items-center justify-center rounded-xl text-sm font-extrabold ${
            m.hasil === "menang" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
          }`}
        >
          {m.hasil === "menang" ? "M" : "K"}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[0.9375rem] font-extrabold">vs {m.lawan}</span>
          <span className="text-xs text-muted">
            {m.skorKamu} : {m.skorLawan}
          </span>
        </span>
        <span className={`text-base font-extrabold ${m.perubahanRating >= 0 ? "text-success" : "text-danger"}`}>
          {m.perubahanRating >= 0 ? `+${m.perubahanRating}` : m.perubahanRating}
        </span>
      </div>
    </Card>
  );
}

type RoomModalProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  roomCode: string;
  roomError: string | null;
  onChange: (value: string) => void;
  onJoin: () => void;
  onCreate: () => void;
  onClose: () => void;
};

/** Modal room: masuk dengan kode 4 karakter, atau buat room baru. */
function RoomModal({ inputRef, roomCode, roomError, onChange, onJoin, onCreate, onClose }: RoomModalProps) {
  // Esc menutup modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [fokusInput, setFokusInput] = useState(false);
  const kotak = [0, 1, 2, 3];
  const aktif = Math.min(roomCode.length, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-judul"
        className="flex max-h-[92dvh] w-full flex-col gap-5 overflow-auto rounded-t-card bg-white p-6 sm:max-w-[27.5rem] sm:rounded-card sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 id="room-judul" className="text-2xl font-extrabold">
            Room
          </h2>
          <p className="text-sm leading-6 text-muted">Main bareng teman. Buat room baru atau masukkan kode dari temanmu.</p>
        </div>

        <div className="flex flex-col gap-3 rounded-card-sm border-[1.5px] border-line p-5">
          <label htmlFor="room-code" className="text-base font-extrabold">
            Masuk dengan kode
          </label>
          <p id="room-code-help" className="-mt-2 text-[0.8125rem] text-muted">
            Minta kode 4 karakter dari temanmu.
          </p>
          {/* Satu input asli di atas empat kotak tampilan. */}
          <div className="relative">
            <div aria-hidden="true" className="grid grid-cols-4 gap-2.5">
              {kotak.map((i) => {
                const huruf = roomCode[i];
                const fokus = fokusInput && i === aktif;
                return (
                  <span
                    key={i}
                    className={`flex h-14 items-center justify-center rounded-input border-[1.5px] text-2xl font-extrabold ${
                      roomError
                        ? "border-danger"
                        : huruf
                          ? "border-violet bg-violet-50 text-violet-ink"
                          : fokus
                            ? "border-violet ring-4 ring-violet-50"
                            : "border-line"
                    }`}
                  >
                    {huruf ?? ""}
                  </span>
                );
              })}
            </div>
            <input
              ref={inputRef}
              id="room-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={roomCode}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFokusInput(true)}
              onBlur={() => setFokusInput(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onJoin();
              }}
              aria-invalid={roomError ? true : undefined}
              aria-describedby={roomError ? "room-code-help room-code-error" : "room-code-help"}
              className="absolute inset-0 h-full w-full rounded-input bg-transparent text-transparent caret-transparent selection:bg-transparent focus-visible:outline-none"
            />
          </div>
          {roomError && (
            <p id="room-code-error" role="alert" className={errorClass}>
              {roomError}
            </p>
          )}
          <Button onClick={onJoin}>Gabung Room</Button>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          atau
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">Kamu jadi host. Duel langsung mulai saat temanmu masuk.</p>
          <Button variant="sekunder" onClick={onCreate}>
            Buat Room Baru
          </Button>
        </div>

        <Button variant="tautan" onClick={onClose}>
          Batal
        </Button>
      </div>
    </div>
  );
}
