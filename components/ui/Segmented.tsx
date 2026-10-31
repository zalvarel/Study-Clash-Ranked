"use client";

import { useRef, type KeyboardEvent } from "react";

type SegmentedProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Nama grup untuk pembaca layar. */
  label: string;
  className?: string;
};

/** Pilihan bersegmen (radio group), mis. Sekolahku / Global. Panah kiri/kanan untuk pindah. */
export function Segmented<T extends string>({ options, value, onChange, label, className = "" }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className={`flex gap-1 rounded-button bg-line/70 p-1 ${className}`}>
      {options.map((opt, i) => {
        const aktif = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={aktif}
            tabIndex={aktif ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`h-10 flex-1 rounded-xl px-4 text-sm font-bold transition-colors ${
              aktif ? "bg-white text-violet shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
