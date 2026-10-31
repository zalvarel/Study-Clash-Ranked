import { tingkatDariWaktu, type TingkatSoal } from "@/lib/ui-config";
import { Chip, type ChipTone } from "./Chip";

const TONE: Record<TingkatSoal, ChipTone> = { Mudah: "sukses", Sedang: "kuning", Sulit: "bahaya" };
const BATANG: Record<TingkatSoal, number> = { Mudah: 1, Sedang: 2, Sulit: 3 };

/** Chip tingkat soal, diturunkan dari timeLimitSec (Mudah <= 10, Sedang <= 20, Sulit selebihnya). */
export function TingkatChip({ timeLimitSec, className = "" }: { timeLimitSec: number; className?: string }) {
  const tingkat = tingkatDariWaktu(timeLimitSec);
  return (
    <Chip tone={TONE[tingkat]} size="lg" className={className}>
      <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-sm bg-current ${i <= BATANG[tingkat] ? "" : "opacity-30"}`}
            style={{ height: `${i * 4}px` }}
          />
        ))}
      </span>
      {tingkat}
    </Chip>
  );
}

/** Warna teks/latar tingkat untuk elemen lain (mis. segmen langkah). */
export const TINGKAT_BG: Record<TingkatSoal, string> = {
  Mudah: "bg-success",
  Sedang: "bg-amber",
  Sulit: "bg-danger",
};
