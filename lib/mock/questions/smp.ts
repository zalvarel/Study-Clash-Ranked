import type { MockQuestion } from "./types";

function modus(data: number[]) {
  const hitungan = new Map<number, number>();
  for (const d of data) hitungan.set(d, (hitungan.get(d) ?? 0) + 1);
  return [...hitungan.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function median(data: number[]) {
  const s = [...data].sort((a, b) => a - b);
  const m = s.length / 2;
  return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2;
}

/** Bank soal SMP: persamaan & pertidaksamaan linear, perbandingan, Pythagoras, bangun ruang, statistika. */
export const SOAL_SMP: MockQuestion[] = [
  // ---- Persamaan dan pertidaksamaan linear ----
  {
    id: "smp-01",
    topik: "Persamaan linear",
    text: "Nilai x yang memenuhi 3x + 7 = 22 adalah ...",
    options: ["3", "5", "7", "15"],
    answer: 1,
    steps: [
      "Kurangkan kedua ruas dengan 7, sehingga 3x = 22 − 7 = 15.",
      "Bagi kedua ruas dengan 3, sehingga x = 15 : 3.",
      "Jadi x = 5.",
    ],
    hitung: () => (22 - 7) / 3,
  },
  {
    id: "smp-02",
    topik: "Persamaan linear",
    text: "Nilai x yang memenuhi 5x − 4 = 2x + 14 adalah ...",
    options: ["6", "2", "10/3", "18"],
    answer: 0,
    steps: [
      "Pindahkan suku x ke ruas kiri, sehingga 5x − 2x = 3x.",
      "Pindahkan konstanta ke ruas kanan, sehingga 3x = 14 + 4 = 18.",
      "Bagi dengan 3, sehingga x = 18 : 3 = 6.",
    ],
    hitung: () => (14 + 4) / (5 - 2),
  },
  {
    id: "smp-03",
    topik: "Pertidaksamaan linear",
    text: "Penyelesaian dari 2x − 5 > 7 adalah ...",
    options: ["x < 6", "x > 1", "x > 6", "x > 12"],
    answer: 2,
    steps: [
      "Tambahkan 5 pada kedua ruas: 2x > 12, karena 7 + 5 = 12.",
      "Bagi kedua ruas dengan 2. Pembaginya positif, jadi tanda tidak berubah: x > 6.",
      "Jadi penyelesaiannya x > 6.",
    ],
  },
  {
    id: "smp-04",
    topik: "Pertidaksamaan linear",
    text: "Bilangan bulat terkecil yang memenuhi 3x + 4 > 19 adalah ...",
    options: ["5", "15", "7", "6"],
    answer: 3,
    steps: [
      "Kurangkan 4 pada kedua ruas: 3x > 15, karena 19 − 4 = 15.",
      "Bagi dengan 3, sehingga x > 5.",
      "Nilai x harus lebih dari 5, jadi bilangan bulat terkecilnya 6.",
    ],
    hitung: () => Math.floor((19 - 4) / 3) + 1,
  },
  {
    id: "smp-05",
    topik: "Persamaan linear",
    text: "Jumlah dua bilangan cacah berurutan adalah 45. Bilangan yang lebih besar adalah ...",
    options: ["22", "23", "24", "21"],
    answer: 1,
    steps: [
      "Misalkan bilangannya n dan n + 1, sehingga 2n + 1 = 45.",
      "Maka 2n = 44, sehingga n = 22.",
      "Bilangan yang lebih besar adalah n + 1 = 23.",
    ],
    hitung: () => (45 - 1) / 2 + 1,
  },

  // ---- Perbandingan ----
  {
    id: "smp-06",
    topik: "Perbandingan",
    text: "Perbandingan uang Ani dan Budi adalah 3 : 5. Jika jumlah uang mereka Rp64.000, uang Budi adalah ...",
    options: ["Rp24.000", "Rp40.000", "Rp38.400", "Rp32.000"],
    answer: 1,
    steps: [
      "Jumlah bagian perbandingannya 3 + 5 = 8.",
      "Satu bagian bernilai 64.000 : 8 = 8.000.",
      "Uang Budi 5 bagian, yaitu 5 × 8.000 = 40.000, jadi Rp40.000.",
    ],
    hitung: () => (5 / (3 + 5)) * 64000,
  },
  {
    id: "smp-07",
    topik: "Perbandingan",
    text: "Untuk membuat 4 kue diperlukan 300 gram tepung. Untuk membuat 10 kue diperlukan tepung sebanyak ...",
    options: ["750 gram", "1.200 gram", "600 gram", "3.000 gram"],
    answer: 0,
    steps: [
      "Ini perbandingan senilai: makin banyak kue, makin banyak tepung.",
      "Tepung untuk 1 kue adalah 300 : 4 = 75 gram.",
      "Untuk 10 kue: 10 × 75 = 750, jadi 750 gram.",
    ],
    hitung: () => (300 / 4) * 10,
  },
  {
    id: "smp-08",
    topik: "Perbandingan",
    text: "Sebuah pekerjaan selesai dalam 12 hari oleh 6 pekerja. Jika dikerjakan oleh 9 pekerja, pekerjaan itu selesai dalam ...",
    options: ["18 hari", "10 hari", "8 hari", "9 hari"],
    answer: 2,
    steps: [
      "Ini perbandingan berbalik nilai: makin banyak pekerja, makin cepat selesai.",
      "Total pekerjaan = 6 × 12 = 72 hari kerja.",
      "Dengan 9 pekerja: 72 : 9 = 8, jadi selesai dalam 8 hari.",
    ],
    hitung: () => (6 * 12) / 9,
  },
  {
    id: "smp-09",
    topik: "Perbandingan",
    text: "Jarak dua kota pada peta 5 cm dengan skala 1 : 400.000. Jarak sebenarnya adalah ...",
    options: ["2 km", "200 km", "8 km", "20 km"],
    answer: 3,
    steps: [
      "Jarak sebenarnya = 5 × 400.000 = 2.000.000 cm.",
      "Ingat bahwa 1 km = 100.000 cm.",
      "Jadi 2.000.000 : 100.000 = 20, yaitu 20 km.",
    ],
    hitung: () => (5 * 400000) / 100000,
  },

  // ---- Pythagoras ----
  {
    id: "smp-10",
    topik: "Pythagoras",
    text: "Sebuah segitiga siku-siku memiliki sisi tegak 6 cm dan 8 cm. Panjang sisi miringnya adalah ...",
    options: ["14 cm", "10 cm", "12 cm", "48 cm"],
    answer: 1,
    steps: [
      "Pakai teorema Pythagoras: c² = a² + b².",
      "Masukkan angkanya: 6² + 8² = 36 + 64 = 100.",
      "Jadi c = √100 = 10 cm.",
    ],
    hitung: () => Math.sqrt(6 ** 2 + 8 ** 2),
  },
  {
    id: "smp-11",
    topik: "Pythagoras",
    text: "Tangga sepanjang 13 m bersandar di dinding. Jarak kaki tangga ke dinding 5 m. Tinggi ujung tangga dari tanah adalah ...",
    options: ["8 m", "18 m", "12 m", "√194 m"],
    answer: 2,
    steps: [
      "Tangga adalah sisi miring, jadi t² = 13² − 5².",
      "Hitung: 13² − 5² = 169 − 25 = 144.",
      "Jadi t = √144 = 12 m.",
    ],
    hitung: () => Math.sqrt(13 ** 2 - 5 ** 2),
  },
  {
    id: "smp-12",
    topik: "Pythagoras",
    text: "Manakah yang merupakan tripel Pythagoras?",
    options: ["4, 5, 6", "6, 8, 12", "7, 9, 11", "5, 12, 13"],
    answer: 3,
    steps: [
      "Cek apakah kuadrat bilangan terbesar sama dengan jumlah kuadrat dua bilangan lainnya.",
      "Untuk 5, 12, dan 13 diperoleh 5² + 12² = 25 + 144 = 169.",
      "Karena 13² = 169, maka 5, 12, 13 adalah tripel Pythagoras.",
    ],
  },

  // ---- Bangun ruang ----
  {
    id: "smp-13",
    topik: "Bangun ruang",
    text: "Volume kubus dengan panjang rusuk 6 cm adalah ...",
    options: ["36 cm³", "216 cm³", "72 cm³", "144 cm³"],
    answer: 1,
    steps: [
      "Rumus volume kubus adalah rusuk × rusuk × rusuk.",
      "Masukkan rusuknya: 6 × 6 × 6 = 216.",
      "Jadi volumenya 216 cm³.",
    ],
    hitung: () => 6 ** 3,
  },
  {
    id: "smp-14",
    topik: "Bangun ruang",
    text: "Sebuah balok berukuran 10 cm × 6 cm × 4 cm. Volumenya adalah ...",
    options: ["20 cm³", "248 cm³", "240 cm³", "120 cm³"],
    answer: 2,
    steps: [
      "Rumus volume balok adalah panjang × lebar × tinggi.",
      "Masukkan ukurannya: 10 × 6 × 4 = 240.",
      "Jadi volumenya 240 cm³.",
    ],
    hitung: () => 10 * 6 * 4,
  },
  {
    id: "smp-15",
    topik: "Bangun ruang",
    text: "Luas permukaan kubus dengan panjang rusuk 5 cm adalah ...",
    options: ["150 cm²", "125 cm²", "100 cm²", "25 cm²"],
    answer: 0,
    steps: [
      "Kubus punya 6 sisi berbentuk persegi yang sama.",
      "Luas satu sisi = 5 × 5 = 25.",
      "Luas permukaan = 6 × 25 = 150, jadi 150 cm².",
    ],
    hitung: () => 6 * 5 * 5,
  },
  {
    id: "smp-16",
    topik: "Bangun ruang",
    text: "Volume tabung dengan jari-jari alas 7 cm dan tinggi 10 cm adalah ... (π = 22/7)",
    options: ["440 cm³", "1.540 cm³", "154 cm³", "3.080 cm³"],
    answer: 1,
    steps: [
      "Volume tabung adalah luas alas × tinggi, dengan alas berbentuk lingkaran.",
      "Luas alasnya 22/7 × 7 × 7 = 154.",
      "Volume = 154 × 10 = 1.540, jadi 1.540 cm³.",
    ],
    hitung: () => (22 / 7) * 7 * 7 * 10,
  },
  {
    id: "smp-17",
    topik: "Bangun ruang",
    text: "Volume kerucut dengan jari-jari alas 3 cm dan tinggi 7 cm adalah ... (π = 22/7)",
    options: ["198 cm³", "22 cm³", "132 cm³", "66 cm³"],
    answer: 3,
    steps: [
      "Rumus volume kerucut adalah 1/3 × luas alas × tinggi.",
      "Luas alasnya 22/7 × 3 × 3 = 198/7.",
      "Hitung: 1/3 × 198/7 × 7 = 66, jadi volumenya 66 cm³.",
    ],
    hitung: () => (1 / 3) * (22 / 7) * 3 * 3 * 7,
  },

  // ---- Statistika dasar ----
  {
    id: "smp-18",
    topik: "Statistika",
    text: "Rata-rata dari data 7, 8, 6, 9, 10 adalah ...",
    options: ["7", "8", "9", "40"],
    answer: 1,
    steps: [
      "Jumlahkan semua data: 7 + 8 + 6 + 9 + 10 = 40.",
      "Banyak datanya ada 5.",
      "Rata-rata = 40 : 5 = 8.",
    ],
    hitung: () => (7 + 8 + 6 + 9 + 10) / 5,
  },
  {
    id: "smp-19",
    topik: "Statistika",
    text: "Median dari data 5, 9, 3, 7, 6, 8 adalah ...",
    options: ["6", "7", "6,5", "7,5"],
    answer: 2,
    steps: [
      "Urutkan datanya: 3, 5, 6, 7, 8, 9.",
      "Banyak datanya genap (6), jadi median adalah rata-rata data ke-3 dan ke-4.",
      "Median = (6 + 7) : 2 = 6,5.",
    ],
    hitung: () => median([5, 9, 3, 7, 6, 8]),
  },
  {
    id: "smp-20",
    topik: "Statistika",
    text: "Modus dari data 4, 6, 6, 7, 8, 8, 8, 9 adalah ...",
    options: ["8", "6", "7", "9"],
    answer: 0,
    steps: [
      "Hitung berapa kali setiap nilai muncul.",
      "Nilai 6 muncul 2 kali, nilai 8 muncul 3 kali, nilai lainnya 1 kali.",
      "Nilai yang paling sering muncul adalah 8, jadi modusnya 8.",
    ],
    hitung: () => modus([4, 6, 6, 7, 8, 8, 8, 9]),
  },
  {
    id: "smp-21",
    topik: "Statistika",
    text: "Rata-rata nilai 4 siswa adalah 75. Setelah 1 siswa baru ikut, rata-ratanya menjadi 78. Nilai siswa baru itu adalah ...",
    options: ["81", "87", "90", "78"],
    answer: 2,
    steps: [
      "Jumlah nilai 4 siswa = 4 × 75 = 300.",
      "Jumlah nilai 5 siswa = 5 × 78 = 390.",
      "Nilai siswa baru = 390 − 300 = 90.",
    ],
    hitung: () => 5 * 78 - 4 * 75,
  },
  {
    id: "smp-22",
    topik: "Statistika",
    text: "Jangkauan dari data 12, 15, 9, 20, 14 adalah ...",
    options: ["20", "11", "9", "6"],
    answer: 1,
    steps: [
      "Cari nilai terbesar, yaitu 20.",
      "Cari nilai terkecil, yaitu 9.",
      "Jangkauan = 20 − 9 = 11.",
    ],
    hitung: () => Math.max(12, 15, 9, 20, 14) - Math.min(12, 15, 9, 20, 14),
  },
];
