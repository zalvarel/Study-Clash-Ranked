import type { MockQuestion } from "./types";

const derajat = (d: number) => (d * Math.PI) / 180;
const kombinasi = (n: number, r: number) => {
  let hasil = 1;
  for (let i = 0; i < r; i++) hasil = (hasil * (n - i)) / (i + 1);
  return hasil;
};

/** Bank soal SMA/SMK: eksponen & logaritma, fungsi kuadrat, trigonometri, barisan & deret, peluang, limit & turunan. */
export const SOAL_SMA: MockQuestion[] = [
  // ---- Eksponen dan logaritma ----
  {
    id: "sma-01",
    topik: "Eksponen",
    text: "Hasil dari 2³ × 2⁴ adalah ...",
    options: ["2⁷", "2¹²", "4⁷", "2¹"],
    answer: 0,
    steps: [
      "Pada perkalian bilangan berpangkat dengan basis sama, pangkatnya dijumlahkan.",
      "Jumlahkan pangkatnya: 3 + 4 = 7.",
      "Jadi 2³ × 2⁴ = 2⁷.",
    ],
    hitung: () => 2 ** 3 * 2 ** 4,
  },
  {
    id: "sma-02",
    topik: "Eksponen",
    text: "Hasil dari (3²)³ : 3⁴ adalah ...",
    options: ["3", "9", "27", "81"],
    answer: 1,
    steps: [
      "Pangkat dari pangkat dikalikan: (3²)³ = 3⁶.",
      "Pada pembagian dengan basis sama, pangkatnya dikurangkan: 3⁶ : 3⁴ = 3².",
      "Jadi hasilnya 3² = 9.",
    ],
    hitung: () => (3 ** 2) ** 3 / 3 ** 4,
  },
  {
    id: "sma-03",
    topik: "Eksponen",
    text: "Nilai dari 2⁻³ adalah ...",
    options: ["−8", "−6", "1/8", "1/6"],
    answer: 2,
    steps: [
      "Pangkat negatif berarti kebalikan dari pangkat positifnya.",
      "Jadi 2⁻³ = 1/2³.",
      "Karena 2³ = 8, hasilnya 1/8.",
    ],
    hitung: () => 2 ** -3,
  },
  {
    id: "sma-04",
    topik: "Logaritma",
    text: "Nilai dari ²log 32 adalah ...",
    options: ["4", "16", "6", "5"],
    answer: 3,
    steps: [
      "Mencari ²log 32 berarti mencari pangkat dari 2 yang hasilnya 32.",
      "Karena 2 × 2 × 2 × 2 × 2 = 32, maka 2⁵ = 32.",
      "Jadi ²log 32 = 5.",
    ],
    hitung: () => Math.log2(32),
  },
  {
    id: "sma-05",
    topik: "Logaritma",
    text: "Nilai dari log 4 + log 25 adalah ...",
    options: ["1", "2", "10", "29"],
    answer: 1,
    steps: [
      "Gunakan sifat log a + log b = log (a × b).",
      "Maka log 4 + log 25 = log (4 × 25) = log 100.",
      "Karena 10² = 100, maka log 100 = 2.",
    ],
    hitung: () => Math.log10(4) + Math.log10(25),
  },
  {
    id: "sma-06",
    topik: "Eksponen",
    text: "Nilai x yang memenuhi 3ˣ⁺¹ = 81 adalah ...",
    options: ["2", "4", "3", "27"],
    answer: 2,
    steps: [
      "Tulis 81 sebagai pangkat dari 3, yaitu 81 = 3⁴.",
      "Jadi 3ˣ⁺¹ = 3⁴, sehingga x + 1 = 4.",
      "Maka x = 4 − 1 = 3.",
    ],
    hitung: () => Math.round(Math.log(81) / Math.log(3)) - 1,
  },

  // ---- Fungsi kuadrat ----
  {
    id: "sma-07",
    topik: "Fungsi kuadrat",
    text: "Nilai minimum fungsi f(x) = x² − 6x + 5 adalah ...",
    options: ["−4", "4", "5", "−9"],
    answer: 0,
    steps: [
      "Sumbu simetrinya x = −b/(2a) = 6/2 = 3.",
      "Nilai minimum dicapai di x = 3, yaitu f(3) = 3² − 6 × 3 + 5.",
      "Hitung: f(3) = 9 − 18 + 5 = −4, jadi nilai minimumnya −4.",
    ],
    hitung: () => {
      const [a, b, c] = [1, -6, 5];
      const x = -b / (2 * a);
      return a * x * x + b * x + c;
    },
  },
  {
    id: "sma-08",
    topik: "Fungsi kuadrat",
    text: "Jumlah akar-akar persamaan x² − 7x + 10 = 0 adalah ...",
    options: ["−7", "10", "7", "3"],
    answer: 2,
    steps: [
      "Faktorkan: x² − 7x + 10 = (x − 2)(x − 5).",
      "Akar-akarnya x = 2 dan x = 5.",
      "Jumlahnya 2 + 5 = 7.",
    ],
    hitung: () => {
      const [a, b, c] = [1, -7, 10];
      const d = Math.sqrt(b * b - 4 * a * c);
      return (-b + d) / (2 * a) + (-b - d) / (2 * a);
    },
  },
  {
    id: "sma-09",
    topik: "Fungsi kuadrat",
    text: "Diskriminan dari persamaan 2x² + 3x − 5 = 0 adalah ...",
    options: ["−31", "31", "9", "49"],
    answer: 3,
    steps: [
      "Rumus diskriminan adalah D = b² − 4ac.",
      "Di sini a = 2, b = 3, dan c = −5.",
      "D = 3² − 4 × 2 × (−5) = 9 + 40 = 49.",
    ],
    hitung: () => 3 ** 2 - 4 * 2 * -5,
  },
  {
    id: "sma-10",
    topik: "Fungsi kuadrat",
    text: "Jika f(x) = 2x² − 3x + 1, nilai f(−2) adalah ...",
    options: ["3", "15", "−1", "11"],
    answer: 1,
    steps: [
      "Substitusikan x = −2 ke dalam f(x).",
      "Hitung tiap suku: 2 × (−2)² = 8 dan −3 × (−2) = 6.",
      "Jumlahkan: 8 + 6 + 1 = 15.",
    ],
    hitung: () => 2 * (-2) ** 2 - 3 * -2 + 1,
  },

  // ---- Trigonometri dasar ----
  {
    id: "sma-11",
    topik: "Trigonometri",
    text: "Nilai sin 30° adalah ...",
    options: ["1/2", "√3/2", "√2/2", "1"],
    answer: 0,
    steps: [
      "Gunakan segitiga siku-siku istimewa dengan sudut 30°, 60°, dan 90°.",
      "Perbandingan sisinya 1 : √3 : 2 (sisi depan sudut 30°, sisi samping, sisi miring).",
      "sin 30° = depan/miring = 1/2.",
    ],
    hitung: () => Math.sin(derajat(30)),
  },
  {
    id: "sma-12",
    topik: "Trigonometri",
    text: "Pada segitiga siku-siku, sisi di depan sudut A panjangnya 3 dan sisi miringnya 5. Nilai cos A adalah ...",
    options: ["3/5", "3/4", "4/5", "5/4"],
    answer: 2,
    steps: [
      "Cari sisi samping dengan Pythagoras: √(5² − 3²) = √16 = 4.",
      "cos A = samping/miring.",
      "Jadi cos A = 4/5.",
    ],
    hitung: () => Math.sqrt(5 ** 2 - 3 ** 2) / 5,
  },
  {
    id: "sma-13",
    topik: "Trigonometri",
    text: "Nilai dari sin² 40° + cos² 40° adalah ...",
    options: ["0", "2", "40", "1"],
    answer: 3,
    steps: [
      "Gunakan identitas sin² x + cos² x = 1.",
      "Identitas ini berlaku untuk semua sudut x, termasuk 40°.",
      "Jadi sin² 40° + cos² 40° = 1.",
    ],
    hitung: () => Math.sin(derajat(40)) ** 2 + Math.cos(derajat(40)) ** 2,
  },
  {
    id: "sma-14",
    topik: "Trigonometri",
    text: "Nilai dari tan 45° + cos 60° adalah ...",
    options: ["1/2", "3/2", "√3", "2"],
    answer: 1,
    steps: [
      "Nilai tan 45° adalah 1.",
      "Nilai cos 60° adalah 1/2.",
      "Jumlahkan: 1 + 1/2 = 3/2.",
    ],
    hitung: () => Math.tan(derajat(45)) + Math.cos(derajat(60)),
  },

  // ---- Barisan dan deret ----
  {
    id: "sma-15",
    topik: "Barisan aritmetika",
    text: "Suku ke-10 dari barisan 3, 7, 11, 15, ... adalah ...",
    options: ["43", "39", "40", "35"],
    answer: 1,
    steps: [
      "Suku pertama a = 3 dan beda b = 7 − 3 = 4.",
      "Rumus suku ke-n adalah Uₙ = a + (n − 1)b.",
      "U₁₀ = 3 + 9 × 4 = 39.",
    ],
    hitung: () => 3 + (10 - 1) * (7 - 3),
  },
  {
    id: "sma-16",
    topik: "Deret aritmetika",
    text: "Jumlah 20 suku pertama deret 2 + 5 + 8 + ... adalah ...",
    options: ["590", "1.220", "61", "610"],
    answer: 3,
    steps: [
      "Di sini a = 2, b = 3, dan n = 20.",
      "Rumus jumlah n suku pertama adalah Sₙ = n/2 × (2a + (n − 1)b).",
      "S₂₀ = 10 × (4 + 57) = 10 × 61 = 610.",
    ],
    hitung: () => (20 / 2) * (2 * 2 + (20 - 1) * 3),
  },
  {
    id: "sma-17",
    topik: "Barisan geometri",
    text: "Suku ke-6 dari barisan 2, 6, 18, 54, ... adalah ...",
    options: ["162", "1.458", "486", "324"],
    answer: 2,
    steps: [
      "Suku pertama a = 2 dan rasio r = 6 : 2 = 3.",
      "Rumus suku ke-n adalah Uₙ = a × rⁿ⁻¹.",
      "U₆ = 2 × 3⁵ = 2 × 243 = 486.",
    ],
    hitung: () => 2 * 3 ** (6 - 1),
  },
  {
    id: "sma-18",
    topik: "Deret geometri",
    text: "Jumlah deret tak hingga 8 + 4 + 2 + 1 + ... adalah ...",
    options: ["16", "15", "24", "32"],
    answer: 0,
    steps: [
      "Suku pertama a = 8 dan rasio r = 4 : 8 = 1/2.",
      "Karena rasionya di antara −1 dan 1, deretnya konvergen dengan S∞ = a/(1 − r).",
      "S∞ = 8/(1 − 1/2) = 8/(1/2) = 16.",
    ],
    hitung: () => 8 / (1 - 4 / 8),
  },

  // ---- Peluang ----
  {
    id: "sma-19",
    topik: "Peluang",
    text: "Dua dadu dilempar bersamaan. Peluang muncul jumlah mata dadu 7 adalah ...",
    options: ["1/12", "1/6", "7/36", "1/36"],
    answer: 1,
    steps: [
      "Banyak semua kemungkinan = 6 × 6 = 36.",
      "Pasangan yang berjumlah 7 ada 6, yaitu (1,6), (2,5), (3,4), (4,3), (5,2), (6,1).",
      "Peluangnya 6/36 = 1/6.",
    ],
    hitung: () => {
      let cocok = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === 7) cocok++;
      return cocok / 36;
    },
  },
  {
    id: "sma-20",
    topik: "Peluang",
    text: "Sebuah kantong berisi 5 bola merah dan 3 bola biru. Diambil 2 bola sekaligus. Peluang keduanya merah adalah ...",
    options: ["25/64", "5/8", "10/56", "5/14"],
    answer: 3,
    steps: [
      "Banyak cara mengambil 2 dari 8 bola: C(8,2) = 8 × 7 : 2 = 28.",
      "Banyak cara mengambil 2 bola merah: C(5,2) = 5 × 4 : 2 = 10.",
      "Peluangnya 10/28 = 5/14.",
    ],
    hitung: () => kombinasi(5, 2) / kombinasi(8, 2),
  },
  {
    id: "sma-21",
    topik: "Peluang",
    text: "Peluang besok hujan adalah 0,35. Peluang besok tidak hujan adalah ...",
    options: ["0,65", "0,35", "0,75", "1,35"],
    answer: 0,
    steps: [
      "Kejadian tidak hujan adalah komplemen dari kejadian hujan.",
      "Peluang komplemen adalah 1 dikurangi peluang kejadiannya.",
      "Jadi peluangnya 1 − 0,35 = 0,65.",
    ],
    hitung: () => 1 - 0.35,
  },

  // ---- Limit dan turunan dasar ----
  {
    id: "sma-22",
    topik: "Limit",
    text: "Nilai dari lim x→2 (x² − 4)/(x − 2) adalah ...",
    options: ["0", "2", "4", "8"],
    answer: 2,
    steps: [
      "Substitusi langsung menghasilkan 0/0, jadi faktorkan dulu.",
      "x² − 4 = (x − 2)(x + 2), sehingga bentuknya menjadi x + 2.",
      "Substitusikan x = 2, yaitu 2 + 2 = 4.",
    ],
    hitung: () => {
      const x = 2;
      return x + 2;
    },
  },
  {
    id: "sma-23",
    topik: "Turunan",
    text: "Jika f(x) = 3x² − 4x + 7, nilai f′(2) adalah ...",
    options: ["15", "8", "12", "4"],
    answer: 1,
    steps: [
      "Turunkan tiap suku: turunan 3x² adalah 6x, turunan −4x adalah −4, dan turunan 7 adalah 0.",
      "Jadi f′(x) = 6x − 4.",
      "Masukkan x = 2, sehingga f′(2) = 6 × 2 − 4 = 8.",
    ],
    hitung: () => 6 * 2 - 4,
  },
  {
    id: "sma-24",
    topik: "Turunan",
    text: "Gradien garis singgung kurva y = x³ − 2x di titik x = 1 adalah ...",
    options: ["−1", "3", "1", "5"],
    answer: 2,
    steps: [
      "Gradien garis singgung sama dengan nilai turunan di titik itu.",
      "Turunannya y′ = 3x² − 2.",
      "Di x = 1, gradiennya 3 × 1² − 2 = 1.",
    ],
    hitung: () => 3 * 1 ** 2 - 2,
  },
];
