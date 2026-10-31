import type { Jenjang } from "@/lib/types";
import { SOAL_SD } from "./sd";
import { SOAL_SMA } from "./sma";
import { SOAL_SMP } from "./smp";
import type { MockQuestion } from "./types";

export type { MockQuestion } from "./types";

/** Bank soal tiruan per jenjang. */
export const BANK_SOAL: Record<Jenjang, MockQuestion[]> = {
  SD: SOAL_SD,
  SMP: SOAL_SMP,
  SMA: SOAL_SMA,
};
