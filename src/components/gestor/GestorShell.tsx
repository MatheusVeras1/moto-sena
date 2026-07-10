"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { loja } from "@/config/loja";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/gestor", label: "Visão geral" },
  { href: "/gestor/motos", label: "Motos" },
  { href: "/gestor/pedidos", label: "Pedidos" },
  { href: "/gestor/site", label: "Site" },
];

const DEMO_TABS = [
  { href: "/gestor/demo", label: "Visão geral" },
  { href: "/gestor/demo/motos", label: "Motos" },
  { href: "/gestor/demo/pedidos", label: "Pedidos" },
  { href: "/gestor/demo/site", label: "Site" },
];

export default function GestorShell({
  children,
  demo = false,
}: {
  children: React.ReactNode;
  demo?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = demo ? DEMO_TABS : TABS;

  async function logout() {
    if (demo) {
      router.replace("/gestor/login");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.replace("/gestor/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#111111] pb-16 text-[#f5f2ea]">
      <header className="border-b border-white/10 bg-[#151515]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src={loja.logoPath}
              alt={loja.nome}
              width={44}
              height={44}
              className="h-11 w-11 rounded-md border border-[#ff6a1a]/40 object-cover"
            />
            <div>
              <p className="font-semibold text-white">Painel do gestor</p>
              <p className="text-xs text-zinc-400">
                {loja.nome} · {demo ? "Modo demo local" : "Teste grátis de 60 dias"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver site
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              aria-label="Sair do painel"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {tabs.map((item) => {
            const active =
              item.href === tabs[0].href ? pathname === tabs[0].href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "border-[#ff6a1a] text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-300"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
      >
        {children}
      </motion.div>
    </main>
  );
}
