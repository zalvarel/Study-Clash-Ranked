type LogoProps = {
  /** Sisi kotak logo dalam px. */
  size?: number;
  /** "putih": kapsul atas putih, untuk latar ungu. */
  tone?: "biasa" | "putih";
  className?: string;
};

/** Logo: dua kapsul miring, ungu di atas dan oranye di bawah. Dekoratif. */
export function Logo({ size = 64, tone = "biasa", className = "" }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`capsule absolute top-[25%] left-[13%] h-[19%] w-[57%] ${tone === "putih" ? "bg-white" : "bg-violet"}`}
      />
      <span className="capsule absolute top-[53%] left-[30%] h-[19%] w-[57%] bg-orange" />
    </span>
  );
}

/** Logo + nama aplikasi, untuk navbar atas. */
export function Brand({ tone = "biasa" }: { tone?: "biasa" | "putih" }) {
  return (
    <span className={`flex items-center gap-2 text-lg font-extrabold ${tone === "putih" ? "text-white" : "text-ink"}`}>
      <Logo size={40} tone={tone} />
      Study Clash Ranked
    </span>
  );
}
