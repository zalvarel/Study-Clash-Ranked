import type { ButtonHTMLAttributes } from "react";
import { MathText } from "@/components/MathText";

type OptionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Huruf badge, A sampai D. */
  letter: string;
  text: string;
  selected?: boolean;
  /**
   * Jawaban sudah dikunci. Pakai aria-disabled (bukan disabled) supaya fokus
   * keyboard tidak hilang setelah memilih.
   */
  locked?: boolean;
  /** Petunjuk tombol keyboard, tampil di desktop (mis. "tombol 1"). */
  hint?: string;
};

/** Opsi jawaban duel. Terpilih = bingkai dan badge ungu. */
export function OptionButton({
  letter,
  text,
  selected = false,
  locked = false,
  hint,
  className = "",
  onClick,
  ...props
}: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={locked || undefined}
      onClick={locked ? undefined : onClick}
      className={`flex min-h-16 w-full items-center gap-3.5 rounded-tile px-4 py-2.5 text-left text-lg font-bold text-ink transition-colors aria-disabled:cursor-default sm:min-h-[4.375rem] ${
        selected
          ? "border-2 border-violet bg-violet-50"
          : "border-[1.5px] border-line bg-white not-aria-disabled:hover:border-violet not-aria-disabled:hover:bg-violet-50/50 aria-disabled:text-muted"
      } ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`flex size-[2.125rem] shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
          selected ? "bg-violet text-white" : "bg-surface text-muted"
        }`}
      >
        {letter}
      </span>
      <span className="sr-only">Opsi {letter}: </span>
      <span className="min-w-0 flex-1">
        <MathText text={text} />
      </span>
      {hint && (
        <span aria-hidden="true" className="hidden shrink-0 text-xs font-semibold text-muted lg:inline">
          {hint}
        </span>
      )}
    </button>
  );
}
