"use client";
/* eslint-disable @next/next/no-img-element -- avatar SVG statis dari Figma */

import { useEffect, useState } from "react";
import { displayName, useCurrentUser } from "@/lib/auth";
import { getProfile, JENJANG_LABEL, type Profile } from "@/lib/api";
import { ButtonLink, MobileColumn } from "@/components/ui";

export default function BerandaScreen() {
  const user = useCurrentUser();
  const [stats, setStats] = useState<Profile | null>(null);

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
        <p className="text-center text-sm leading-[21px] text-muted">
          Lawan dicari dari pemain dengan rating yang berdekatan denganmu.
        </p>
      </div>
    </MobileColumn>
  );
}
