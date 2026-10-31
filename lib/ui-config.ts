/**
 * Konfigurasi tampilan (UI saja, tanpa logika backend).
 *
 * Bagian desain yang datanya belum ada di backend disembunyikan di balik flag.
 * Default semua mati: tampil "Segera hadir".
 * Kalau NEXT_PUBLIC_UI_DEMO=1, tampil data contoh berlabel "Contoh" dari lib/ui-demo.ts.
 * Nyalakan flag hanya setelah backend menyediakan datanya.
 */

/** Mode demo tampilan: tunjukkan data contoh (selalu berlabel "Contoh"). */
export const UI_DEMO = process.env.NEXT_PUBLIC_UI_DEMO === "1";

/** Fitur yang sudah ada di desain tapi belum ada data/endpoint-nya. */
export const FITUR = {
  statistik: false, // menang, kalah, win rate
  riwayat: false, // riwayat duel
  pencapaian: false, // pencapaian
  penghargaan: false, // penghargaan
  blokir: false, // blokir pemain
  tingkatBot: false, // pilihan tingkat Latihan Bot
  pertandinganTerakhir: false, // kartu pertandingan terakhir di Beranda
  infoLawanLengkap: false, // sekolah dan bendera lawan
} as const;

export type Fitur = keyof typeof FITUR;

/**
 * Laporan lawan (lib/ui-report.ts). Formulirnya selalu tampil di hasil Ranked.
 * false (default): belum ada endpoint. Kirim = pesan "belum aktif", atau sukses simulasi saat UI_DEMO.
 * true: nyalakan setelah submitReport dihubungkan ke endpoint laporan di backend.
 */
export const reportEnabled = false;

/**
 * Cara menampilkan sebuah fitur:
 * "nyata" = data asli dari backend, "contoh" = data demo berlabel, "segera" = "Segera hadir".
 */
export type TampilanFitur = "nyata" | "contoh" | "segera";

export function tampilanFitur(fitur: Fitur): TampilanFitur {
  if (FITUR[fitur]) return "nyata";
  return UI_DEMO ? "contoh" : "segera";
}

/* ------------------------------------------------------------------ */
/* Konstanta tampilan                                                  */
/* ------------------------------------------------------------------ */

/** Tier dari rating. Hanya tampilan; tidak ada di backend. */
export type Tier = "Perunggu" | "Perak" | "Emas";

export const TIER_BATAS = { perak: 900, emas: 1200 } as const;

/** Awal rentang tier terbawah, hanya untuk bilah kemajuan. */
export const TIER_AWAL_PERUNGGU = 600;

/** Tier berikutnya dan jarak poinnya; null kalau sudah tier tertinggi. */
export function tierBerikutnya(rating: number): { tier: Tier; kurang: number; kemajuan: number } | null {
  if (rating >= TIER_BATAS.emas) return null;
  const [awal, batas, tier]: [number, number, Tier] =
    rating < TIER_BATAS.perak
      ? [TIER_AWAL_PERUNGGU, TIER_BATAS.perak, "Perak"]
      : [TIER_BATAS.perak, TIER_BATAS.emas, "Emas"];
  const kemajuan = Math.min(1, Math.max(0, (rating - awal) / (batas - awal)));
  return { tier, kurang: batas - rating, kemajuan };
}

export function tierDariRating(rating: number): Tier {
  if (rating < TIER_BATAS.perak) return "Perunggu";
  if (rating < TIER_BATAS.emas) return "Perak";
  return "Emas";
}

/** Tingkat soal diturunkan dari timeLimitSec soal (bukan dari backend). */
export type TingkatSoal = "Mudah" | "Sedang" | "Sulit";

export const TINGKAT_BATAS_DETIK = { mudah: 10, sedang: 20 } as const;

export function tingkatDariWaktu(timeLimitSec: number): TingkatSoal {
  if (timeLimitSec <= TINGKAT_BATAS_DETIK.mudah) return "Mudah";
  if (timeLimitSec <= TINGKAT_BATAS_DETIK.sedang) return "Sedang";
  return "Sulit";
}
