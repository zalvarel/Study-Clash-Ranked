import { DuelProvider } from "@/lib/duel";
import { ProfilGuard } from "./profil-guard";

/** Semua layar alur duel berbagi state duel yang sama. */
export default function DuelLayout({ children }: LayoutProps<"/">) {
  return (
    <DuelProvider>
      <ProfilGuard />
      {children}
    </DuelProvider>
  );
}
