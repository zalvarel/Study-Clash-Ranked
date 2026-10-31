import type { Metadata } from "next";
import BerandaScreen from "./beranda-screen";

export const metadata: Metadata = { title: "Beranda" };

export default function LobbyPage() {
  return <BerandaScreen />;
}
