import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Brand } from "./Logo";

/** Padding samping yang mengikuti lebar layar (>= 1024px). Dipakai navbar atas dan kerangka halaman. */
export const PADDING_SHELL = "lg:px-[clamp(2rem,4vw,5rem)]";

export type NavTab = "beranda" | "peringkat" | "profil";

const tabs: { id: NavTab; href: string; label: string; icon: IconName }[] = [
  { id: "beranda", href: "/lobby", label: "Beranda", icon: "beranda" },
  { id: "peringkat", href: "/peringkat", label: "Peringkat", icon: "peringkat" },
  { id: "profil", href: "/profil", label: "Profil", icon: "profil" },
];

/** Navigasi bawah, tiga tab. Tampil di layar < 1024px. */
export function BottomNav({ active }: { active: NavTab }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="sticky bottom-0 z-10 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-[35rem] gap-2 px-4 py-2.5 sm:px-6">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.id} className="flex flex-1">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-button text-sm font-bold transition-colors ${
                  isActive ? "bg-violet-50 text-violet" : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <Icon name={tab.icon} size={20} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Navbar atas desktop: logo, tab, dan slot kanan. Tanpa `active` = hanya logo. */
export function TopNav({ active, right }: { active?: NavTab; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 hidden border-b border-line bg-white lg:block">
      <div className={`mx-auto flex h-[4.5rem] max-w-[120rem] items-center gap-6 ${PADDING_SHELL}`}>
        {/* Tanpa tab (mis. saat duel): logo bukan tautan supaya tidak keluar tanpa sengaja. */}
        {active ? (
          <Link href="/lobby" className="rounded-xl">
            <Brand />
          </Link>
        ) : (
          <Brand />
        )}
        {active && (
          <nav aria-label="Navigasi utama" className="mx-auto">
            <ul className="flex gap-1.5">
              {tabs.map((tab) => {
                const isActive = tab.id === active;
                return (
                  <li key={tab.id}>
                    <Link
                      href={tab.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex h-[2.625rem] items-center gap-2 rounded-input px-5 text-[0.9375rem] font-bold transition-colors ${
                        isActive ? "bg-violet-50 text-violet" : "text-muted hover:bg-surface hover:text-ink"
                      }`}
                    >
                      <Icon name={tab.icon} size={18} />
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-3">{right}</div>
      </div>
    </header>
  );
}
