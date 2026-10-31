import type { HTMLAttributes } from "react";
import { JENJANG_LABEL } from "@/lib/data/sekolah";
import type { Jenjang } from "@/lib/types";
import { tierDariRating } from "@/lib/ui-config";

export type ChipTone = "violet" | "violetPenuh" | "orange" | "ink" | "netral" | "sukses" | "bahaya" | "kuning";

const TONES: Record<ChipTone, string> = {
  violet: "bg-violet-50 text-violet-ink",
  violetPenuh: "bg-violet text-white",
  orange: "bg-orange-50 text-orange-ink",
  ink: "bg-ink text-white",
  netral: "bg-neutral-chip text-neutral-ink",
  sukses: "bg-success-bg text-success",
  bahaya: "bg-danger-bg text-danger",
  kuning: "bg-amber-bg text-amber",
};

export type ChipSize = "xs" | "sm" | "md" | "lg";

const SIZES: Record<ChipSize, string> = {
  xs: "h-[1.125rem] px-1.5 text-[0.625rem]",
  sm: "h-[1.375rem] px-2 text-xs",
  md: "h-[1.625rem] px-[0.6875rem] text-xs",
  lg: "h-9 px-4 text-sm",
};

type ChipProps = HTMLAttributes<HTMLSpanElement> & { tone?: ChipTone; size?: ChipSize };

/** Label kecil berbentuk pil. */
export function Chip({ tone = "violet", size = "md", className = "", ...props }: ChipProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold whitespace-nowrap ${SIZES[size]} ${TONES[tone]} ${className}`}
      {...props}
    />
  );
}

const JENJANG_TONE: Record<Jenjang, ChipTone> = { SD: "orange", SMP: "violet", SMA: "ink" };

/** Chip jenjang: SD oranye, SMP/MTs ungu, SMA/SMK hitam. Label dari JENJANG_LABEL. */
export function JenjangChip({ jenjang, size, className }: { jenjang: Jenjang; size?: ChipSize; className?: string }) {
  return (
    <Chip tone={JENJANG_TONE[jenjang]} size={size} className={className}>
      {JENJANG_LABEL[jenjang]}
    </Chip>
  );
}

const TIER_TONE = { Perunggu: "orange", Perak: "netral", Emas: "kuning" } as const;

/** Chip tier dari rating. Hanya tampilan, tidak ada di backend. */
export function TierChip({ rating, size, className }: { rating: number; size?: ChipSize; className?: string }) {
  const tier = tierDariRating(rating);
  return (
    <Chip tone={TIER_TONE[tier]} size={size} className={className}>
      {tier}
    </Chip>
  );
}
