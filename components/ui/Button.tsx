import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type ButtonVariant = "utama" | "sekunder" | "bahaya" | "tautan";

const base =
  "inline-flex w-full items-center justify-center gap-2 px-4 text-base transition-[background-color,color,box-shadow] disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  // Tombol utama: ungu, teks putih.
  utama:
    "h-14 rounded-button bg-violet font-bold text-white shadow-primary hover:bg-violet-hover active:bg-violet-ink disabled:bg-line disabled:text-muted disabled:shadow-none",
  // Tombol sekunder: garis hitam 1.5px.
  sekunder:
    "h-14 rounded-button border-[1.5px] border-ink bg-white font-bold text-ink hover:bg-surface active:bg-line disabled:border-line disabled:bg-white disabled:text-subtle",
  // Aksi berisiko (mis. Keluar): garis merah.
  bahaya:
    "h-14 rounded-button border-[1.5px] border-danger bg-white font-bold text-danger hover:bg-danger-bg active:bg-danger-bg disabled:border-line disabled:text-subtle",
  // Tautan bergaris bawah.
  tautan:
    "h-12 rounded-xl text-sm font-bold text-ink underline underline-offset-4 hover:decoration-2 active:text-muted disabled:text-subtle disabled:no-underline",
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
