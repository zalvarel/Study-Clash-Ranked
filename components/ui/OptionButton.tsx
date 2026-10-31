import type { ButtonHTMLAttributes } from "react";

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
};

/** Opsi jawaban: Opsi/Biasa (node 2:11) dan Opsi/Terpilih (node 2:15). */
export function OptionButton({
  letter,
  text,
  selected = false,
  locked = false,
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
      className={`flex h-14 w-full items-center gap-3.5 rounded-xl px-4 text-left text-lg text-ink transition-colors aria-disabled:cursor-default ${
        selected
          ? "border-2 border-ink bg-surface font-bold"
          : "border-[1.5px] border-line bg-white font-semibold not-aria-disabled:hover:border-ink not-aria-disabled:hover:bg-surface aria-disabled:text-muted"
      } ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          selected ? "bg-ink text-white" : "bg-surface text-ink"
        }`}
      >
        {letter}
      </span>
      <span className="sr-only">Opsi {letter}: </span>
      <span>{text}</span>
    </button>
  );
}
