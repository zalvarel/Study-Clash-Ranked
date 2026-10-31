/**
 * Laporan lawan. UI saja: belum ada endpoint laporan di backend.
 * Lihat flag reportEnabled di lib/ui-config.ts.
 */
import { reportEnabled, UI_DEMO } from "@/lib/ui-config";

export const ALASAN_LAPORAN = [
  { id: "ai", label: "Dicurigai memakai AI atau bantuan lain" },
  { id: "terlalu_cepat", label: "Jawaban terlalu cepat atau tidak wajar" },
  { id: "mengulur", label: "Sengaja mengulur waktu atau keluar duel" },
  { id: "nama_tidak_pantas", label: "Nama atau sekolah tidak pantas" },
  { id: "lainnya", label: "Lainnya" },
] as const;

export type AlasanLaporan = (typeof ALASAN_LAPORAN)[number]["id"];

export type ReportPayload = {
  duelId: string;
  /** Nama lawan seperti yang dikirim server (opponent.nickname). */
  opponentNickname: string;
  alasan: AlasanLaporan;
  /** Cerita singkat, opsional. */
  cerita: string;
  /** "Jangan pertemukan aku dengan [nama] lagi". */
  janganPertemukan: boolean;
};

export type ReportResult = { ok: true; simulasi: boolean } | { ok: false; pesan: string };

export const PESAN_BELUM_AKTIF = "Pengiriman laporan belum aktif (segera hadir).";

/**
 * Kirim laporan. Saat ini TIDAK memanggil backend.
 * - NEXT_PUBLIC_UI_DEMO=1: sukses simulasi (ditandai `simulasi: true`).
 * - Selain itu: gagal dengan pesan "belum aktif". Tidak pernah pura-pura berhasil.
 */
export async function submitReport(payload: ReportPayload): Promise<ReportResult> {
  if (reportEnabled) {
    // TODO: hubungkan ke endpoint laporan di backend (kirim `payload`).
    void payload;
    return { ok: false, pesan: PESAN_BELUM_AKTIF };
  }
  if (UI_DEMO) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, simulasi: true };
  }
  return { ok: false, pesan: PESAN_BELUM_AKTIF };
}
