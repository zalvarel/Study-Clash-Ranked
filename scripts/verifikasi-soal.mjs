#!/usr/bin/env node
/**
 * Verifikasi bank soal mock (lib/mock/questions/*.ts).
 *
 * Jalankan: npm run verifikasi:soal   (butuh Node >= 23, yang bisa menjalankan .ts langsung)
 *
 * Yang dicek untuk setiap soal:
 *  1. Struktur: id unik, 4 opsi berbeda, indeks jawaban 0-3, tepat 3 langkah.
 *  2. Jawaban: kalau soal punya `hitung()`, hasilnya dihitung ulang lalu
 *     dicocokkan dengan nilai setiap opsi. Tepat satu opsi harus sama, dan
 *     itu harus opsi yang ditandai benar.
 *  3. Langkah pembahasan: setiap persamaan aritmetika di teks langkah
 *     (mis. "8/12 − 3/12 = 5/12") dihitung ulang; semua ruasnya harus sama.
 *     Persamaan yang memuat variabel (mis. "2x + 3 = 11") dilewati.
 *  4. Langkah terakhir harus memuat teks jawaban yang benar.
 *
 * Soal tanpa `hitung()` atau dengan opsi yang tidak bisa dibaca sebagai
 * angka dilaporkan sebagai "perlu cek manual".
 * Keluar dengan kode 1 kalau ada kesalahan.
 */
import { SOAL_SD } from "../lib/mock/questions/sd.ts";
import { SOAL_SMP } from "../lib/mock/questions/smp.ts";
import { SOAL_SMA } from "../lib/mock/questions/sma.ts";

const BANK = { SD: SOAL_SD, SMP: SOAL_SMP, SMA: SOAL_SMA };
const MIN_SOAL = 20;

// ---------- Evaluator ekspresi aritmetika ----------

const SUPERSKRIP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };

/** Ubah teks angka gaya Indonesia menjadi ekspresi standar. */
function normalisasiEkspresi(teks) {
  let s = teks.trim();
  // Pemisah ribuan: 2.000.000 -> 2000000
  let sebelum;
  do {
    sebelum = s;
    s = s.replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2");
  } while (s !== sebelum);
  s = s.replace(/(\d),(\d)/g, "$1.$2"); // koma desimal
  s = s.replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/[:÷]/g, "/");
  s = s.replace(/%/g, "/100");
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => "^(" + [...m].map((c) => SUPERSKRIP[c]).join("") + ")");
  return s;
}

function hitungEkspresi(teks) {
  const s = normalisasiEkspresi(teks);
  const token = s.match(/\d+(?:\.\d+)?|[-+*/^()√]|\S/g) ?? [];
  let i = 0;
  const lihat = () => token[i];
  const ambil = () => token[i++];

  function ekspresi() {
    let v = suku();
    while (lihat() === "+" || lihat() === "-") v = ambil() === "+" ? v + suku() : v - suku();
    return v;
  }
  function suku() {
    let v = unari();
    for (;;) {
      const t = lihat();
      if (t === "*") {
        ambil();
        v *= unari();
      } else if (t === "/") {
        ambil();
        v /= unari();
      } else if (t !== undefined && (/^\d/.test(t) || t === "(" || t === "√")) v *= unari(); // perkalian tersirat, mis. 2√3
      else return v;
    }
  }
  function unari() {
    if (lihat() === "-") return (ambil(), -unari());
    if (lihat() === "+") return (ambil(), unari());
    return pangkat();
  }
  function pangkat() {
    const dasar = atom();
    if (lihat() === "^") return (ambil(), dasar ** unari());
    return dasar;
  }
  function atom() {
    const t = ambil();
    if (t === undefined) throw new Error("ekspresi terpotong");
    if (/^\d/.test(t)) return Number(t);
    if (t === "√") return Math.sqrt(pangkat());
    if (t === "(") {
      const v = ekspresi();
      if (ambil() !== ")") throw new Error("kurung tidak seimbang");
      return v;
    }
    throw new Error(`token tak dikenal "${t}"`);
  }

  try {
    if (token.length === 0) return NaN;
    const v = ekspresi();
    return i === token.length ? v : NaN;
  } catch {
    return NaN;
  }
}

const SATUAN = /\s*(cm²|cm³|m²|m³|cm|mm|km|m|kg|gram|g|liter|ml|menit|jam|detik|hari|°)$/;

/** Nilai angka dari teks opsi, atau NaN kalau tidak bisa dibaca. */
function nilaiOpsi(teks) {
  let s = teks.trim().replace(/^Rp\s*/, "").replace(/^[a-zA-Z]\s*=\s*/, "");
  s = s.replace(SATUAN, "");
  if (/[a-zA-Z<>,]/.test(s.replace(/(\d),(\d)/g, "$1$2"))) return NaN;
  return hitungEkspresi(s);
}

const sama = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

// ---------- Pemeriksa persamaan di langkah pembahasan ----------

// Karakter yang dianggap bagian dari ekspresi aritmetika.
const RUN = /[0-9 +\-−×·:÷/().,^%√=⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g;
// Karakter "mirip huruf": bila menempel pada angka, angkanya bagian dari variabel/fungsi.
const MIRIP_HURUF = /[A-Za-zÀ-ÿπ′'ₙ₀-₉ˣ⁺∞°]/;
const FUNGSI = /^(sin|cos|tan|log|ln|lim)$/;

/** Kembalikan daftar { teks, ok, ruas } untuk setiap persamaan yang bisa dicek. */
function cekPersamaan(langkah) {
  // Titik dua setelah huruf adalah tanda baca, bukan pembagian. Koma+spasi memisahkan daftar.
  const teks = langkah.replace(/([A-Za-z])\s*:(?=\s)/g, "$1 |").replace(/,\s/g, " | ").replace(/;\s/g, " | ");
  const hasil = [];
  for (const m of teks.matchAll(RUN)) {
    const run = m[0];
    if (!run.includes("=")) continue;
    const awal = m.index;
    const akhir = awal + run.length;
    const charSebelum = teks[awal - 1] ?? "";
    const charSesudah = teks[akhir] ?? "";

    let ruas = run.split("=").map((r) => r.trim());
    ruas[ruas.length - 1] = ruas[ruas.length - 1].replace(/[.,]+$/, "");

    // Ruas pertama dibuang kalau menempel pada variabel/fungsi (mis. "f(3) = ...", "sin 30 = ...").
    const kataSebelum = teks.slice(0, awal).match(/([A-Za-zπ′'ₙ₀-₉ˣ⁺∞°]+)\s*$/)?.[1] ?? "";
    const menempel = !/^\s/.test(run) && MIRIP_HURUF.test(charSebelum);
    const variabel =
      /^\s/.test(run) && kataSebelum && (kataSebelum.length === 1 || FUNGSI.test(kataSebelum) || /[ₙ₀-₉′'°]$/.test(kataSebelum));
    if (menempel || variabel || ruas[0] === "") ruas = ruas.slice(1);
    // Ruas terakhir dibuang kalau menempel pada variabel (mis. "= 3x").
    if (!/\s$/.test(run) && MIRIP_HURUF.test(charSesudah)) ruas = ruas.slice(0, -1);

    if (ruas.length < 2 || ruas.some((r) => r === "" || /^[+×·:÷/^]|[+\-−×·:÷/^(]$/.test(r))) continue;
    const nilai = ruas.map(hitungEkspresi);
    if (nilai.some(Number.isNaN)) continue;
    hasil.push({ teks: ruas.join(" = "), ok: nilai.every((v) => sama(v, nilai[0])), nilai });
  }
  return hasil;
}

function memuatJawaban(langkah, jawaban) {
  const esc = jawaban.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![0-9,./])${esc}(?![0-9/]|,\\d)`).test(langkah);
}

// ---------- Jalankan ----------

const galat = [];
const manual = []; // jawaban belum terverifikasi otomatis
const langkahManual = []; // jawaban terverifikasi, tapi langkah tanpa persamaan angka
const ids = new Set();
let totalPersamaan = 0;

for (const [jenjang, soal] of Object.entries(BANK)) {
  const posisi = [0, 0, 0, 0];
  if (soal.length < MIN_SOAL) galat.push(`${jenjang}: hanya ${soal.length} soal (minimal ${MIN_SOAL}).`);

  for (const q of soal) {
    const label = `${q.id} (${q.topik})`;
    const err = (pesan) => galat.push(`${label}: ${pesan}`);

    // 1. Struktur
    if (ids.has(q.id)) err("id ganda");
    ids.add(q.id);
    if (q.options.length !== 4) err(`jumlah opsi ${q.options.length}, harus 4`);
    if (new Set(q.options).size !== q.options.length) err("ada opsi yang sama");
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(`indeks jawaban ${q.answer} tidak valid`);
    if (q.steps.length !== 3) err(`jumlah langkah ${q.steps.length}, harus 3`);
    posisi[q.answer]++;
    const benar = q.options[q.answer];

    // 2. Jawaban
    if (q.hitung) {
      const target = q.hitung();
      const nilai = q.options.map(nilaiOpsi);
      const takTerbaca = q.options.filter((_, i) => Number.isNaN(nilai[i]));
      if (takTerbaca.length) {
        manual.push(`${label}: opsi tidak bisa dibaca sebagai angka (${takTerbaca.join(" | ")}).`);
      } else {
        const cocok = nilai.flatMap((v, i) => (sama(v, target) ? [i] : []));
        if (cocok.length === 0) err(`hasil hitung ulang ${target} tidak ada di opsi`);
        else if (cocok.length > 1) err(`lebih dari satu opsi bernilai ${target}: ${cocok.map((i) => q.options[i]).join(", ")}`);
        else if (cocok[0] !== q.answer) err(`hitung ulang = ${target} (opsi "${q.options[cocok[0]]}"), tapi kunci menandai "${benar}"`);
      }
    } else {
      manual.push(`${label}: tidak punya hitung(), jawaban "${benar}" perlu dicek manual.`);
    }

    // 3. Persamaan di langkah
    let dicek = 0;
    q.steps.forEach((langkah, i) => {
      for (const p of cekPersamaan(langkah)) {
        dicek++;
        if (!p.ok) err(`langkah ${i + 1} salah hitung: "${p.teks}" (nilai ruas: ${p.nilai.map((v) => +v.toFixed(6)).join(", ")})`);
      }
    });
    totalPersamaan += dicek;
    if (dicek === 0) langkahManual.push(`${label}: langkah tidak memuat persamaan angka; baca manual.`);

    // 4. Langkah terakhir memuat jawaban
    if (!memuatJawaban(q.steps[2], benar)) err(`langkah terakhir tidak memuat jawaban "${benar}"`);
  }

  console.log(`${jenjang}: ${soal.length} soal, posisi jawaban benar A/B/C/D = ${posisi.join("/")}`);
}

console.log(`Persamaan di langkah pembahasan yang dihitung ulang: ${totalPersamaan}`);

if (manual.length) {
  console.log(`\nPerlu cek manual: JAWABAN belum terverifikasi (${manual.length}):`);
  for (const m of manual) console.log("  - " + m);
}
if (langkahManual.length) {
  console.log(`\nPerlu cek manual: jawaban sudah terverifikasi, LANGKAH belum (${langkahManual.length}):`);
  for (const m of langkahManual) console.log("  - " + m);
}

if (galat.length) {
  console.log(`\nKESALAHAN (${galat.length}):`);
  for (const g of galat) console.log("  ✗ " + g);
  process.exit(1);
}
console.log("\nSemua pemeriksaan otomatis lolos.");
