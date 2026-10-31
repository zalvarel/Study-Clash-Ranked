import type { Metadata } from "next";
import PeringkatScreen from "./peringkat-screen";

export const metadata: Metadata = { title: "Peringkat" };

export default function PeringkatPage() {
  return <PeringkatScreen />;
}
