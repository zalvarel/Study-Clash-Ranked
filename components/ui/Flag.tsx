import { isSekolahTerdaftar } from "@/lib/data/sekolah";

/** Bendera Indonesia kecil. */
export function FlagID({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Indonesia"
      className={`inline-flex h-3 w-[1.125rem] shrink-0 flex-col overflow-hidden rounded-[0.125rem] ring-1 ring-line ${className}`}
    >
      <span className="flex-1 bg-[#CE1126]" />
      <span className="flex-1 bg-white" />
    </span>
  );
}

/** Nama sekolah, dengan bendera bila sekolah ada di daftar bawaan. */
export function SchoolName({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`flex min-w-0 items-center gap-1.5 ${className}`}>
      {isSekolahTerdaftar(name) && <FlagID />}
      <span className="truncate">{name}</span>
    </span>
  );
}
