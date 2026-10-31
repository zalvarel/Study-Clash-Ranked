"use client";

import { useEffect, useState } from "react";
import { displayName, readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { isSekolahTerdaftar } from "@/lib/data/sekolah";
import { DAFTAR_JENJANG, getLeaderboard, JENJANG_LABEL, type Jenjang, type Leaderboard, type LeaderboardEntry } from "@/lib/api";
import {
  Avatar,
  ButtonLink,
  FlagID,
  Icon,
  JenjangChip,
  MobileColumn,
  RankRow,
  SchoolName,
  Segmented,
  TierChip,
  UserBar,
} from "@/components/ui";

type Tab = "sekolah" | "global";
type Filter = Jenjang;

const TABS = [
  { value: "sekolah", label: "Sekolahku" },
  { value: "global", label: "Global" },
] as const;

/** Chip jenjang: SD, SMP/MTs, SMA/SMK. Nilai tetap "SD" | "SMP" | "SMA". */
const FILTERS: { id: Filter; label: string }[] = DAFTAR_JENJANG.map((j) => ({
  id: j,
  label: JENJANG_LABEL[j].replace(" / ", "/"),
}));

/** Baris yang sama dengan pemain sendiri (data peringkat tidak punya id). */
function samaDenganSaya(row: LeaderboardEntry, me: LeaderboardEntry) {
  return row.name === me.name && row.sekolah === me.sekolah && row.rating === me.rating;
}

export default function PeringkatScreen() {
  const user = useCurrentUser();
  const profil = user ? readProfilSekolah(user) : null;
  const jenjangSendiri = profil?.jenjang;
  const [tab, setTab] = useState<Tab>("sekolah");
  // Global: default jenjang sendiri, sampai pengguna memilih filter lain.
  const [pilihan, setPilihan] = useState<Filter | null>(null);
  const filter: Filter | null = tab === "sekolah" ? (jenjangSendiri ?? null) : (pilihan ?? jenjangSendiri ?? null);
  const [board, setBoard] = useState<Leaderboard | null>(null);

  useEffect(() => {
    if (!filter) return;
    let active = true;
    getLeaderboard(filter).then((b) => {
      if (active) setBoard(b);
    });
    return () => {
      active = false;
    };
  }, [filter]);

  // Abaikan data milik filter sebelumnya.
  const current = board && board.jenjang === filter ? board : null;
  const nama = user ? displayName(user) : "";
  const sekolahku = profil?.sekolah ?? "";
  const filterLabel = filter ? JENJANG_LABEL[filter] : "";

  // Sekolahku: disaring di klien dari 10 teratas jenjangmu.
  const barisSekolah = current ? current.entries.filter((r) => r.sekolah === sekolahku) : [];
  const posisiSaya = current ? barisSekolah.findIndex((r) => samaDenganSaya(r, current.me)) : -1;
  const peringkatSekolah = posisiSaya >= 0 ? posisiSaya + 1 : null;

  return (
    <MobileColumn
      nav="peringkat"
      width="full"
      bareDesktop
      className="gap-4 px-5 pt-6 pb-6 sm:px-8 lg:gap-6 lg:px-0 lg:pt-4"
      topBarRight={user ? <UserBar nama={nama} sekolah={profil?.sekolah} jenjang={profil?.jenjang} /> : undefined}
    >
      <header className="flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-[1.75rem] leading-tight font-extrabold lg:text-[2.5rem]">Peringkat</h1>
          <p className="text-sm text-muted lg:text-base">
            {tab === "sekolah" ? "Rating tertinggi di sekolahmu" : `Rating tertinggi, ${filterLabel}`}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <Segmented options={TABS} value={tab} onChange={setTab} label="Jenis peringkat" className="lg:w-[25rem] lg:shrink-0" />
        {tab === "global" && (
          <div role="group" aria-label="Filter jenjang" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const aktif = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() => setPilihan(f.id)}
                  className={`h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                    aktif ? "bg-violet text-white" : "border-[1.5px] border-line bg-white text-ink hover:border-violet"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!current ? (
        <p role="status" className="text-muted">
          Memuat peringkat...
        </p>
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] min-[1440px]:gap-8 lg:items-start lg:gap-6">
          <section className="flex flex-col gap-3 lg:rounded-card lg:border-[1.5px] lg:border-line lg:bg-white lg:p-7">
            {tab === "sekolah" && (
              <div className="flex items-center gap-3 rounded-card-sm bg-violet-50 p-4 lg:bg-transparent lg:p-0 lg:pb-2">
                <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet lg:size-14 lg:bg-violet-50">
                  <Icon name="beranda" size={22} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="truncate text-base font-extrabold lg:text-2xl">{sekolahku}</h2>
                  <span className="flex items-center gap-1.5 text-[0.8125rem] text-muted">
                    {isSekolahTerdaftar(sekolahku) && (
                      <>
                        <FlagID />
                        Indonesia ·
                      </>
                    )}
                    {jenjangSendiri ? `Pemain ${JENJANG_LABEL[jenjangSendiri]}` : ""}
                  </span>
                </div>
                <div className="flex flex-col items-end lg:hidden">
                  <span className="text-xs font-bold text-violet-ink">Peringkatmu</span>
                  <span className="text-[1.75rem] leading-none font-extrabold text-violet">
                    {peringkatSekolah ? `#${peringkatSekolah}` : "–"}
                  </span>
                </div>
              </div>
            )}

            {tab === "sekolah" && barisSekolah.length === 0 ? (
              <EmptySchool />
            ) : (
              <>
                {/* Ponsel/tablet: baris */}
                <ol className="flex flex-col gap-1 lg:hidden" aria-label="Pemain teratas">
                  {(tab === "sekolah" ? barisSekolah : current.entries).map((row, i) => (
                    <li key={`${row.rank}-${row.name}`}>
                      <RankRow
                        rank={tab === "sekolah" ? i + 1 : row.rank}
                        name={row.name}
                        rating={row.rating}
                        school={tab === "global" ? row.sekolah : undefined}
                        isMe={samaDenganSaya(row, current.me)}
                      />
                    </li>
                  ))}
                </ol>
                {/* Desktop: tabel */}
                <RankTable
                  rows={tab === "sekolah" ? barisSekolah.map((r, i) => ({ ...r, rank: i + 1 })) : current.entries}
                  me={current.me}
                  showSchool={tab === "global"}
                />
              </>
            )}

            {tab === "global" && filter === jenjangSendiri && !current.entries.some((r) => samaDenganSaya(r, current.me)) && (
              <>
                <p aria-hidden="true" className="text-center text-xl font-bold text-muted">
                  ...
                </p>
                <RankRow rank={current.me.rank} name={current.me.name} rating={current.me.rating} school={current.me.sekolah} isMe />
              </>
            )}
          </section>

          <aside className="hidden flex-col gap-6 lg:flex">
            <section aria-labelledby="peringkatmu-judul" className="flex flex-col gap-4 rounded-card border-[1.5px] border-line bg-white p-6">
              <h2 id="peringkatmu-judul" className="text-xl font-extrabold">Peringkatmu</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 rounded-card-sm bg-violet-50 p-4">
                  <span className="text-[0.8125rem] font-bold text-violet-ink">Di sekolahmu</span>
                  <span className="text-[2.25rem] leading-none font-extrabold text-violet">
                    {peringkatSekolah ? `#${peringkatSekolah}` : "–"}
                  </span>
                  <span className="text-xs text-muted">{peringkatSekolah ? sekolahku : "Belum masuk 10 besar"}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-card-sm bg-surface p-4">
                  <span className="text-[0.8125rem] font-bold text-muted">
                    Global {filter ? JENJANG_LABEL[filter] : ""}
                  </span>
                  <span className="text-[2.25rem] leading-none font-extrabold">#{current.me.rank}</span>
                  <span className="text-xs text-muted">{filter === jenjangSendiri ? "Di jenjangmu" : "Di jenjang ini"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <TierChip rating={current.me.rating} />
                <span className="text-sm text-muted">
                  Rating <span className="text-2xl font-extrabold text-ink">{current.me.rating}</span>
                </span>
              </div>
            </section>
            <InviteCard />
          </aside>
        </div>
      )}
    </MobileColumn>
  );
}

/** Tabel desktop. Tanpa kolom main/win rate (belum ada datanya). */
function RankTable({ rows, me, showSchool }: { rows: LeaderboardEntry[]; me: LeaderboardEntry; showSchool: boolean }) {
  return (
    <table className="hidden w-full border-separate border-spacing-y-1 lg:table">
      <thead>
        <tr className="text-left text-xs font-bold tracking-wider text-muted uppercase">
          <th scope="col" className="w-14 px-3 py-2">#</th>
          <th scope="col" className="px-3 py-2">Pemain</th>
          {showSchool && <th scope="col" className="px-3 py-2">Sekolah</th>}
          <th scope="col" className="px-3 py-2">Jenjang</th>
          <th scope="col" className="px-3 py-2">Tingkat</th>
          <th scope="col" className="px-3 py-2 text-right">Rating</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const saya = samaDenganSaya(r, me);
          const sel = saya ? "bg-violet-50 border-y-[1.5px] border-violet" : "";
          return (
            <tr key={`${r.rank}-${r.name}`} className="text-[0.9375rem]">
              <td className={`rounded-l-tile px-3 py-3 ${sel} ${saya ? "border-l-[1.5px]" : ""}`}>
                <span
                  className={`flex size-[1.875rem] items-center justify-center rounded-[0.625rem] text-sm font-extrabold ${
                    r.rank === 1
                      ? "bg-orange-ink text-white"
                      : r.rank === 2 || saya
                        ? "bg-violet text-white"
                        : r.rank === 3
                          ? "bg-ink text-white"
                          : "bg-surface text-muted"
                  }`}
                >
                  {r.rank}
                </span>
              </td>
              <td className={`px-3 py-3 ${sel}`}>
                <span className="flex items-center gap-3">
                  <Avatar name={r.name} tone={saya ? "violet" : r.rank === 1 ? "orange" : "ink"} size={40} />
                  <span className="font-extrabold">
                    {r.name}
                    {saya && <span className="font-bold text-violet-ink"> (Kamu)</span>}
                  </span>
                </span>
              </td>
              {showSchool && (
                <td className={`max-w-[13.75rem] px-3 py-3 text-sm text-muted ${sel}`}>
                  <SchoolName name={r.sekolah} />
                </td>
              )}
              <td className={`px-3 py-3 ${sel}`}>
                <JenjangChip jenjang={r.jenjang} />
              </td>
              <td className={`px-3 py-3 ${sel}`}>
                <TierChip rating={r.rating} />
              </td>
              <td
                className={`rounded-r-tile px-3 py-3 text-right text-base font-extrabold ${sel} ${saya ? "border-r-[1.5px] text-violet-ink" : ""}`}
              >
                {r.rating}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function EmptySchool() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card-sm border-[1.5px] border-dashed border-zinc-300 p-6 text-center">
      <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-xl bg-violet-50 text-violet">
        <Icon name="room" size={24} />
      </span>
      <h2 className="text-lg font-extrabold">Baru kamu dari sekolah ini</h2>
      <p className="max-w-[21.25rem] text-sm leading-6 text-muted">
        Belum ada teman sekolahmu di 10 besar. Ajak temanmu main bareng supaya peringkat sekolahmu ramai.
      </p>
      <ButtonLink href="/cari?mode=create_room" className="lg:hidden">Buat Room</ButtonLink>
    </div>
  );
}

function InviteCard() {
  const [tersalin, setTersalin] = useState<string | null>(null);
  async function salin() {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      setTersalin("Tautan tersalin.");
    } catch {
      setTersalin(`Salin manual: ${url}`);
    }
  }
  return (
    <section aria-labelledby="ajak-judul" className="flex flex-col gap-3 rounded-card border-[1.5px] border-dashed border-zinc-300 p-6 text-center">
      <h2 id="ajak-judul" className="text-lg font-extrabold">Ajak temanmu dari sekolah ini</h2>
      <p className="text-sm leading-6 text-muted">Makin banyak yang main, makin seru peringkat sekolahmu.</p>
      <ButtonLink href="/cari?mode=create_room">Buat Room</ButtonLink>
      <button
        type="button"
        onClick={salin}
        className="flex h-14 items-center justify-center gap-2 rounded-button border-[1.5px] border-ink bg-white font-bold hover:bg-surface"
      >
        <Icon name="salin" size={18} />
        Salin tautan ajakan
      </button>
      <p role="status" className="min-h-5 text-[0.8125rem] font-semibold text-violet-ink">
        {tersalin}
      </p>
    </section>
  );
}
