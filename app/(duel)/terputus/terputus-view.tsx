"use client";
/* eslint-disable @next/next/no-img-element -- ikon SVG statis dari Figma */

import { Button, MobileColumn } from "@/components/ui";

type TerputusViewProps = {
  onRetry: () => void;
  onLeave: () => void;
  /** Ditampilkan kalau "Coba Sambung Lagi" ditekan saat masih offline. */
  stillOffline: boolean;
};

/** Layar koneksi terputus (node 3:144). Tidak butuh jaringan untuk tampil. */
export function TerputusView({ onRetry, onLeave, stillOffline }: TerputusViewProps) {
  return (
    <MobileColumn className="p-6">
      {/* Tengah (node 3:145) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-full border-[1.5px] border-line bg-surface">
          <img src="/figma/ikon-wifi-mati.svg" alt="" width={32} height={32} />
        </div>
        <h1 className="text-2xl font-bold">Koneksi terputus</h1>
        <p className="text-base leading-6 text-muted">
          Duel dijeda sebentar. Kami mencoba menyambungkan kamu lagi. Jawaban yang sudah terkirim tetap aman.
        </p>
        <p role="alert" className="min-h-5 text-sm font-medium text-danger">
          {stillOffline && "Masih belum tersambung. Periksa koneksi internetmu, lalu coba lagi."}
        </p>
      </div>

      {/* Tombol (node 3:154) */}
      <div className="flex flex-col gap-3">
        <Button onClick={onRetry}>Coba Sambung Lagi</Button>
        <Button variant="sekunder" onClick={onLeave}>
          Keluar dari Duel
        </Button>
      </div>
    </MobileColumn>
  );
}
