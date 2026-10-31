"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { displayName, readProfilSekolah, saveProfilSekolah, useCurrentUser } from "@/lib/auth";
import {
  Avatar,
  Button,
  Chip,
  Icon,
  Logo,
  MobileColumn,
  errorClass,
  helpClass,
  inputClass,
  labelClass,
} from "@/components/ui";
import { ProfilSekolahFields, useProfilSekolahForm } from "@/components/profil/ProfilSekolahFields";

/** Melengkapi jenjang & asal sekolah, mis. setelah masuk dengan Google. */
export default function LengkapiScreen() {
  const router = useRouter();
  const user = useCurrentUser({ requireProfil: false });
  const profil = useProfilSekolahForm();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sudahLengkap = user ? readProfilSekolah(user) !== null : false;

  // Profil sudah lengkap: tidak ada yang perlu diisi.
  useEffect(() => {
    if (sudahLengkap) router.replace("/lobby");
  }, [sudahLengkap, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const hasil = profil.validate();
    if (!hasil.ok) {
      document.getElementById(hasil.fokus)?.focus();
      return;
    }
    setSaving(true);
    try {
      await saveProfilSekolah({ jenjang: hasil.jenjang, sekolah: hasil.sekolah });
      router.replace("/lobby");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan profil.");
      setSaving(false);
    }
  }

  if (!user || sudahLengkap) {
    return (
      <MobileColumn brandBar width="full" className="items-center justify-center">
        <p role="status" className="text-muted">
          Memuat...
        </p>
      </MobileColumn>
    );
  }

  const nama = displayName(user);
  // Penanda tampilan saja; tidak mengubah alur simpan.
  const akunGoogle = !user.is_anonymous;

  return (
    <MobileColumn brandBar width="full" className="relative gap-6 px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 lg:px-16 lg:pt-14 lg:pb-14">
      {/* Hiasan latar. */}
      <span aria-hidden="true" className="capsule absolute top-10 -right-10 h-8 w-32 bg-violet-50 lg:hidden" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Logo size={36} className="-ml-1 lg:hidden" />
            <Chip tone={akunGoogle ? "violet" : "netral"}>{akunGoogle ? "Langkah terakhir" : "Mode tamu"}</Chip>
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight lg:text-[2.75rem]">Lengkapi profilmu</h1>
            <p className="text-base text-muted lg:text-lg">Biar lawanmu selevel denganmu.</p>
          </div>
        </div>

        {akunGoogle ? (
          <div className="flex items-center gap-3 rounded-button border-[1.5px] border-line bg-white px-3.5 py-2.5 lg:min-w-[23.75rem] lg:px-4 lg:py-3">
            <Avatar name={nama} size={44} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[0.9375rem] font-extrabold">{nama}</span>
              <span className="text-xs font-medium text-muted">Akun Google</span>
            </div>
            <Chip tone="sukses" className="ml-auto">
              <Icon name="centang" size={12} strokeWidth={3} />
              Tersambung
            </Chip>
          </div>
        ) : (
          <p className="flex items-start gap-2.5 rounded-button bg-surface px-3.5 py-3 text-[0.8125rem] leading-5 font-semibold text-muted">
            <Icon name="info" size={18} className="mt-px shrink-0" />
            Akun tamu hanya tersimpan di browser ini.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="relative flex flex-1 flex-col gap-6">
        <ProfilSekolahFields
          form={profil}
          twoColumn
          note="Lawan hanya melihat nama panggilan dan sekolahmu."
          leading={
            <div className="flex flex-col gap-2">
              <label htmlFor="nickname" className={labelClass}>
                Nama panggilan
              </label>
              <input
                id="nickname"
                type="text"
                value={nama}
                readOnly
                aria-describedby="nickname-help"
                className={inputClass}
              />
              <p id="nickname-help" className={helpClass}>
                {akunGoogle ? "Diambil dari akun Google, tidak bisa diubah." : "Nama panggilan yang kamu pilih saat masuk."}
              </p>
            </div>
          }
        />
        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving} className="mt-auto lg:mt-4">
          {saving ? "Menyimpan..." : "Mulai bermain"}
        </Button>
      </form>
    </MobileColumn>
  );
}
