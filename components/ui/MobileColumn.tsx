import type { ReactNode } from "react";
import { BottomNav, TopNav, type NavTab } from "./BottomNav";

type MobileColumnProps = {
  children: ReactNode;
  /** Kelas untuk area isi (padding, gap, dsb.). */
  className?: string;
  /** Tab aktif. Kalau diisi: BottomNav (< 1024px) dan navbar atas (>= 1024px). */
  nav?: NavTab;
  /** Tampilkan navbar atas berisi logo saja (>= 1024px), untuk layar tanpa tab. */
  brandBar?: boolean;
  /** Isi slot kanan navbar atas. */
  topBarRight?: ReactNode;
  /**
   * Lebar kartu di desktop (>= 1024px). Di 640–1023px selalu kolom 560px.
   * "narrow" 560px, "wide" 880px, "full" 1120px.
   */
  width?: "narrow" | "wide" | "full";
  /** Desktop (>= 1024px): tanpa bingkai kartu, isi langsung di atas latar abu. */
  bareDesktop?: boolean;
};

const LEBAR_DESKTOP = { narrow: "lg:max-w-[560px]", wide: "lg:max-w-[880px]", full: "lg:max-w-[1120px]" };

/**
 * Kerangka halaman.
 * < 640px: lebar penuh, latar putih.
 * 640–1023px: latar abu muda, kartu putih 560px di tengah.
 * >= 1024px: navbar atas (kalau ada nav/brandBar), kartu selebar `width`.
 */
export function MobileColumn({
  children,
  className = "",
  nav,
  brandBar = false,
  topBarRight,
  width = "narrow",
  bareDesktop = false,
}: MobileColumnProps) {
  const adaBar = nav !== undefined || brandBar;
  return (
    <div className="flex min-h-dvh flex-col bg-white sm:bg-surface">
      {adaBar && <TopNav active={nav} right={topBarRight} />}
      <div
        className={`flex flex-1 flex-col sm:items-center sm:px-6 sm:py-10 ${adaBar ? "sm:justify-start" : "sm:justify-center"}`}
      >
        <div
          className={`relative flex w-full flex-1 flex-col bg-white sm:max-w-[560px] sm:flex-none sm:overflow-hidden sm:rounded-card sm:border-[1.5px] sm:border-line ${
            adaBar ? "sm:min-h-[560px]" : "sm:min-h-[720px]"
          } ${LEBAR_DESKTOP[width]} ${
            bareDesktop ? "lg:min-h-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent" : ""
          }`}
        >
          <main className={`flex flex-1 flex-col ${className}`}>{children}</main>
        </div>
      </div>
      {nav && <BottomNav active={nav} />}
    </div>
  );
}
