"use client";

import { Button, Icon, MobileColumn } from "@/components/ui";

type TerputusViewProps = {
  onRetry: () => void;
  onLeave: () => void;
  /** Ditampilkan kalau "Coba Sambung Lagi" ditekan saat masih offline. */
  stillOffline: boolean;
};

/** Layar koneksi terputus. Ikon inline supaya tetap tampil tanpa jaringan. */
export function TerputusView({ onRetry, onLeave, stillOffline }: TerputusViewProps) {
  return (
    <MobileColumn className="relative overflow-hidden px-6 pt-8 pb-6 sm:px-10">
      <span aria-hidden="true" className="capsule absolute top-12 -left-10 h-9 w-36 bg-violet-50" />
      <span aria-hidden="true" className="capsule absolute top-28 -right-10 h-9 w-28 bg-orange-50" />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
        <span
          aria-hidden="true"
          className="flex size-24 items-center justify-center rounded-full bg-orange-50 text-orange-ink ring-[10px] ring-orange-50/50"
        >
          <Icon name="wifiMati" size={38} />
        </span>
        <h1 className="text-[28px] leading-tight font-extrabold">Koneksi terputus</h1>
        <p className="max-w-[380px] text-base leading-6 text-muted">
          Duel dijeda sebentar. Kami mencoba menyambungkan kamu lagi. Jawaban yang sudah terkirim tetap aman.
        </p>
        <p role="alert" className="min-h-5 text-sm font-semibold text-danger">
          {stillOffline && "Masih belum tersambung. Periksa koneksi internetmu, lalu coba lagi."}
        </p>
      </div>

      <div className="relative flex flex-col gap-3">
        <Button onClick={onRetry}>Coba Sambung Lagi</Button>
        <Button variant="sekunder" onClick={onLeave}>
          Keluar dari Duel
        </Button>
      </div>
    </MobileColumn>
  );
}
