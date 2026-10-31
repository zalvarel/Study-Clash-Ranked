"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { displayName, readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/api";
import { useDuel, type DuelMode } from "@/lib/duel";
import { getSocket } from "@/lib/socket";
import { formatClock } from "@/lib/use-now";
import {
  Avatar,
  Button,
  ButtonLink,
  Chip,
  Icon,
  JenjangChip,
  MobileColumn,
  SchoolName,
  Spinner,
  TierChip,
  errorClass,
} from "@/components/ui";
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
  /** Rating untuk chip tier (tampilan saja). */
  const [rating, setRating] = useState<number | null>(null);

  const isBot = mode === "bot";
  const isRoom = mode === "create_room" || joinRoomCode != null;

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Rating untuk chip tier. Memakai getProfile yang sudah ada (sama seperti Beranda).
  const siap = user !== null;
  useEffect(() => {
    if (!siap) return;
    let active = true;
    getProfile()
      .then((p) => {
        if (active) setRating(p.rating);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [siap]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    let matchFound = false;
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
        matchFound = true;
        const duelMode: DuelMode = payload.isBot ? "bot" : mode === "create_room" ? "room" : (mode as DuelMode);
        actions.setMatchFound(payload.duelId, duelMode, payload.isBot, payload.opponent);
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
      getSupabase().auth.getSession().then(({ data }) => {
        if (data.session?.access_token) {
          const socket = getSocket(data.session.access_token);
          if (!matchFound) {
            socket.emit("queue:leave");
          }
          socket.off("room:created");
          socket.off("match:found");
          socket.off("duel:start");
          socket.off("error");
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally depend on user?.id to avoid queue re-subscription on auth refresh
  }, [user?.id, mode, joinRoomCode, isBot, actions, router]);

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

  const profil = user ? readProfilSekolah(user) : null;

  if (mode === "create_room") {
    return (
      <RoomLobby
        code={createdRoomCode}
        nama={user ? displayName(user) : ""}
        sekolah={profil?.sekolah ?? null}
        errorMsg={errorMsg}
        onLeave={handleCancel}
      />
    );
  }

  // Gagal (mis. kode room salah): tampilkan pesan dari server dengan ramah, tanpa pemuat berputar.
  if (errorMsg) {
    return (
      <MobileColumn brandBar className="relative overflow-hidden px-6 pt-8 pb-6 sm:px-10">
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
          <span aria-hidden="true" className="flex size-20 items-center justify-center rounded-full bg-danger-bg text-danger ring-[0.625rem] ring-danger-bg/50">
            <Icon name="silang" size={34} strokeWidth={2.5} />
          </span>
          <h1 className="text-[1.625rem] leading-tight font-extrabold">
            {joinRoomCode ? "Tidak bisa bergabung" : isBot ? "Latihan belum bisa dimulai" : "Pencarian terhenti"}
          </h1>
          <p className="max-w-[22.5rem] text-[0.9375rem] leading-6 text-muted">
            {joinRoomCode ? (
              <>
                Room <strong className="font-extrabold text-ink">{joinRoomCode.toUpperCase()}</strong> tidak bisa dimasuki.
                Periksa lagi kodenya atau minta kode baru ke temanmu.
              </>
            ) : (
              "Coba lagi sebentar lagi."
            )}
          </p>
          <p role="alert" className="max-w-[22.5rem] rounded-input bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">
            {errorMsg}
          </p>
        </div>
        <div className="relative flex flex-col gap-3">
          <Button onClick={handleCancel}>{joinRoomCode ? "Coba kode lain" : "Kembali ke Beranda"}</Button>
        </div>
      </MobileColumn>
    );
  }

  const judul = isBot
    ? "Menyiapkan bot..."
    : joinRoomCode
      ? "Bergabung ke room..."
      : "Mencari lawan ranked...";
  const keterangan = isBot
    ? "Sebentar lagi latihan dimulai. Latihan tidak mengubah rating."
    : joinRoomCode
      ? `Kode ${joinRoomCode.toUpperCase()}. Duel langsung mulai setelah tersambung dengan temanmu.`
      : "Kami cari pemain dengan rating yang berdekatan denganmu, supaya duelnya adil.";

  return (
    <MobileColumn brandBar className="relative overflow-hidden px-6 pt-8 pb-6 sm:px-10">
      <span aria-hidden="true" className="capsule absolute top-10 -left-10 h-9 w-36 bg-violet-50" />
      <span aria-hidden="true" className="capsule absolute top-24 -right-10 h-9 w-28 bg-orange-50" />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <Spinner size={148}>
          <p className="text-[1.75rem] font-extrabold tabular-nums">
            <span className="sr-only">Waktu mencari: </span>
            {formatClock(seconds)}
          </p>
        </Spinner>

        <h1 className="text-[1.625rem] leading-tight font-extrabold" aria-live="polite">
          {judul}
        </h1>
        <p className="max-w-[22.5rem] text-[0.9375rem] leading-6 text-muted">{keterangan}</p>

        <ul className="flex flex-wrap justify-center gap-2" aria-label="Info pencarian">
          {rating !== null && !isBot && (
            <li>
              <TierChip rating={rating} />
            </li>
          )}
          {profil && (
            <li>
              <JenjangChip jenjang={profil.jenjang} />
            </li>
          )}
          <li>
            <Chip tone="netral">{isBot ? "Latihan" : joinRoomCode ? "Room" : "Ranked"}</Chip>
          </li>
        </ul>

      </div>

      <div className="relative flex flex-col gap-3">
        {!isBot && !isRoom && (
          <>
            <p className="text-center text-sm leading-[1.3125rem] text-muted">
              Belum ketemu lawan? Latihan lawan bot sambil menunggu.
            </p>
            <ButtonLink href="/cari?mode=bot" replace variant="sekunder">
              Latihan Lawan Bot
            </ButtonLink>
          </>
        )}
        <Button variant="tautan" onClick={handleCancel}>
          {isBot || isRoom ? "Batal" : "Batalkan pencarian"}
        </Button>
      </div>
    </MobileColumn>
  );
}

type RoomLobbyProps = {
  code: string | null;
  nama: string;
  sekolah: string | null;
  errorMsg: string | null;
  onLeave: () => void;
};

/** Host room: kartu kode 4 karakter, Salin/Bagikan, dan slot pemain. Duel mulai otomatis saat teman masuk. */
function RoomLobby({ code, nama, sekolah, errorMsg, onLeave }: RoomLobbyProps) {
  const [pesan, setPesan] = useState<string | null>(null);
  const [tautanCadangan, setTautanCadangan] = useState<string | null>(null);

  const tautan = () => `${window.location.origin}/cari?room=${code}`;

  async function salin() {
    if (!code) return;
    if (await salinTeks(code)) {
      setPesan("Kode tersalin.");
      setTautanCadangan(null);
    } else {
      // Clipboard tidak tersedia: tampilkan tautan untuk disalin manual.
      setTautanCadangan(tautan());
      setPesan("Tidak bisa menyalin otomatis. Salin tautan di bawah.");
    }
  }

  async function bagikan() {
    if (!code) return;
    const url = tautan();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Study Clash Ranked", text: `Ayo duel! Kode room: ${code}`, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    if (await salinTeks(url)) {
      setPesan("Tautan tersalin. Kirim ke temanmu.");
      setTautanCadangan(null);
    } else {
      setTautanCadangan(url);
      setPesan("Salin tautan di bawah lalu kirim ke temanmu.");
    }
  }

  return (
    <MobileColumn brandBar width="wide" bareDesktop className="gap-5 px-5 pt-6 pb-6 sm:px-8 lg:gap-8 lg:px-0 lg:pt-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onLeave}
          aria-label="Keluar room"
          className="flex size-11 shrink-0 items-center justify-center rounded-input border-[1.5px] border-line bg-white hover:bg-surface"
        >
          <Icon name="kembali" size={20} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-[1.625rem] leading-tight font-extrabold lg:text-[2.5rem]">Room</h1>
          <p className="text-sm text-muted lg:text-base">Duel langsung mulai saat temanmu masuk.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <section
          aria-labelledby="kode-judul"
          className="relative flex flex-col items-center gap-3 overflow-hidden rounded-card bg-violet-50 px-5 py-8 text-center lg:py-20"
        >
          <span aria-hidden="true" className="capsule absolute top-4 -right-8 h-8 w-28 bg-violet-100" />
          <span aria-hidden="true" className="capsule absolute bottom-6 -left-8 h-8 w-24 bg-orange-100/60" />
          <h2 id="kode-judul" className="relative text-sm font-bold text-violet-ink lg:text-base">
            Kode room
          </h2>
          {code ? (
            <p className="relative text-[3.25rem] leading-none font-extrabold tracking-[0.2em] text-violet lg:text-[5.25rem]" aria-live="polite">
              <span className="sr-only">Kode: </span>
              {code.split("").join(" ")}
            </p>
          ) : (
            <p role="status" className="relative py-3 text-base font-semibold text-violet-ink">
              Membuat room...
            </p>
          )}
          <p className="relative text-sm text-muted">Bagikan kode ini ke temanmu.</p>
          <div className="relative flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={salin}
              disabled={!code}
              className="flex h-11 items-center gap-2 rounded-input border-[1.5px] border-line bg-white px-4 text-sm font-bold hover:border-violet disabled:text-subtle"
            >
              <Icon name="salin" size={18} />
              Salin
            </button>
            <button
              type="button"
              onClick={bagikan}
              disabled={!code}
              className="flex h-11 items-center gap-2 rounded-input border-[1.5px] border-line bg-white px-4 text-sm font-bold hover:border-violet disabled:text-subtle"
            >
              <Icon name="bagikan" size={18} />
              Bagikan
            </button>
          </div>
          <p role="status" className="relative min-h-5 text-[0.8125rem] font-semibold text-violet-ink">
            {pesan}
          </p>
          {tautanCadangan && (
            <input
              readOnly
              value={tautanCadangan}
              aria-label="Tautan room"
              onFocus={(e) => e.currentTarget.select()}
              className="relative h-11 w-full max-w-[22.5rem] rounded-input border-[1.5px] border-line bg-white px-3 text-center text-sm font-medium"
            />
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section aria-labelledby="pemain-judul" className="flex flex-col gap-3 rounded-card border-[1.5px] border-line bg-white p-5 lg:p-7">
            <h2 id="pemain-judul" className="text-[0.8125rem] font-extrabold tracking-wide text-muted uppercase lg:text-xl lg:tracking-normal lg:text-ink lg:normal-case">
              Pemain
            </h2>
            <div className="flex items-center gap-3 rounded-button border-[1.5px] border-line p-3">
              <Avatar name={nama || "K"} size={44} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[0.9375rem] font-extrabold">{nama || "Kamu"}</span>
                  <Chip tone="violet" size="sm">Kamu (Host)</Chip>
                </span>
                {sekolah && <SchoolName name={sekolah} className="text-xs text-muted" />}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-button border-[1.5px] border-dashed border-zinc-300 p-3">
              <span aria-hidden="true" className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-surface">
                <span className="animate-putar size-5 rounded-full border-[3px] border-line border-t-orange" />
              </span>
              <span className="text-[0.9375rem] font-bold text-muted">Menunggu teman...</span>
            </div>
          </section>

          {errorMsg && (
            <p role="alert" className={errorClass}>
              {errorMsg}
            </p>
          )}

          <Button variant="tautan" onClick={onLeave}>
            Keluar Room
          </Button>
        </div>
      </div>
    </MobileColumn>
  );
}

/** Salin teks: Clipboard API, lalu cara lama (execCommand) untuk browser/HTTP tanpa izin clipboard. */
async function salinTeks(teks: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(teks);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = teks;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
