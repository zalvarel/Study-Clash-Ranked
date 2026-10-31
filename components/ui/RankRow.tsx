/* eslint-disable @next/next/no-img-element -- ikon SVG statis dari Figma */

type RankRowProps = {
  rank: number;
  name: string;
  rating: number;
  /** Asal sekolah, tampil di bawah nama. */
  school?: string;
  /** Baris pemain sendiri: Baris peringkat/Kamu (node 2:25). */
  isMe?: boolean;
};

/** Baris peringkat/Biasa (node 2:19) dan Baris peringkat/Kamu (node 2:25). */
export function RankRow({ rank, name, rating, school, isMe = false }: RankRowProps) {
  return (
    <div
      className={`flex w-full items-center gap-3 rounded-xl px-3.5 text-base text-ink ${
        isMe ? "h-15 border-2 border-ink bg-surface" : "h-14 border-[1.5px] border-line bg-white"
      }`}
    >
      <span className="w-9 shrink-0 font-bold">
        <span className="sr-only">Peringkat </span>
        {rank}
      </span>
      <img
        src={isMe ? "/figma/avatar-kamu.svg" : "/figma/avatar-biasa.svg"}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-3">
          <span className={`min-w-0 truncate ${isMe ? "font-bold" : "font-semibold"}`}>{name}</span>
          {isMe && (
            <span className="shrink-0 rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-white">Kamu</span>
          )}
        </span>
        {school && (
          <span className="truncate text-xs leading-4 text-muted">
            <span className="sr-only">, </span>
            {school}
          </span>
        )}
      </span>
      <span className="shrink-0 font-bold">
        <span className="sr-only">Rating </span>
        {rating}
      </span>
    </div>
  );
}
