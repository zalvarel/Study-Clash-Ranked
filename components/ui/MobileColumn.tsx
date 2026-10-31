import type { ReactNode } from "react";
import { BottomNav, TopNav, type NavTab } from "./BottomNav";

type MobileColumnProps = {
  children: ReactNode;
  /** Kelas untuk area isi (padding, gap, dsb.). */
  className?: string;
  /** Tab aktif. Kalau diisi, tampil BottomNav (< 768px) atau navbar atas (>= 768px). */
  nav?: NavTab;
  /** Lebar kolom di layar >= 768px: "narrow" 420px, "wide" 640px. */
  width?: "narrow" | "wide";
};

/**
 * Kolom halaman.
 * < 768px: persis wireframe, lebar penuh, latar putih.
 * >= 768px: latar abu muda, kolom putih di tengah (420px atau 640px).
 */
export function MobileColumn({ children, className = "", nav, width = "narrow" }: MobileColumnProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-white md:bg-surface">
      {nav && <TopNav active={nav} />}
      <div
        className={`flex flex-1 flex-col md:items-center md:px-6 md:py-10 ${nav ? "md:justify-start" : "md:justify-center"}`}
      >
        <div
          className={`flex w-full flex-1 flex-col bg-white md:flex-none md:overflow-hidden md:rounded-3xl md:border-[1.5px] md:border-line ${
            nav ? "md:min-h-[560px]" : "md:min-h-[720px]"
          } ${width === "wide" ? "md:max-w-[640px]" : "md:max-w-[420px]"}`}
        >
          <main className={`flex flex-1 flex-col ${className}`}>{children}</main>
          {nav && <BottomNav active={nav} />}
        </div>
      </div>
    </div>
  );
}
