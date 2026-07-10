"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { motos } from "@/data/motos";
import { cn } from "@/lib/utils";
import { Card } from "../ui";
import { saveSettings, useSiteSettings } from "./demo-store";

/** Configurações do site na conta de apresentação: edição só na sessão. */
export default function SitePanelDemo() {
  const settings = useSiteSettings();
  const [banner, setBanner] = useState(settings.banner);
  const [featured, setFeatured] = useState(settings.featuredMotoId);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveSettings({ banner: banner.trim(), featuredMotoId: featured });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
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
          subtitle="Aparece em destaque para todos os visitantes — deixe vazio para ocultar"
          className="h-full"
        >
          <textarea
            value={banner}
            onChange={(event) => setBanner(event.target.value)}
            rows={3}
            placeholder='Ex: "Condições especiais no Shopping Nova Iguaçu nesta semana"'
            className="w-full rounded-md border border-white/10 bg-black/35 p-3 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
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
          subtitle='Modelo aberto por padrão na seção "Modelo selecionado"'
          className="h-full"
        >
          <select
            value={featured}
            onChange={(event) => setFeatured(event.target.value)}
            className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-base font-semibold text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
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
            className={cn(
              "mt-5 inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition",
              saved
                ? "bg-emerald-600 text-white"
                : "bg-[#e85d04] text-white hover:bg-[#ff6a1a]"
            )}
          >
            {saved ? "Alterações no ar ✓" : "Salvar alterações"}
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
