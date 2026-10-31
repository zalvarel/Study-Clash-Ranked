import type { ReactNode } from "react";
import { BottomNav, PADDING_SHELL, TopNav, type NavTab } from "./BottomNav";

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
   * Lebar maksimum di desktop (>= 1024px). Di 640–1023px selalu kolom tengah.
   * "narrow" sekitar 560-630px, "wide" sekitar 1020-1150px, "full" sekitar 1280-1440px.
   */
  width?: "narrow" | "wide" | "full";
  /** Desktop (>= 1024px): tanpa bingkai kartu, isi langsung di atas latar abu. */
  bareDesktop?: boolean;
};

const LEBAR_DESKTOP = { narrow: "lg:max-w-[35rem]", wide: "lg:max-w-[64rem]", full: "lg:max-w-[80rem]" };

/**
 * Kerangka halaman.
 * < 640px: lebar penuh, latar putih.
 * 640–1023px: latar abu muda, kartu putih di tengah (35rem).
 * >= 1024px: navbar atas (kalau ada nav/brandBar), isi selebar `width`, padding fluid.
 * >= 1600px: sisi kosong diisi hiasan kapsul miring.
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
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip bg-white sm:bg-surface">
      <HiasanSisi />
      {adaBar && <TopNav active={nav} right={topBarRight} />}
      <div
        className={`flex flex-1 flex-col sm:items-center sm:px-6 sm:py-10 ${PADDING_SHELL} lg:py-[clamp(2rem,3vw,3.5rem)] ${
          adaBar ? "sm:justify-start" : "sm:justify-center"
        }`}
      >
        <div
          className={`relative flex w-full flex-1 flex-col bg-white sm:max-w-[35rem] sm:flex-none sm:overflow-hidden sm:rounded-card sm:border-[1.5px] sm:border-line ${
            adaBar ? "sm:min-h-[35rem]" : "sm:min-h-[45rem]"
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

/**
 * Hiasan kapsul miring di sisi kiri dan kanan layar lebar (>= 1600px).
 * Lebarnya mengikuti ruang kosong di samping isi. Tidak bisa diklik.
 */
export function HiasanSisi() {
  const lebar = "w-[clamp(8rem,calc(50vw-36rem),40rem)]";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden min-[1600px]:block">
      <span className={`capsule absolute top-[18%] -left-16 h-24 bg-violet-50 ${lebar}`} />
      <span className={`capsule absolute top-[calc(18%+7.5rem)] -left-24 h-12 bg-orange-50 ${lebar}`} />
      <span className={`capsule absolute top-[62%] -right-16 h-24 bg-orange-50 ${lebar}`} />
      <span className={`capsule absolute top-[calc(62%+7.5rem)] -right-24 h-12 bg-violet-50 ${lebar}`} />
    </div>
  );
}
