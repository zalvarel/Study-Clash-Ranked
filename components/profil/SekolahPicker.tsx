"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { cariSekolah, type Jenjang } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { errorClass, helpClass, inputClass, labelClass } from "@/components/ui/Field";

/** Nilai khusus untuk pilihan "Sekolah lain". */
export const SEKOLAH_LAIN = "__sekolah_lain__";
const LABEL_LAIN = "Sekolah lain";

type SekolahPickerProps = {
  /** null = belum memilih jenjang; kolom nonaktif. */
  jenjang: Jenjang | null;
  /** Nama sekolah dari daftar, SEKOLAH_LAIN, atau null. */
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
};

/**
 * Kolom cari sekolah (pola combobox ARIA) dengan daftar yang difilter sesuai
 * jenjang. Pilihan terakhir selalu "Sekolah lain". Id input: "sekolah".
 * Pasang `key={jenjang}` di induknya supaya isian kosong lagi saat jenjang diganti.
 */
export function SekolahPicker({ jenjang, value, onChange, error }: SekolahPickerProps) {
  const listId = useId();
  const [query, setQuery] = useState(value === SEKOLAH_LAIN ? LABEL_LAIN : (value ?? ""));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const disabled = jenjang === null;
  const hasil = jenjang ? cariSekolah(jenjang, query === LABEL_LAIN ? "" : query) : [];
  const opsi = [...hasil, SEKOLAH_LAIN];
  const optionId = (i: number) => `${listId}-opsi-${i}`;

  function pilih(nilai: string) {
    onChange(nilai);
    setQuery(nilai === SEKOLAH_LAIN ? LABEL_LAIN : nilai);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const arah = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + arah + opsi.length) % opsi.length);
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      pilih(opsi[Math.min(active, opsi.length - 1)]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  }

  const describedBy = [error ? "sekolah-error" : null, disabled ? "sekolah-help" : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="sekolah" className={labelClass}>
        Asal sekolah
      </label>
      <div className="relative">
        <Icon
          name="cari"
          size={20}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-subtle"
        />
        <input
          id="sekolah"
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && !disabled}
          aria-controls={listId}
          aria-activedescendant={open ? optionId(Math.min(active, opsi.length - 1)) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          disabled={disabled}
          value={query}
          placeholder={disabled ? "Pilih jenjang dulu" : "Cari nama sekolah"}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
            if (value !== null) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className={`${inputClass} pl-12`}
        />
      </div>
      {disabled && (
        <p id="sekolah-help" className={helpClass}>
          Daftar sekolah muncul setelah jenjang dipilih.
        </p>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-label="Daftar sekolah"
        hidden={!open || disabled}
        className="max-h-72 overflow-auto rounded-button border-[1.5px] border-line bg-white p-2 shadow-pop"
      >
        {hasil.length === 0 && (
          <li role="presentation" className="px-3 py-2.5 text-sm text-muted">
            Tidak ada sekolah yang cocok.
          </li>
        )}
        {opsi.map((nama, i) => {
          const lain = nama === SEKOLAH_LAIN;
          const terpilih = value === nama;
          return (
            <li
              key={nama}
              id={optionId(i)}
              role="option"
              aria-selected={terpilih}
              // mousedown, bukan click: supaya tidak didahului blur yang menutup daftar.
              onMouseDown={(e) => {
                e.preventDefault();
                pilih(nama);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-[15px] ${
                i === active || terpilih ? "bg-violet-50 text-violet-ink" : "text-ink"
              } ${lain ? "font-bold text-violet" : "font-semibold"}`}
            >
              <span>{lain ? `${LABEL_LAIN} (tulis sendiri)` : nama}</span>
              {lain ? (
                <Icon name="plus" size={18} />
              ) : (
                terpilih && <Icon name="centang" size={18} strokeWidth={2.5} />
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <p id="sekolah-error" className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
