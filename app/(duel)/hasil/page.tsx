import type { Metadata } from "next";
import HasilScreen from "./hasil-screen";

export const metadata: Metadata = { title: "Hasil duel" };

export default function HasilPage() {
  return <HasilScreen />;
}
