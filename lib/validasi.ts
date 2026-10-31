/** Validasi isian profil. Mengembalikan pesan galat (Bahasa Indonesia) atau null kalau valid. */

const jumlahHuruf = (teks: string) => teks.match(/\p{L}/gu)?.length ?? 0;

export const NAMA_MIN_HURUF = 2;
export const NAMA_MAKS = 20;

export function validateNickname(raw: string): string | null {
  const name = raw.trim();
  if (!name) return "Isi nama panggilanmu dulu.";
  if (jumlahHuruf(name) < NAMA_MIN_HURUF) return `Nama panggilan minimal ${NAMA_MIN_HURUF} huruf.`;
  if (name.length > NAMA_MAKS) return `Nama panggilan maksimal ${NAMA_MAKS} karakter.`;
  return null;
}

export const SEKOLAH_MIN_HURUF = 3;
export const SEKOLAH_MAKS = 60;

/** Untuk isian "Sekolah lain". */
export function validateNamaSekolah(raw: string): string | null {
  const nama = raw.trim();
  if (!nama) return "Tulis nama sekolahmu.";
  if (jumlahHuruf(nama) < SEKOLAH_MIN_HURUF) return `Nama sekolah minimal ${SEKOLAH_MIN_HURUF} huruf.`;
  if (nama.length > SEKOLAH_MAKS) return `Nama sekolah maksimal ${SEKOLAH_MAKS} karakter.`;
  return null;
}
