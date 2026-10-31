"use client";

import { useCurrentUser } from "@/lib/auth";

/** Alur duel butuh pengguna yang sudah masuk dengan profil lengkap (jenjang & sekolah). */
export function ProfilGuard() {
  useCurrentUser();
  return null;
}
