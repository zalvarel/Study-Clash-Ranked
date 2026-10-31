import type { Metadata } from "next";
import ProfilScreen from "./profil-screen";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return <ProfilScreen />;
}
