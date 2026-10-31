"use client";

import { useState, type ReactNode } from "react";
import { errorClass, helpClass, inputClass, labelClass } from "@/components/ui/Field";
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

type ProfilSekolahFieldsProps = {
  form: ProfilSekolahForm;
  /** Isian yang tampil sebelum jenjang, mis. nama panggilan. */
  leading?: ReactNode;
  /** Teks kecil di bawah pilihan jenjang. */
  note?: ReactNode;
  /** Desktop (>= 1024px): kiri nama + jenjang, kanan asal sekolah. */
  twoColumn?: boolean;
};

/** Isian jenjang (tiga kartu) dan asal sekolah (cari + "Sekolah lain"). */
export function ProfilSekolahFields({ form, leading, note, twoColumn = false }: ProfilSekolahFieldsProps) {
  return (
    <div className={`flex flex-col gap-5 ${twoColumn ? "lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10" : ""}`}>
      <div className="flex flex-col gap-5">
        {leading}
        <JenjangPicker value={form.jenjang} onChange={form.setJenjang} error={form.galat.jenjang} />
        {note && <p className={`${helpClass} -mt-2`}>{note}</p>}
      </div>
      <div className="flex flex-col gap-5">
        {/* key: isian sekolah kosong lagi setiap kali jenjang diganti. */}
        <SekolahPicker
          key={form.jenjang ?? "kosong"}
          jenjang={form.jenjang}
          value={form.sekolah}
          onChange={form.setSekolah}
          error={form.galat.sekolah}
        />
        {form.sekolah === SEKOLAH_LAIN && (
          <div className="flex flex-col gap-2">
            <label htmlFor="sekolah-lain" className={labelClass}>
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
              className={inputClass}
            />
            <p id="sekolah-lain-help" className={helpClass}>
              3 sampai 60 huruf.
            </p>
            {form.galat.namaLain && (
              <p id="sekolah-lain-error" className={errorClass}>
                {form.galat.namaLain}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
