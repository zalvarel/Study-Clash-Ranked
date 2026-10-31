/**
 * Data CONTOH untuk mode demo tampilan (NEXT_PUBLIC_UI_DEMO=1).
 * Bukan data asli. Setiap tampilan yang memakainya wajib memberi label LABEL_CONTOH.
 * Lihat lib/ui-config.ts.
 */

export const LABEL_CONTOH = "Contoh";

export const CONTOH_STATISTIK = {
  menang: 12,
  kalah: 8,
  winRatePersen: 60,
} as const;

export type ContohRiwayat = {
  id: string;
  lawan: string;
  hasil: "menang" | "kalah" | "seri";
  skorKamu: number;
  skorLawan: number;
  perubahanRating: number;
};

export const CONTOH_RIWAYAT: readonly ContohRiwayat[] = [
  { id: "c1", lawan: "Pemain A", hasil: "menang", skorKamu: 420, skorLawan: 310, perubahanRating: 18 },
  { id: "c2", lawan: "Pemain B", hasil: "kalah", skorKamu: 260, skorLawan: 380, perubahanRating: -14 },
  { id: "c3", lawan: "Pemain C", hasil: "menang", skorKamu: 505, skorLawan: 290, perubahanRating: 21 },
];

export const CONTOH_PENCAPAIAN: readonly { id: string; nama: string; keterangan: string }[] = [
  { id: "p1", nama: "Duel pertama", keterangan: "Selesaikan satu duel." },
  { id: "p2", nama: "Tiga beruntun", keterangan: "Menang tiga kali berturut-turut." },
  { id: "p3", nama: "Kilat", keterangan: "Jawab benar dalam 3 detik." },
];

export const CONTOH_PERTANDINGAN_TERAKHIR = CONTOH_RIWAYAT[0];

export const CONTOH_PENGHARGAAN: readonly { id: string; nama: string; keterangan: string }[] = [
  { id: "h1", nama: "Pemain baru terbaik", keterangan: "Minggu pertama" },
  { id: "h2", nama: "Streak master", keterangan: "4 menang berturut" },
];
