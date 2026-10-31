import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type ButtonVariant = "utama" | "sekunder" | "tautan";

const base =
  "inline-flex w-full items-center justify-center rounded-xl px-4 text-base transition-colors disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  // Tombol/Utama (node 2:5)
  utama:
    "h-14 bg-ink font-bold text-white hover:bg-zinc-700 active:bg-black disabled:bg-line disabled:text-muted",
  // Tombol/Sekunder (node 2:7)
  sekunder:
    "h-14 border-[1.5px] border-ink bg-white font-bold text-ink hover:bg-surface active:bg-track disabled:border-line disabled:bg-white disabled:text-subtle",
  // Tombol/Tautan (node 2:9)
  tautan:
    "h-12 font-semibold text-ink underline underline-offset-4 hover:decoration-2 active:text-muted disabled:text-subtle disabled:no-underline",
};

function buttonClass(variant: ButtonVariant = "utama", className = "") {
  return `${base} ${variants[variant]} ${className}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "utama", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
};

/** Tampilan tombol, tapi berupa tautan navigasi. */
export function ButtonLink({ variant = "utama", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
