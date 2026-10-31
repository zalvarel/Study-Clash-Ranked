import type { ReactNode } from "react";

/** Cincin pemuat: lingkaran abu dengan busur ungu yang berputar. Isi (mis. waktu) di tengah. */
export function Spinner({ size = 136, children }: { size?: number; children?: ReactNode }) {
  return (
    <div className="relative shrink-0" style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}>
      <span aria-hidden="true" className="absolute inset-0 rounded-full border-[0.625rem] border-violet-50" />
      <span
        aria-hidden="true"
        className="animate-putar absolute inset-0 rounded-full border-[0.625rem] border-transparent border-t-violet border-r-violet"
      />
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
