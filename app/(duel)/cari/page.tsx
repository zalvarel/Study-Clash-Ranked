import type { Metadata } from "next";
import { Suspense } from "react";
import CariScreen from "./cari-screen";

export const metadata: Metadata = { title: "Mencari lawan" };

export default function CariPage() {
  return (
    <Suspense>
      <CariScreen />
    </Suspense>
  );
}
