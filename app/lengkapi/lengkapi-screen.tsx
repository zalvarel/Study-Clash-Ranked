"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { displayName, readProfilSekolah, saveProfilSekolah, useCurrentUser } from "@/lib/auth";
import { Button, MobileColumn } from "@/components/ui";
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
      <MobileColumn className="items-center justify-center">
        <p role="status" className="text-muted">
          Memuat...
        </p>
      </MobileColumn>
    );
  }

  return (
    <MobileColumn className="gap-6 px-6 pt-8 pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Lengkapi profil</h1>
        <p className="text-base leading-6 text-muted">
          Halo, {displayName(user)}! Pilih jenjang dan asal sekolahmu supaya lawanmu selalu sejenjang.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5">
        <ProfilSekolahFields form={profil} />
        {error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving} className="mt-auto">
          {saving ? "Menyimpan..." : "Simpan dan Lanjut"}
        </Button>
      </form>
    </MobileColumn>
  );
}
