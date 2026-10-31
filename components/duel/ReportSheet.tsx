"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ALASAN_LAPORAN, submitReport, type AlasanLaporan } from "@/lib/ui-report";
import { Button, ButtonLink, Chip, Icon, errorClass } from "@/components/ui";
import { LABEL_CONTOH } from "@/lib/ui-demo";

type ReportSheetProps = {
  duelId: string;
  /** Nama lawan dari server. */
  lawan: string;
  /** Sekolah lawan; server belum mengirimnya, jadi biasanya kosong. */
  sekolahLawan?: string;
  onClose: () => void;
};

/**
 * Laporkan lawan.
 * < 640px: bottom sheet dari bawah. >= 640px: modal di tengah.
 * Pengiriman lewat submitReport (lib/ui-report.ts), yang belum terhubung ke backend.
 */
export function ReportSheet({ duelId, lawan, sekolahLawan, onClose }: ReportSheetProps) {
  const [alasan, setAlasan] = useState<AlasanLaporan>(ALASAN_LAPORAN[0].id);
  const [cerita, setCerita] = useState("");
  const [janganPertemukan, setJanganPertemukan] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState<{ simulasi: boolean } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const id = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Esc menutup; fokus masuk ke dialog dan kembali ke pemicu saat ditutup.
  useEffect(() => {
    const sebelumnya = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("input:checked")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      sebelumnya?.focus();
    };
  }, []);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setMengirim(true);
    const hasil = await submitReport({ duelId, opponentNickname: lawan, alasan, cerita: cerita.trim(), janganPertemukan });
    setMengirim(false);
    if (hasil.ok) setTerkirim({ simulasi: hasil.simulasi });
    else setGalat(hasil.pesan);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-judul`}
        className="flex max-h-[92dvh] w-full flex-col overflow-auto rounded-t-card bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-[32rem] sm:rounded-card sm:p-8 lg:max-w-[36rem] lg:p-10"
      >
        {/* Pegangan bottom sheet (ponsel). */}
        <span aria-hidden="true" className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-line sm:hidden" />

        {terkirim ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span aria-hidden="true" className="flex size-20 items-center justify-center rounded-full bg-success text-white ring-[0.625rem] ring-success-bg">
              <Icon name="centang" size={36} strokeWidth={3} />
            </span>
            <h2 id={`${id}-judul`} className="text-2xl font-extrabold lg:text-3xl">
              Laporan terkirim
            </h2>
            {terkirim.simulasi && <Chip tone="kuning">{LABEL_CONTOH} · simulasi, tidak dikirim</Chip>}
            <p className="max-w-[24rem] text-sm leading-6 text-muted">
              Terima kasih. Tim akan meninjau laporanmu. Identitasmu dirahasiakan dan tidak ada hukuman otomatis.
            </p>
            <div className="mt-2 flex w-full flex-col gap-3">
              <ButtonLink href="/cari">Main Ranked Lagi</ButtonLink>
              <ButtonLink href="/lobby" variant="tautan">
                Kembali ke Beranda
              </ButtonLink>
            </div>
          </div>
        ) : (
          <form onSubmit={kirim} className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 id={`${id}-judul`} className="text-xl font-extrabold lg:text-[1.75rem] lg:leading-tight">
                  Laporkan lawan
                </h2>
                <p className="text-sm text-muted">
                  {lawan}
                  {sekolahLawan ? ` · ${sekolahLawan}` : ""}. Pilih alasan laporan.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="hidden size-11 shrink-0 items-center justify-center rounded-input border-[1.5px] border-line hover:bg-surface sm:flex"
              >
                <Icon name="silang" size={20} />
              </button>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Alasan laporan</legend>
              {ALASAN_LAPORAN.map((a) => {
                const aktif = alasan === a.id;
                return (
                  <label
                    key={a.id}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-input px-4 py-3 text-[0.9375rem] font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-violet ${
                      aktif ? "border-2 border-violet bg-violet-50" : "border-[1.5px] border-line hover:border-zinc-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${id}-alasan`}
                      value={a.id}
                      checked={aktif}
                      onChange={() => setAlasan(a.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        aktif ? "border-violet" : "border-zinc-300"
                      }`}
                    >
                      {aktif && <span className="size-2.5 rounded-full bg-violet" />}
                    </span>
                    {a.label}
                  </label>
                );
              })}
            </fieldset>

            <label className="flex flex-col gap-2">
              <span className="sr-only">Cerita singkat (opsional)</span>
              <textarea
                value={cerita}
                onChange={(e) => setCerita(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Ceritakan singkat apa yang terjadi (opsional)"
                className="w-full resize-none rounded-input border-[1.5px] border-line px-4 py-3 text-[max(1rem,16px)] placeholder:text-subtle hover:border-zinc-400 focus:border-violet focus:ring-4 focus:ring-violet-50 focus:outline-none"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-ink">
                <Icon name="blokir" size={20} />
              </span>
              <span className="flex-1 text-[0.9375rem] font-semibold">Jangan pertemukan aku dengan {lawan} lagi</span>
              <input
                type="checkbox"
                role="switch"
                checked={janganPertemukan}
                onChange={(e) => setJanganPertemukan(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-8 w-14 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-violet peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet after:absolute after:top-1 after:left-1 after:size-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-6"
              />
            </label>

            {galat && (
              <p role="alert" className={`${errorClass} rounded-input bg-danger-bg px-4 py-3`}>
                {galat}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:grid sm:grid-cols-[1fr_2fr]">
              <Button variant="sekunder" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={mengirim}>
                {mengirim ? "Mengirim..." : "Kirim laporan"}
              </Button>
            </div>
            <p className="text-center text-xs leading-5 text-muted">
              Laporan ditinjau tim. Identitasmu dirahasiakan dan tidak ada hukuman otomatis.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
