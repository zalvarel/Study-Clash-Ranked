"use client";

import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { disconnectSocket } from "@/lib/socket";

/** Logika keluar yang sama dengan yang dulu ada di Beranda: signOut, putus socket, ke /login. */
export function useLogout() {
  const router = useRouter();
  return async function handleLogout() {
    try {
      await getSupabase().auth.signOut();
    } catch {
      // Ignore
    }
    disconnectSocket();
    router.replace("/login");
  };
}
