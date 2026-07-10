import type { Metadata } from "next";
import { loja } from "@/config/loja";

export const metadata: Metadata = {
  title: `Painel do gestor | ${loja.nome}`,
  robots: { index: false, follow: false },
};

export default function GestorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
