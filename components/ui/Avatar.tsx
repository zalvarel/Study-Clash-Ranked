import type { CSSProperties } from "react";

type AvatarProps = {
  name: string;
  /** "violet" = kamu, "orange" = lawan, "ink" = lainnya. */
  tone?: "violet" | "orange" | "ink";
  size?: number;
  className?: string;
};

const TONES = { violet: "bg-violet", orange: "bg-orange-ink", ink: "bg-ink" };

/** Lingkaran berisi huruf awal nama. Dekoratif: nama selalu tertulis di sebelahnya. */
export function Avatar({ name, tone = "violet", size = 44, className = "" }: AvatarProps) {
  const huruf = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={`flex size-(--av) shrink-0 items-center justify-center rounded-full text-[calc(var(--av)*0.4)] font-extrabold text-white ${TONES[tone]} ${className}`}
      style={{ "--av": `${size / 16}rem` } as CSSProperties}
    >
      {huruf}
    </span>
  );
}
