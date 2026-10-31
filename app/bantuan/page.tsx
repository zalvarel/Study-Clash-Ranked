import type { Metadata } from "next";
import Link from "next/link";
import { Icon, Logo, MobileColumn } from "@/components/ui";

export const metadata: Metadata = { title: "Bantuan dan privasi" };

const BANTUAN = [
  {
    judul: "Main Ranked",
    isi: "Kamu dipasangkan dengan pemain yang rating-nya berdekatan. Jawab soal secepat dan setepat mungkin. Hasil duel ranked mengubah rating-mu.",
  },
  {
    judul: "Room",
    isi: "Buat room untuk mendapat kode 4 karakter, lalu bagikan ke temanmu. Duel langsung mulai saat temanmu masuk dengan kode itu.",
  },
  {
    judul: "Latihan Bot",
    isi: "Latihan melawan bot untuk pemanasan. Latihan tidak mengubah rating.",
  },
  {
    judul: "Waktu dan kejujuran",
    isi: "Waktu dihitung oleh server. Ranked dimainkan tanpa bantuan AI; akun yang terdeteksi curang akan direset.",
  },
];

const PRIVASI = [
  "Lawan hanya melihat nama panggilan dan rating-mu saat duel. Di peringkat, nama panggilan dan sekolahmu terlihat.",
  "Akun tamu hanya tersimpan di browser ini. Kalau keluar atau data browser dihapus, akun tamu tidak bisa dipulihkan.",
  "Akun Google memakai nama dari akun Google-mu sebagai nama panggilan.",
];

export default function BantuanPage() {
  return (
    <MobileColumn brandBar className="gap-6 px-5 pt-6 pb-8 sm:px-8 sm:pt-8">
      <div className="flex items-center gap-3">
        <Link
          href="/pengaturan"
          aria-label="Kembali ke pengaturan"
          className="flex size-11 shrink-0 items-center justify-center rounded-input border-[1.5px] border-line hover:bg-surface"
        >
          <Icon name="kembali" size={20} />
        </Link>
        <h1 className="text-[26px] leading-tight font-extrabold">Bantuan dan privasi</h1>
      </div>

      <section aria-labelledby="bantuan-judul" className="flex flex-col gap-3">
        <h2 id="bantuan-judul" className="flex items-center gap-2 text-lg font-extrabold">
          <Logo size={32} className="-ml-1" />
          Cara bermain
        </h2>
        <dl className="flex flex-col gap-3">
          {BANTUAN.map((b) => (
            <div key={b.judul} className="rounded-tile border-[1.5px] border-line p-4">
              <dt className="text-[15px] font-extrabold">{b.judul}</dt>
              <dd className="mt-1 text-sm leading-6 text-muted">{b.isi}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="privasi-judul" className="flex flex-col gap-3">
        <h2 id="privasi-judul" className="flex items-center gap-2 text-lg font-extrabold">
          <Icon name="perisai" size={22} className="text-violet" />
          Privasi
        </h2>
        <ul className="flex flex-col gap-2 rounded-tile bg-violet-50 p-4">
          {PRIVASI.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm leading-6 text-violet-ink">
              <Icon name="centang" size={16} strokeWidth={2.5} className="mt-1 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </section>
    </MobileColumn>
  );
}
