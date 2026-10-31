"use client";

import { useEffect, useState, type ReactNode } from "react";
import { displayName, readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { getProfile, type Profile } from "@/lib/api";
import { isSekolahTerdaftar } from "@/lib/data/sekolah";
import { tampilanFitur, type Fitur } from "@/lib/ui-config";
import {
  CONTOH_PENCAPAIAN,
  CONTOH_PENGHARGAAN,
  CONTOH_RIWAYAT,
  CONTOH_STATISTIK,
} from "@/lib/ui-demo";
import {
  Avatar,
  ButtonLink,
  Card,
  ComingSoon,
  ContohChip,
  FlagID,
  Icon,
  JenjangChip,
  MobileColumn,
  TierChip,
  UserBar,
} from "@/components/ui";

function formatTanggal(iso: string | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProfilScreen() {
  const user = useCurrentUser();
  const [stats, setStats] = useState<Profile | null>(null);

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

  if (!user) {
    return (
      <MobileColumn nav="profil" width="full" bareDesktop className="items-center justify-center">
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
  const bergabung = formatTanggal(user.created_at);

  return (
    <MobileColumn
      nav="profil"
      width="full"
      bareDesktop
      className="gap-5 px-5 pt-6 pb-6 sm:px-8 lg:px-0 lg:pt-4"
      topBarRight={<UserBar nama={nama} sekolah={sekolah} jenjang={jenjang} />}
    >
      <h1 className="text-[1.75rem] leading-tight font-extrabold lg:sr-only">Profil</h1>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(22rem,26rem)_minmax(0,1fr)] lg:items-start lg:gap-6 min-[1440px]:gap-8">
        <div className="flex flex-col gap-5 lg:gap-6">
          {/* Kartu identitas */}
          <Card padding="md" className="flex flex-col gap-4 lg:p-8">
            <div className="flex items-center gap-4">
              <Avatar name={nama} size={76} className="ring-[6px] ring-violet-50 lg:size-24" />
              <div className="flex min-w-0 flex-col gap-2">
                <h2 className="truncate text-2xl leading-tight font-extrabold lg:text-[2rem]">
                  {nama}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {jenjang && <JenjangChip jenjang={jenjang} />}
                  {stats && <TierChip rating={stats.rating} />}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-[0.9375rem]">
              {sekolah && (
                <p className="flex min-w-0 items-center gap-2">
                  {isSekolahTerdaftar(sekolah) && <FlagID />}
                  <span className="truncate font-semibold">{sekolah}</span>
                  {isSekolahTerdaftar(sekolah) && <span className="shrink-0 text-muted">· Indonesia</span>}
                </p>
              )}
              {bergabung && (
                <p className="flex items-center gap-2 text-muted">
                  <Icon name="kalender" size={16} />
                  Bergabung {bergabung}
                </p>
              )}
            </div>
            <dl className="grid grid-cols-2 border-t border-line pt-4 text-center">
              <div className="flex flex-col gap-1">
                <dt className="text-[0.8125rem] text-muted">Rating</dt>
                <dd className="text-[1.875rem] leading-none font-extrabold text-violet">{stats?.rating ?? "–"}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-[0.8125rem] text-muted">Peringkat global</dt>
                <dd className="text-[1.875rem] leading-none font-extrabold">{stats ? `#${stats.rank}` : "–"}</dd>
              </div>
            </dl>
            <ButtonLink href="/pengaturan" variant="sekunder">
              <Icon name="pengaturan" size={20} />
              Pengaturan
            </ButtonLink>
          </Card>

          <Statistik />
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          <Pencapaian />
          <Penghargaan />
          <Riwayat />
        </div>
      </div>
    </MobileColumn>
  );
}

/** Bagian yang menunggu data backend: "Segera hadir", atau contoh berlabel saat mode demo. */
function Bagian({ fitur, judul, keterangan, children }: { fitur: Fitur; judul: string; keterangan: string; children: ReactNode }) {
  if (tampilanFitur(fitur) === "segera") return <ComingSoon title={judul}>{keterangan}</ComingSoon>;
  return (
    <Card padding="md" className="flex flex-col gap-4 lg:p-7">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold lg:text-xl">{judul}</h2>
        <ContohChip />
      </div>
      {children}
    </Card>
  );
}

function Statistik() {
  const s = CONTOH_STATISTIK;
  const item = [
    { label: "Main", nilai: String(s.menang + s.kalah), kelas: "" },
    { label: "Win rate", nilai: `${s.winRatePersen}%`, kelas: "text-violet" },
    { label: "Menang", nilai: String(s.menang), kelas: "text-success" },
    { label: "Kalah", nilai: String(s.kalah), kelas: "text-danger" },
  ];
  return (
    <Bagian fitur="statistik" judul="Statistik" keterangan="Jumlah main, menang, kalah, dan win rate akan tampil di sini.">
      <dl className="grid grid-cols-2 gap-3">
        {item.map((i) => (
          <div key={i.label} className="rounded-tile border-[1.5px] border-line p-4">
            <dt className="text-[0.8125rem] font-semibold text-muted">{i.label}</dt>
            <dd className={`text-[1.625rem] font-extrabold ${i.kelas}`}>{i.nilai}</dd>
          </div>
        ))}
      </dl>
    </Bagian>
  );
}

function Pencapaian() {
  return (
    <Bagian fitur="pencapaian" judul="Pencapaian" keterangan="Lencana dari duel-duelmu akan tampil di sini.">
      <ul className="grid grid-cols-3 gap-3 text-center">
        {CONTOH_PENCAPAIAN.map((p) => (
          <li key={p.id} className="flex flex-col items-center gap-2">
            <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-tile bg-violet-50 text-violet">
              <Icon name="petir" size={22} />
            </span>
            <span className="text-[0.8125rem] font-bold">{p.nama}</span>
          </li>
        ))}
      </ul>
    </Bagian>
  );
}

function Penghargaan() {
  return (
    <Bagian fitur="penghargaan" judul="Penghargaan" keterangan="Penghargaan mingguan akan tampil di sini.">
      <ul className="grid gap-3 sm:grid-cols-2">
        {CONTOH_PENGHARGAAN.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-tile border-[1.5px] border-line p-4">
            <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-ink">
              <Icon name="trofi" size={20} />
            </span>
            <span className="flex flex-col">
              <span className="text-[0.9375rem] font-extrabold">{p.nama}</span>
              <span className="text-xs text-muted">{p.keterangan}</span>
            </span>
          </li>
        ))}
      </ul>
    </Bagian>
  );
}

function Riwayat() {
  return (
    <Bagian fitur="riwayat" judul="Riwayat pertandingan" keterangan="Duel-duel terakhirmu akan tampil di sini.">
      <ul className="flex flex-col gap-2.5">
        {CONTOH_RIWAYAT.map((m) => (
          <li key={m.id} className="flex items-center gap-3 rounded-tile border-[1.5px] border-line p-3">
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
            <span className={`font-extrabold ${m.perubahanRating >= 0 ? "text-success" : "text-danger"}`}>
              {m.perubahanRating >= 0 ? `+${m.perubahanRating}` : m.perubahanRating}
            </span>
          </li>
        ))}
      </ul>
    </Bagian>
  );
}
