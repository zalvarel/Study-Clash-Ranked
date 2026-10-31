import type { MockQuestion } from "./types";

const fpb = (a: number, b: number): number => (b === 0 ? a : fpb(b, a % b));
const kpk = (a: number, b: number) => (a * b) / fpb(a, b);

/** Bank soal SD: operasi hitung, pecahan sederhana, KPK & FPB, keliling & luas, satuan. */
export const SOAL_SD: MockQuestion[] = [
  // ---- Operasi hitung ----
  {
    id: "sd-01",
    topik: "Operasi hitung",
    text: "Hasil dari 125 + 278 − 96 adalah ...",
    options: ["297", "307", "317", "403"],
    answer: 1,
    steps: [
      "Kerjakan dari kiri ke kanan. Jumlahkan dulu: 125 + 278 = 403.",
      "Lalu kurangkan: 403 − 96 = 307.",
      "Jadi hasilnya 307.",
    ],
    hitung: () => 125 + 278 - 96,
  },
  {
    id: "sd-02",
    topik: "Operasi hitung",
    text: "Hasil dari 24 × 15 adalah ...",
    options: ["350", "340", "380", "360"],
    answer: 3,
    steps: [
      "Pecah 15 menjadi 10 + 5.",
      "Hitung: 24 × 10 = 240 dan 24 × 5 = 120.",
      "Jumlahkan: 240 + 120 = 360.",
    ],
    hitung: () => 24 * 15,
  },
  {
    id: "sd-03",
    topik: "Operasi hitung",
    text: "Hasil dari 36 + 12 × 3 adalah ...",
    options: ["144", "72", "48", "84"],
    answer: 1,
    steps: [
      "Perkalian dikerjakan lebih dulu daripada penjumlahan.",
      "Hitung perkaliannya: 12 × 3 = 36.",
      "Lalu jumlahkan: 36 + 36 = 72.",
    ],
    hitung: () => 36 + 12 * 3,
  },
  {
    id: "sd-04",
    topik: "Operasi hitung",
    text: "Hasil dari 864 : 8 adalah ...",
    options: ["108", "18", "180", "118"],
    answer: 0,
    steps: [
      "Pecah 864 menjadi 800 + 64.",
      "Bagi masing-masing: 800 : 8 = 100 dan 64 : 8 = 8.",
      "Jumlahkan: 100 + 8 = 108.",
    ],
    hitung: () => 864 / 8,
  },
  {
    id: "sd-05",
    topik: "Operasi hitung",
    text: "Ibu membeli 3 kg beras seharga Rp12.000 per kg dan membayar dengan Rp50.000. Uang kembaliannya adalah ...",
    options: ["Rp24.000", "Rp36.000", "Rp14.000", "Rp16.000"],
    answer: 2,
    steps: [
      "Hitung harga beras: 3 × 12.000 = 36.000.",
      "Kurangkan dari uang yang dibayar: 50.000 − 36.000 = 14.000.",
      "Jadi uang kembaliannya Rp14.000.",
    ],
    hitung: () => 50000 - 3 * 12000,
  },

  // ---- Pecahan sederhana ----
  {
    id: "sd-06",
    topik: "Pecahan",
    text: "Berapakah hasil dari 3/4 + 1/2 ?",
    options: ["4/6", "5/4", "3/8", "7/4"],
    answer: 1,
    steps: [
      "Samakan penyebutnya. KPK dari 4 dan 2 adalah 4.",
      "Ubah pecahannya: 1/2 = 2/4.",
      "Jumlahkan pembilangnya: 3/4 + 2/4 = 5/4.",
    ],
    hitung: () => 3 / 4 + 1 / 2,
  },
  {
    id: "sd-07",
    topik: "Pecahan",
    text: "Berapakah hasil dari 2/3 − 1/4 ?",
    options: ["1/12", "1/7", "5/12", "7/12"],
    answer: 2,
    steps: [
      "Samakan penyebutnya. KPK dari 3 dan 4 adalah 12.",
      "Ubah pecahannya: 2/3 = 8/12 dan 1/4 = 3/12.",
      "Kurangkan pembilangnya: 8/12 − 3/12 = 5/12.",
    ],
    hitung: () => 2 / 3 - 1 / 4,
  },
  {
    id: "sd-08",
    topik: "Pecahan",
    text: "Berapakah hasil dari 1/3 + 1/6 ?",
    options: ["1/2", "2/9", "2/6", "1/18"],
    answer: 0,
    steps: [
      "Samakan penyebutnya. KPK dari 3 dan 6 adalah 6.",
      "Ubah pecahannya: 1/3 = 2/6.",
      "Jumlahkan lalu sederhanakan: 2/6 + 1/6 = 3/6 = 1/2.",
    ],
    hitung: () => 1 / 3 + 1 / 6,
  },
  {
    id: "sd-09",
    topik: "Pecahan",
    text: "Bentuk paling sederhana dari 12/18 adalah ...",
    options: ["3/4", "2/3", "4/9", "3/6"],
    answer: 1,
    steps: [
      "Cari FPB dari 12 dan 18, yaitu 6.",
      "Bagi pembilang dan penyebutnya dengan 6, yaitu 12 : 6 = 2 dan 18 : 6 = 3.",
      "Jadi bentuk paling sederhananya 2/3.",
    ],
    hitung: () => 12 / 18,
  },
  {
    id: "sd-10",
    topik: "Pecahan",
    text: "Berapakah hasil dari 2/5 × 3/4 ?",
    options: ["5/9", "8/15", "3/10", "6/9"],
    answer: 2,
    steps: [
      "Kalikan pembilang dengan pembilang: 2 × 3 = 6.",
      "Kalikan penyebut dengan penyebut: 5 × 4 = 20.",
      "Sederhanakan: 6/20 = 3/10.",
    ],
    hitung: () => (2 / 5) * (3 / 4),
  },
  {
    id: "sd-11",
    topik: "Pecahan",
    text: "Bentuk desimal dari 3/5 adalah ...",
    options: ["0,35", "3,5", "0,53", "0,6"],
    answer: 3,
    steps: [
      "Kalikan pembilang dan penyebut dengan 2 supaya penyebutnya 10.",
      "Jadi 3/5 = 6/10.",
      "Pecahan per sepuluh ditulis dengan satu angka di belakang koma, jadi 6/10 = 0,6.",
    ],
    hitung: () => 3 / 5,
  },

  // ---- KPK dan FPB ----
  {
    id: "sd-12",
    topik: "KPK dan FPB",
    text: "KPK dari 12 dan 18 adalah ...",
    options: ["6", "36", "72", "216"],
    answer: 1,
    steps: [
      "Tulis kelipatan 12, yaitu 12, 24, 36, 48, ...",
      "Tulis kelipatan 18, yaitu 18, 36, 54, ...",
      "Kelipatan persekutuan terkecilnya adalah 36, jadi KPK-nya 36.",
    ],
    hitung: () => kpk(12, 18),
  },
  {
    id: "sd-13",
    topik: "KPK dan FPB",
    text: "FPB dari 24 dan 36 adalah ...",
    options: ["12", "6", "4", "72"],
    answer: 0,
    steps: [
      "Faktor dari 24 adalah 1, 2, 3, 4, 6, 8, 12, 24.",
      "Faktor dari 36 adalah 1, 2, 3, 4, 6, 9, 12, 18, 36.",
      "Faktor persekutuan terbesarnya adalah 12, jadi FPB-nya 12.",
    ],
    hitung: () => fpb(24, 36),
  },
  {
    id: "sd-14",
    topik: "KPK dan FPB",
    text: "Lampu A menyala setiap 6 menit dan lampu B setiap 8 menit. Jika keduanya baru saja menyala bersamaan, setelah berapa menit keduanya menyala bersamaan lagi?",
    options: ["14 menit", "48 menit", "12 menit", "24 menit"],
    answer: 3,
    steps: [
      "Waktu menyala bersamaan adalah KPK dari 6 dan 8.",
      "Kelipatan 6 adalah 6, 12, 18, 24, ... dan kelipatan 8 adalah 8, 16, 24, ...",
      "KPK-nya 24, jadi keduanya menyala bersamaan lagi setelah 24 menit.",
    ],
    hitung: () => kpk(6, 8),
  },
  {
    id: "sd-15",
    topik: "KPK dan FPB",
    text: "Ada 18 apel dan 24 jeruk yang akan dimasukkan ke kantong sehingga isi setiap kantong sama. Paling banyak berapa kantong yang diperlukan?",
    options: ["3", "6", "4", "12"],
    answer: 1,
    steps: [
      "Banyak kantong terbanyak adalah FPB dari 18 dan 24.",
      "Faktor 18 adalah 1, 2, 3, 6, 9, 18 dan faktor 24 adalah 1, 2, 3, 4, 6, 8, 12, 24.",
      "Faktor persekutuan terbesarnya 6, jadi paling banyak 6 kantong.",
    ],
    hitung: () => fpb(18, 24),
  },

  // ---- Keliling dan luas bangun datar ----
  {
    id: "sd-16",
    topik: "Keliling dan luas",
    text: "Sebuah persegi panjang memiliki panjang 12 cm dan lebar 7 cm. Kelilingnya adalah ...",
    options: ["19 cm", "38 cm", "84 cm", "31 cm"],
    answer: 1,
    steps: [
      "Rumus keliling persegi panjang adalah 2 × (panjang + lebar).",
      "Masukkan ukurannya: 2 × (12 + 7) = 2 × 19.",
      "Jadi kelilingnya 2 × 19 = 38 cm.",
    ],
    hitung: () => 2 * (12 + 7),
  },
  {
    id: "sd-17",
    topik: "Keliling dan luas",
    text: "Sebuah persegi panjang memiliki panjang 15 cm dan lebar 8 cm. Luasnya adalah ...",
    options: ["46 cm²", "23 cm²", "120 cm²", "150 cm²"],
    answer: 2,
    steps: [
      "Rumus luas persegi panjang adalah panjang × lebar.",
      "Masukkan ukurannya: 15 × 8 = 120.",
      "Jadi luasnya 120 cm².",
    ],
    hitung: () => 15 * 8,
  },
  {
    id: "sd-18",
    topik: "Keliling dan luas",
    text: "Sebuah segitiga memiliki alas 10 cm dan tinggi 6 cm. Luasnya adalah ...",
    options: ["30 cm²", "60 cm²", "16 cm²", "32 cm²"],
    answer: 0,
    steps: [
      "Rumus luas segitiga adalah 1/2 × alas × tinggi.",
      "Masukkan ukurannya: 1/2 × 10 × 6 = 30.",
      "Jadi luas segitiga itu 30 cm².",
    ],
    hitung: () => (1 / 2) * 10 * 6,
  },
  {
    id: "sd-19",
    topik: "Keliling dan luas",
    text: "Sebuah persegi memiliki keliling 36 cm. Luasnya adalah ...",
    options: ["36 cm²", "144 cm²", "72 cm²", "81 cm²"],
    answer: 3,
    steps: [
      "Keliling persegi adalah 4 × sisi, jadi sisinya 36 : 4 = 9 cm.",
      "Luas persegi adalah sisi × sisi.",
      "Masukkan ukurannya: 9 × 9 = 81, jadi luasnya 81 cm².",
    ],
    hitung: () => (36 / 4) ** 2,
  },
  {
    id: "sd-20",
    topik: "Keliling dan luas",
    text: "Luas lingkaran dengan jari-jari 7 cm adalah ... (π = 22/7)",
    options: ["44 cm²", "154 cm²", "308 cm²", "616 cm²"],
    answer: 1,
    steps: [
      "Rumus luas lingkaran adalah π × jari-jari × jari-jari.",
      "Pakai π = 22/7 dan jari-jari 7 cm.",
      "Hitung: 22/7 × 7 × 7 = 22 × 7 = 154, jadi luasnya 154 cm².",
    ],
    hitung: () => (22 / 7) * 7 * 7,
  },
  {
    id: "sd-21",
    topik: "Keliling dan luas",
    text: "Keliling lingkaran dengan diameter 14 cm adalah ... (π = 22/7)",
    options: ["88 cm", "22 cm", "44 cm", "154 cm"],
    answer: 2,
    steps: [
      "Rumus keliling lingkaran adalah π × diameter.",
      "Pakai π = 22/7 dan diameter 14 cm.",
      "Hitung: 22/7 × 14 = 44, jadi kelilingnya 44 cm.",
    ],
    hitung: () => (22 / 7) * 14,
  },

  // ---- Satuan ----
  {
    id: "sd-22",
    topik: "Satuan",
    text: "2,5 kg sama dengan ... gram",
    options: ["250 gram", "25 gram", "2.500 gram", "25.000 gram"],
    answer: 2,
    steps: [
      "Ingat bahwa 1 kg = 1.000 gram.",
      "Kalikan dengan 1.000, yaitu 2,5 × 1.000 = 2.500.",
      "Jadi 2,5 kg sama dengan 2.500 gram.",
    ],
    hitung: () => 2.5 * 1000,
  },
  {
    id: "sd-23",
    topik: "Satuan",
    text: "3 jam 15 menit sama dengan ... menit",
    options: ["315 menit", "195 menit", "165 menit", "180 menit"],
    answer: 1,
    steps: [
      "Ingat bahwa 1 jam = 60 menit.",
      "Ubah jamnya ke menit: 3 × 60 = 180.",
      "Tambahkan sisa menitnya: 180 + 15 = 195, jadi 195 menit.",
    ],
    hitung: () => 3 * 60 + 15,
  },
  {
    id: "sd-24",
    topik: "Satuan",
    text: "4,5 m sama dengan ... cm",
    options: ["450 cm", "45 cm", "4.500 cm", "405 cm"],
    answer: 0,
    steps: [
      "Ingat bahwa 1 m = 100 cm.",
      "Kalikan dengan 100, yaitu 4,5 × 100 = 450.",
      "Jadi 4,5 m sama dengan 450 cm.",
    ],
    hitung: () => 4.5 * 100,
  },
];
