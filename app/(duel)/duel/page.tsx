import type { Metadata } from "next";
import { Suspense } from "react";
import DuelScreen from "./duel-screen";

export const metadata: Metadata = { title: "Duel" };

export default function DuelPage() {
  return (
    <Suspense>
      <DuelScreen />
    </Suspense>
  );
}
