"use client";

import { motion } from "motion/react";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { CatalogMoto, SiteState } from "@/lib/site/types";
import { cn } from "@/lib/utils";
import { Card } from "./ui";

export default function SitePanel() {
  const [motos, setMotos] = useState<CatalogMoto[]>([]);
  const [banner, setBanner] = useState("");
  const [featured, setFeatured] = useState("x13-1000w");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/motos", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar as configurações.");
        return response.json();
      })
      .then((state: SiteState) => {
        setMotos(state.motos);
        setBanner(state.settings.banner);
        setFeatured(state.settings.featuredMotoId);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner: banner.trim(), featuredMotoId: featured }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar as configurações.");
      setMessage("Configurações publicadas no site.");
      window.setTimeout(() => setMessage(""), 2600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-gestor-gold" />
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card
          title="Aviso no site"
          subtitle="Aparece em destaque para todos os visitantes; deixe vazio para ocultar"
          className="h-full"
        >
          <textarea
            value={banner}
            onChange={(event) => setBanner(event.target.value)}
            rows={4}
            placeholder='Ex: "Condições especiais no Shopping Nova Iguaçu nesta semana"'
            className="w-full rounded-md border border-white/10 bg-black/35 p-3 text-base text-white outline-none sm:text-sm transition focus:border-gestor-gold"
          />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
      >
        <Card
          title="Moto em destaque"
          subtitle='Modelo aberto por padrão na seção "Modelo selecionado" e na playlist da hero'
          className="h-full"
        >
          <select
            value={featured}
            onChange={(event) => setFeatured(event.target.value)}
            className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-base font-semibold text-white outline-none sm:text-sm transition focus:border-gestor-gold"
          >
            {motos.map((moto) => (
              <option key={moto.id} value={moto.id} className="bg-[#151515]">
                {moto.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "mt-5 inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
              message
                ? "bg-emerald-600 text-white"
                : "bg-gestor-gold text-[#111111] hover:bg-gestor-gold-soft"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {message ? "No ar" : "Salvar alterações"}
          </button>

          {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#f87171]">{error}</p> : null}
        </Card>
      </motion.div>
    </div>
  );
}
