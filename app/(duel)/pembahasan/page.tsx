import type { Metadata } from "next";
import PembahasanScreen from "./pembahasan-screen";

export const metadata: Metadata = { title: "Pembahasan" };

export default function PembahasanPage() {
  return <PembahasanScreen />;
}
