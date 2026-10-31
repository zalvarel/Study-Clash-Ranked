"use client";

import { useState } from "react";
import type { Jenjang } from "@/lib/api";
import { SEKOLAH_MAKS, validateNamaSekolah } from "@/lib/validasi";
import { JenjangPicker } from "./JenjangPicker";
import { SEKOLAH_LAIN, SekolahPicker } from "./SekolahPicker";

type Galat = { jenjang?: string; sekolah?: string; namaLain?: string };

/** State dan validasi isian jenjang + asal sekolah, dipakai /login dan /lengkapi. */
export function useProfilSekolahForm() {
  const [jenjang, setJenjangState] = useState<Jenjang | null>(null);
  const [sekolah, setSekolahState] = useState<string | null>(null);
  const [namaLain, setNamaLainState] = useState("");
  const [galat, setGalat] = useState<Galat>({});

  return {
    jenjang,
    sekolah,
    namaLain,
    galat,
    /** Ganti jenjang: pilihan sekolah ikut dikosongkan. */
    setJenjang(j: Jenjang) {
      if (j === jenjang) return;
      setJenjangState(j);
      setSekolahState(null);
      setNamaLainState("");
      setGalat((g) => ({ ...g, jenjang: undefined, sekolah: undefined, namaLain: undefined }));
    },
    setSekolah(s: string | null) {
      setSekolahState(s);
      if (s !== null) setGalat((g) => ({ ...g, sekolah: undefined }));
    },
    setNamaLain(n: string) {
      setNamaLainState(n);
      setGalat((g) => ({ ...g, namaLain: undefined }));
    },
    /**
     * Periksa semua isian. Kalau valid, kembalikan { jenjang, sekolah }.
     * Kalau tidak, tampilkan pesan dan kembalikan id kolom pertama yang salah.
     */
    validate(): { ok: true; jenjang: Jenjang; sekolah: string } | { ok: false; fokus: string } {
      const g: Galat = {};
      if (!jenjang) g.jenjang = "Pilih jenjang sekolahmu.";
      else if (!sekolah) g.sekolah = "Pilih asal sekolah dari daftar, atau pilih Sekolah lain.";
      else if (sekolah === SEKOLAH_LAIN) g.namaLain = validateNamaSekolah(namaLain) ?? undefined;
      setGalat(g);
      if (g.jenjang) return { ok: false, fokus: "jenjang-SD" };
      if (g.sekolah) return { ok: false, fokus: "sekolah" };
      if (g.namaLain) return { ok: false, fokus: "sekolah-lain" };
      return {
        ok: true,
        jenjang: jenjang!,
        sekolah: sekolah === SEKOLAH_LAIN ? namaLain.trim().replace(/\s+/g, " ") : sekolah!,
      };
    },
  };
}

export type ProfilSekolahForm = ReturnType<typeof useProfilSekolahForm>;

/** Isian jenjang (tiga kartu) dan asal sekolah (cari + "Sekolah lain"). */
export function ProfilSekolahFields({ form }: { form: ProfilSekolahForm }) {
  return (
    <>
      <JenjangPicker value={form.jenjang} onChange={form.setJenjang} error={form.galat.jenjang} />
      {/* key: isian sekolah kosong lagi setiap kali jenjang diganti. */}
      <SekolahPicker
        key={form.jenjang ?? "kosong"}
        jenjang={form.jenjang}
        value={form.sekolah}
        onChange={form.setSekolah}
        error={form.galat.sekolah}
      />
      {form.sekolah === SEKOLAH_LAIN && (
        <div className="flex flex-col gap-3">
          <label htmlFor="sekolah-lain" className="text-sm font-semibold">
            Nama sekolah
          </label>
          <input
            id="sekolah-lain"
            type="text"
            autoComplete="organization"
            maxLength={SEKOLAH_MAKS}
            value={form.namaLain}
            onChange={(e) => form.setNamaLain(e.target.value)}
            placeholder="Contoh: SMPN 1 Pandaan"
            aria-invalid={form.galat.namaLain ? true : undefined}
            aria-describedby={form.galat.namaLain ? "sekolah-lain-help sekolah-lain-error" : "sekolah-lain-help"}
            className="h-13 w-full rounded-xl border-[1.5px] border-ink bg-white px-4 text-base text-ink placeholder:text-subtle focus-visible:outline-offset-2 aria-invalid:border-danger"
          />
          <p id="sekolah-lain-help" className="text-sm text-muted">
            3 sampai 60 huruf.
          </p>
          {form.galat.namaLain && (
            <p id="sekolah-lain-error" className="text-sm font-medium text-danger">
              {form.galat.namaLain}
            </p>
          )}
        </div>
      )}
    </>
  );
}
