import Link from "next/link";
import type { Jenjang } from "@/lib/types";
import { Avatar } from "./Avatar";
import { JenjangChip } from "./Chip";
import { SchoolName } from "./Flag";
import { Icon } from "./Icon";

/** Slot kanan navbar desktop: tombol pengaturan dan identitas pemain. */
export function UserBar({ nama, sekolah, jenjang }: { nama: string; sekolah?: string; jenjang?: Jenjang }) {
  return (
    <>
      <Link
        href="/pengaturan"
        aria-label="Pengaturan"
        className="flex size-11 items-center justify-center rounded-input border-[1.5px] border-line text-ink hover:bg-surface"
      >
        <Icon name="pengaturan" size={20} />
      </Link>
      <span className="flex items-center gap-3">
        <Avatar name={nama} size={44} />
        <span className="flex max-w-[220px] flex-col">
          <span className="truncate text-[15px] font-extrabold">{nama}</span>
          {sekolah && <SchoolName name={sekolah} className="text-[13px] text-muted" />}
        </span>
        {jenjang && <JenjangChip jenjang={jenjang} />}
      </span>
    </>
  );
}
