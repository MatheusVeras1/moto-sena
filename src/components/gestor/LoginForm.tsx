"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { loja } from "@/config/loja";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase ainda não está configurado neste ambiente.");
      return;
    }

    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (loginError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.replace("/gestor/motos");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-4">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-white/10 bg-[#1b1b1b] p-6 shadow-2xl shadow-black/40"
      >
        <div className="flex items-center gap-3">
          <Image
            src={loja.logoPath}
            alt={loja.nome}
            width={48}
            height={48}
            className="h-12 w-12 rounded-md border border-[#ff6a1a]/40 object-cover"
          />
          <div>
            <p className="font-semibold text-white">{loja.nome}</p>
            <p className="text-xs text-zinc-400">Painel do gestor</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            E-mail
          </span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoFocus
            className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Senha
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-[#ff6a1a]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#e85d04] text-sm font-semibold text-white transition hover:bg-[#ff6a1a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Lock className="h-4 w-4" />
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {!hasSupabaseConfig ? (
          <a
            href="/gestor/demo"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-[#ff6a1a]/40 bg-[#ff6a1a]/10 text-sm font-semibold text-[#ff9556] transition hover:bg-[#ff6a1a]/15"
          >
            Ver painel demo
          </a>
        ) : null}
      </motion.form>
    </main>
  );
}
