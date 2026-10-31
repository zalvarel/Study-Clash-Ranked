/* eslint-disable @next/next/no-img-element -- ikon SVG statis dari Figma */
import Link from "next/link";

export type NavTab = "beranda" | "peringkat";

const tabs: { id: NavTab; href: string; label: string; icon: string; iconActive: string; w: number; h: number }[] = [
  {
    id: "beranda",
    href: "/lobby",
    label: "Beranda",
    icon: "/figma/ikon-beranda.svg",
    iconActive: "/figma/ikon-beranda-aktif.svg",
    w: 20,
    h: 21,
  },
  {
    id: "peringkat",
    href: "/peringkat",
    label: "Peringkat",
    icon: "/figma/ikon-peringkat.svg",
    iconActive: "/figma/ikon-peringkat-aktif.svg",
    w: 16,
    h: 20,
  },
];

/** Navigasi bawah (node 2:65 / 3:131). Hanya di layar < 768px. */
export function BottomNav({ active }: { active: NavTab }) {
  return (
    <nav aria-label="Navigasi utama" className="sticky bottom-0 border-t-[1.5px] border-line bg-white md:hidden">
      <ul className="flex h-16">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.id} className="flex flex-1">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[13px] transition-colors hover:bg-surface ${
                  isActive ? "font-bold text-ink" : "font-medium text-muted"
                }`}
              >
                <span className="flex size-6 items-center justify-center">
                  <img src={isActive ? tab.iconActive : tab.icon} alt="" width={tab.w} height={tab.h} />
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Versi desktop dari BottomNav: navbar atas. Hanya di layar >= 768px. */
export function TopNav({ active }: { active: NavTab }) {
  return (
    <header className="sticky top-0 z-10 hidden border-b-[1.5px] border-line bg-white md:block">
      <div className="mx-auto flex h-16 max-w-[1040px] items-center justify-between gap-6 px-6">
        <Link href="/lobby" className="flex items-center gap-2.5 rounded-lg text-base font-bold text-ink">
          <span className="flex size-8 items-center justify-center" aria-hidden="true">
            <img src="/figma/logo.svg" alt="" width={27.7} height={15.1} className="-skew-x-[18deg]" />
          </span>
          Study Clash Ranked
        </Link>
        <nav aria-label="Navigasi utama">
          <ul className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = tab.id === active;
              return (
                <li key={tab.id}>
                  <Link
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm transition-colors hover:bg-surface ${
                      isActive ? "bg-surface font-bold text-ink" : "font-medium text-muted"
                    }`}
                  >
                    <span className="flex size-6 items-center justify-center">
                      <img src={isActive ? tab.iconActive : tab.icon} alt="" width={tab.w} height={tab.h} />
                    </span>
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
