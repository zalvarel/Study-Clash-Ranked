import type { Jenjang } from "@/lib/types";

export const DAFTAR_JENJANG: Jenjang[] = ["SD", "SMP", "SMA"];

/**
 * Label jenjang di UI. Hanya tampilan: nilai yang dikirim ke backend tetap "SD" | "SMP" | "SMA".
 * SMP mencakup MTs, SMA mencakup SMK.
 */
export const JENJANG_LABEL: Record<Jenjang, string> = {
  SD: "SD",
  SMP: "SMP / MTs",
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
    // Madrasah Tsanawiyah (setara SMP).
    "MTsN 1 Pasuruan",
    "MTsN 2 Pasuruan",
    "MTs Maarif Prigen",
    "MTs Al Azhar Prigen",
    "MTs Darul Ulum Prigen",
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

/** Kata pencarian yang berarti sama dengan singkatan di nama sekolah. */
const SINONIM: Record<string, string> = { madrasah: "mts", tsanawiyah: "mts" };

/**
 * Cari sekolah di satu jenjang. Setiap kata pada `kata` harus muncul di nama
 * sekolah (urutan bebas, tidak peka huruf besar/kecil). Kata kosong = semua.
 */
export function cariSekolah(jenjang: Jenjang, kata: string): string[] {
  const potongan = normalisasi(kata).split(" ").filter(Boolean);
  return SEKOLAH[jenjang].filter((nama) => {
    const n = normalisasi(nama);
    return potongan.every((p) => n.includes(p) || (SINONIM[p] !== undefined && n.includes(SINONIM[p])));
  });
}

/** Sekolah ada di daftar bawaan (semuanya sekolah di Indonesia). */
export function isSekolahTerdaftar(nama: string): boolean {
  const n = normalisasi(nama);
  return Object.values(SEKOLAH).some((daftar) => daftar.some((s) => normalisasi(s) === n));
}
