"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { displayName, readProfilSekolah, useCurrentUser } from "@/lib/auth";
import { JENJANG_LABEL } from "@/lib/data/sekolah";
import { Avatar, Button, Chip, Icon, MobileColumn, SchoolName, UserBar, type IconName } from "@/components/ui";
import { useLogout } from "../use-logout";

export default function PengaturanScreen() {
  const user = useCurrentUser();
  const router = useRouter();
  const handleLogout = useLogout();
  const [konfirmasi, setKonfirmasi] = useState(false);

  if (!user) {
    return (
      <MobileColumn nav="profil" className="items-center justify-center">
        <p role="status" className="text-muted">
          Memuat...
        </p>
      </MobileColumn>
    );
  }

  const nama = displayName(user);
  const profil = readProfilSekolah(user);
  const tamu = user.is_anonymous === true;

  return (
    <MobileColumn
      nav="profil"
      className="gap-5 px-5 pt-6 pb-6 sm:px-8 sm:pt-8"
      topBarRight={<UserBar nama={nama} sekolah={profil?.sekolah} jenjang={profil?.jenjang} />}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="flex size-11 shrink-0 items-center justify-center rounded-input border-[1.5px] border-line hover:bg-surface"
        >
          <Icon name="kembali" size={20} />
        </button>
        <h1 className="text-[1.625rem] leading-tight font-extrabold">Pengaturan</h1>
      </div>

      <Grup judul="Akun">
        <div className="flex items-center gap-3 p-4">
          <Avatar name={nama} size={44} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[0.9375rem] font-extrabold">{nama}</span>
            <span className="truncate text-[0.8125rem] text-muted">
              {tamu ? "Akun tamu · tersimpan di browser ini" : (user.email ?? "Akun Google")}
            </span>
          </div>
          {tamu ? (
            <Chip tone="netral">Tamu</Chip>
          ) : (
            <Chip tone="sukses">
              <Icon name="centang" size={12} strokeWidth={3} />
              Google
            </Chip>
          )}
        </div>
      </Grup>

      <Grup judul="Profil">
        <Baris icon="profil" label="Nama panggilan">
          {nama}
        </Baris>
        <Baris icon="peringkat" label="Jenjang">
          {profil ? JENJANG_LABEL[profil.jenjang] : "–"}
        </Baris>
        <Baris icon="beranda" label="Sekolah">
          {profil ? <SchoolName name={profil.sekolah} className="justify-end" /> : "–"}
        </Baris>
      </Grup>
      <p className="-mt-3 px-1 text-[0.8125rem] text-muted">Profil belum bisa diubah dari aplikasi.</p>

      <Grup judul="Lainnya">
        <Link href="/bantuan" className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-surface">
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl bg-surface text-ink">
            <Icon name="bantuan" size={18} />
          </span>
          <span className="flex-1 text-[0.9375rem] font-bold">Bantuan dan privasi</span>
          <Icon name="kanan" size={18} className="text-muted" />
        </Link>
      </Grup>

      <div className="mt-auto flex flex-col gap-3 pt-2">
        {tamu && konfirmasi && (
          <p role="alert" className="rounded-button bg-danger-bg p-4 text-sm leading-6 font-semibold text-danger">
            Akun tamu tidak bisa dipulihkan setelah keluar. Rating dan data akun ini akan hilang dari browser ini.
          </p>
        )}
        <Button
          variant="bahaya"
          onClick={() => (tamu && !konfirmasi ? setKonfirmasi(true) : handleLogout())}
        >
          <Icon name="keluar" size={20} />
          {tamu && konfirmasi ? "Ya, keluar" : "Keluar"}
        </Button>
        {tamu && konfirmasi && (
          <Button variant="tautan" onClick={() => setKonfirmasi(false)}>
            Batal
          </Button>
        )}
      </div>
    </MobileColumn>
  );
}

function Grup({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section aria-label={judul} className="flex flex-col gap-2">
      <h2 className="px-1 text-[0.8125rem] font-extrabold tracking-wide text-muted uppercase">{judul}</h2>
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-tile border-[1.5px] border-line bg-white">
        {children}
      </div>
    </section>
  );
}

function Baris({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet">
        <Icon name={icon} size={18} />
      </span>
      <span className="shrink-0 text-[0.9375rem] font-bold">{label}</span>
      <span className="ml-auto min-w-0 truncate text-right text-sm text-muted">{children}</span>
    </div>
  );
}
