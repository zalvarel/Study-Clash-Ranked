import type { Metadata } from "next";
import LengkapiScreen from "./lengkapi-screen";

export const metadata: Metadata = { title: "Lengkapi profil" };

export default function LengkapiPage() {
  return <LengkapiScreen />;
}
