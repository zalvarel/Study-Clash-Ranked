import type { Jenjang } from "@/lib/types";

export const DAFTAR_JENJANG: Jenjang[] = ["SD", "SMP", "SMA"];

/** Label jenjang di UI. */
export const JENJANG_LABEL: Record<Jenjang, string> = {
  SD: "SD",
  SMP: "SMP",
  SMA: "SMA / SMK",
};

export function isJenjang(value: unknown): value is Jenjang {
  return value === "SD" || value === "SMP" || value === "SMA";
}

/** Daftar sekolah awal per jenjang. */
export const SEKOLAH: Record<Jenjang, readonly string[]> = {
  SD: [
    "SDN Bulukandang",
    "SDN Sukoreno III Prigen",
    "SDN Watuagung II Prigen",
    "SDN Lumbangrejo I Prigen",
    "SDN Lumbangrejo II Prigen",
    "SDN Petahunan II Pasuruan",
    "SDN Randusari Pasuruan",
    "SDN Bukir Pasuruan",
    "SDN Krapyakrejo I Pasuruan",
    "SDN Sebani Pasuruan",
  ],
  SMP: [
    "SMPN 2 Prigen",
    "SMP PGRI 1 Prigen",
    "SMP PGRI 3 Prigen",
    "SMP Maarif Prigen",
    "SMP Taman Dewasa Prigen",
    "SMP Al Azhar Prigen",
    "SMP Sejahtera Prigen",
    "SMP Al Asyary Al Khoziny",
    "SMPN 10 Pasuruan",
  ],
  SMA: [
    "SMKN Prigen",
    "SMAS Sejahtera Prigen",
    "SMA Taman Madya Prigen",
    "SMAS Al Azhar Prigen",
    "SMAN 3 Pasuruan",
  ],
};

function normalisasi(teks: string) {
  return teks.toLocaleLowerCase("id").replace(/\s+/g, " ").trim();
}

/**
 * Cari sekolah di satu jenjang. Setiap kata pada `kata` harus muncul di nama
 * sekolah (urutan bebas, tidak peka huruf besar/kecil). Kata kosong = semua.
 */
export function cariSekolah(jenjang: Jenjang, kata: string): string[] {
  const potongan = normalisasi(kata).split(" ").filter(Boolean);
  return SEKOLAH[jenjang].filter((nama) => {
    const n = normalisasi(nama);
    return potongan.every((p) => n.includes(p));
  });
}
