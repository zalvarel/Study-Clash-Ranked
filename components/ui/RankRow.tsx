import type { Jenjang } from "@/lib/types";
import { Avatar } from "./Avatar";
import { Chip, JenjangChip } from "./Chip";
import { SchoolName } from "./Flag";

type RankRowProps = {
  rank: number;
  name: string;
  rating: number;
  /** Asal sekolah, tampil di bawah nama. */
  school?: string;
  /** Baris pemain sendiri. */
  isMe?: boolean;
  /** Jenjang pemain; tampil sebagai chip kalau diisi. */
  jenjang?: Jenjang;
};

/** Warna badge untuk tiga besar. Oranye memakai orange-ink supaya teks putih tetap kontras (AA). */
const BADGE_TIGA_BESAR: Record<number, string> = {
  1: "bg-orange-ink text-white",
  2: "bg-violet text-white",
  3: "bg-ink text-white",
};

/** Baris peringkat. Baris "Kamu" berlatar ungu muda. */
export function RankRow({ rank, name, rating, school, isMe = false, jenjang }: RankRowProps) {
  return (
    <div
      className={`flex min-h-16 w-full items-center gap-3 rounded-tile border-[1.5px] px-3.5 py-2 text-ink ${
        isMe ? "border-violet bg-violet-50" : "border-transparent bg-white"
      }`}
    >
      <span
        className={`flex h-[30px] min-w-[30px] shrink-0 items-center justify-center rounded-[10px] px-1.5 text-sm font-extrabold ${
          BADGE_TIGA_BESAR[rank] ?? (isMe ? "bg-violet text-white" : "bg-surface text-muted")
        }`}
      >
        <span className="sr-only">Peringkat </span>
        {rank}
      </span>
      <Avatar name={name} tone={isMe ? "violet" : rank === 1 ? "orange" : "ink"} size={38} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[15px] font-extrabold">{name}</span>
          {isMe && <Chip tone="violetPenuh" size="sm">Kamu</Chip>}
        </span>
        {(school || jenjang) && (
          <span className="flex min-w-0 items-center gap-1.5 text-xs leading-4 font-medium text-muted">
            <span className="sr-only">, </span>
            {jenjang && <JenjangChip jenjang={jenjang} size="xs" />}
            {school && <SchoolName name={school} />}
          </span>
        )}
      </span>
      <span className={`shrink-0 text-base font-extrabold ${isMe ? "text-violet-ink" : ""}`}>
        <span className="sr-only">Rating </span>
        {rating}
      </span>
    </div>
  );
}
