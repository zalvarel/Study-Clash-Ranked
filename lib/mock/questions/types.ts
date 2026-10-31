/** Soal lengkap di sisi "server": dengan kunci jawaban dan pembahasan. */
export type MockQuestion = {
  id: string;
  /** Topik soal, untuk pemeriksaan manual. */
  topik: string;
  text: string;
  /** Selalu 4 opsi. Urutan diacak lagi setiap duel. */
  options: [string, string, string, string];
  /** Indeks opsi yang benar (0-3). */
  answer: number;
  /** Tepat 3 langkah penyelesaian; langkah terakhir memuat jawaban. */
  steps: [string, string, string];
  /**
   * Menghitung ulang jawaban benar dari angka-angka di soal, untuk
   * scripts/verifikasi-soal.mjs. Tidak diisi = jawaban harus dicek manual.
   */
  hitung?: () => number;
};
