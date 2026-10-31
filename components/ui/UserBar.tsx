import type { Jenjang } from "@/lib/types";
import { Avatar } from "./Avatar";
import { JenjangChip } from "./Chip";
import { SchoolName } from "./Flag";

/**
 * Slot kanan navbar desktop: identitas pemain.
 * Pengaturan dibuka dari halaman Profil. Nama dan sekolah tampil mulai 1280px supaya navbar tidak sesak.
 */
export function UserBar({ nama, sekolah, jenjang }: { nama: string; sekolah?: string; jenjang?: Jenjang }) {
  return (
    <span className="flex items-center gap-3">
      <Avatar name={nama} size={44} />
      <span className="hidden max-w-[13.75rem] flex-col xl:flex">
        <span className="truncate text-[0.9375rem] font-extrabold">{nama}</span>
        {sekolah && <SchoolName name={sekolah} className="text-[0.8125rem] text-muted" />}
      </span>
      {jenjang && <JenjangChip jenjang={jenjang} className="hidden xl:inline-flex" />}
    </span>
  );
}
