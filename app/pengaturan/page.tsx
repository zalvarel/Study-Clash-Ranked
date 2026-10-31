import type { Metadata } from "next";
import PengaturanScreen from "./pengaturan-screen";

export const metadata: Metadata = { title: "Pengaturan" };

export default function PengaturanPage() {
  return <PengaturanScreen />;
}
