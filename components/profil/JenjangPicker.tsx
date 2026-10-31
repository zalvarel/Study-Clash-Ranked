import { DAFTAR_JENJANG, JENJANG_LABEL, type Jenjang } from "@/lib/api";

const KETERANGAN: Record<Jenjang, string> = {
  SD: "Kelas 1–6",
  SMP: "Kelas 7–9",
  SMA: "Kelas 10–12",
};

type JenjangPickerProps = {
  value: Jenjang | null;
  onChange: (jenjang: Jenjang) => void;
  error?: string;
};

/** Pilihan jenjang: tiga kartu besar (radio). Id radio pertama: "jenjang-SD". */
export function JenjangPicker({ value, onChange, error }: JenjangPickerProps) {
  return (
    <fieldset aria-describedby={error ? "jenjang-error" : undefined} className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-semibold">Jenjang</legend>
      <div className="grid grid-cols-3 gap-2">
        {DAFTAR_JENJANG.map((j) => {
          const aktif = value === j;
          return (
            <label
              key={j}
              className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink ${
                aktif
                  ? "border-2 border-ink bg-surface"
                  : `border-[1.5px] bg-white hover:border-ink hover:bg-surface ${error ? "border-danger" : "border-line"}`
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
              <span className="text-lg leading-6 font-bold">{JENJANG_LABEL[j]}</span>
              <span className="text-xs text-muted">{KETERANGAN[j]}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id="jenjang-error" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
