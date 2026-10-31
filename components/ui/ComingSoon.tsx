import type { ReactNode } from "react";
import { Chip } from "./Chip";
import { LABEL_CONTOH } from "@/lib/ui-demo";

/** Kotak "Segera hadir" untuk fitur yang datanya belum ada di backend. */
export function ComingSoon({ title, children, className = "" }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col items-start gap-2 rounded-[1.375rem] border-[1.5px] border-dashed border-zinc-300 bg-surface p-5 ${className}`}
    >
      <Chip tone="netral">Segera hadir</Chip>
      <p className="text-base font-bold text-ink">{title}</p>
      {children && <div className="text-sm leading-6 text-muted">{children}</div>}
    </div>
  );
}

/** Label untuk data contoh (mode demo). */
export function ContohChip({ className }: { className?: string }) {
  return (
    <Chip tone="kuning" className={className}>
      {LABEL_CONTOH}
    </Chip>
  );
}
