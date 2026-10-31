import { DAFTAR_JENJANG, JENJANG_LABEL, type Jenjang } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { errorClass, labelClass } from "@/components/ui/Field";

const KETERANGAN: Record<Jenjang, string> = {
  SD: "Kelas 1–6",
  SMP: "Kelas 7–9",
  SMA: "Kelas 10–12",
};

/** Warna per jenjang: SD oranye, SMP/MTs ungu, SMA/SMK hitam. */
const WARNA: Record<Jenjang, { dot: string; teks: string; aktif: string; ket: string; centang: string }> = {
  SD: {
    dot: "bg-orange",
    teks: "text-orange-ink",
    aktif: "border-2 border-orange bg-orange-50",
    ket: "text-orange-ink",
    centang: "bg-orange-ink",
  },
  SMP: {
    dot: "bg-violet",
    teks: "text-violet",
    aktif: "border-2 border-violet bg-violet-50",
    ket: "text-violet-ink",
    centang: "bg-violet",
  },
  SMA: {
    dot: "bg-ink",
    teks: "text-ink",
    aktif: "border-2 border-ink bg-surface",
    ket: "text-ink",
    centang: "bg-ink",
  },
};

type JenjangPickerProps = {
  value: Jenjang | null;
  onChange: (jenjang: Jenjang) => void;
  error?: string;
};

/** Pilihan jenjang: tiga kartu (radio). Id radio pertama: "jenjang-SD". */
export function JenjangPicker({ value, onChange, error }: JenjangPickerProps) {
  return (
    <fieldset aria-describedby={error ? "jenjang-error" : undefined} className="flex flex-col gap-2">
      <legend className={`${labelClass} mb-2`}>Jenjang</legend>
      <div className="grid grid-cols-3 gap-2.5">
        {DAFTAR_JENJANG.map((j) => {
          const aktif = value === j;
          const w = WARNA[j];
          return (
            <label
              key={j}
              className={`relative flex h-[5.25rem] cursor-pointer flex-col justify-end rounded-button p-2.5 transition-colors min-[380px]:p-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-violet sm:h-[6rem] ${
                aktif
                  ? w.aktif
                  : `border-[1.5px] bg-white hover:border-zinc-400 ${error ? "border-danger" : "border-line"}`
              }`}
            >
              <input
                id={`jenjang-${j}`}
                type="radio"
                name="jenjang"
                value={j}
                checked={aktif}
                onChange={() => onChange(j)}
                className="sr-only"
              />
              <span aria-hidden="true" className={`absolute top-3 left-3 size-2.5 rounded-full ${w.dot}`} />
              {aktif && (
                <span
                  aria-hidden="true"
                  className={`absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full text-white ${w.centang}`}
                >
                  <Icon name="centang" size={12} strokeWidth={3} />
                </span>
              )}
              <span
                className={`text-sm leading-tight font-extrabold whitespace-nowrap min-[380px]:text-base min-[420px]:text-[1.0625rem] sm:text-xl ${w.teks}`}
              >
                {JENJANG_LABEL[j].replace(" / ", "/")}
              </span>
              <span className={`mt-0.5 text-[0.6875rem] font-medium sm:text-xs ${aktif ? w.ket : "text-muted"}`}>
                {KETERANGAN[j]}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id="jenjang-error" className={errorClass}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
