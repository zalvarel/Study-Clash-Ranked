import type { Metadata } from "next";
import DuelScreen from "./duel-screen";

export const metadata: Metadata = { title: "Duel" };

export default function DuelPage() {
  return <DuelScreen />;
}
