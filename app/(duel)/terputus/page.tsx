import type { Metadata } from "next";
import TerputusScreen from "./terputus-screen";

export const metadata: Metadata = { title: "Koneksi terputus" };

export default function TerputusPage() {
  return <TerputusScreen />;
}
