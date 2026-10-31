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
      className={`flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ${TONES[tone]} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {huruf}
    </span>
  );
}
