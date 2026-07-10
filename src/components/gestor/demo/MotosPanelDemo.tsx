"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { motos, type Moto } from "@/data/motos";
import { cn } from "@/lib/utils";
import { Card } from "../ui";
import {
  clearOverride,
  saveOverride,
  useOverrides,
  type MotoOverride,
} from "./demo-store";

/** Catálogo da conta de apresentação: edições ficam só nesta sessão. */
export default function MotosPanelDemo() {
  const overrides = useOverrides();

  return (
    <Card
      title="Catálogo"
      subtitle="Preço, promoção e disponibilidade — as mudanças entram no ar na hora"
    >
      <div className="grid gap-3">
        {motos.map((moto, index) => (
          <motion.div
            key={moto.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut", delay: index * 0.05 }}
          >
            <MotoRow moto={moto} override={overrides[moto.id]} />
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function MotoRow({ moto, override }: { moto: Moto; override?: MotoOverride }) {
  const [price, setPrice] = useState<string>(
    override?.price != null
      ? String(override.price)
      : moto.numericPrice != null
        ? String(moto.numericPrice)
        : ""
  );
  const [promo, setPromo] = useState<string>(
    override?.promoPrice != null ? String(override.promoPrice) : ""
  );
  const [active, setActive] = useState<boolean>(override?.active !== false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const parsedPrice = Number(price);
    const parsedPromo = Number(promo);
    const next: MotoOverride = { active };

    if (price.trim() !== "" && Number.isFinite(parsedPrice) && parsedPrice > 0) {
      if (parsedPrice !== moto.numericPrice) next.price = parsedPrice;
    }
    if (promo.trim() !== "" && Number.isFinite(parsedPromo) && parsedPromo > 0) {
      next.promoPrice = parsedPromo;
    }

    saveOverride(moto.id, next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  function handleReset() {
    clearOverride(moto.id);
    setPrice(moto.numericPrice != null ? String(moto.numericPrice) : "");
    setPromo("");
    setActive(true);
  }

  return (
    <div
      className={cn(
        "grid items-center gap-4 rounded-md border border-white/10 bg-black/25 p-4 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto]",
        !active && "opacity-60"
      )}
    >
      <Image
        src={moto.poster}
        alt={moto.name}
        width={96}
        height={54}
        className="h-[54px] w-24 rounded object-cover"
      />

      <div className="min-w-0">
        <p className="truncate font-semibold text-white">{moto.name}</p>
        <p className="text-xs text-zinc-400">
          Catálogo:{" "}
          {moto.numericPrice != null
            ? `R$ ${moto.numericPrice.toLocaleString("pt-BR")}`
            : "Sob consulta"}
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
          Preço (R$)
        </span>
        <input
          type="number"
          min="0"
          value={price}
          placeholder="Sob consulta"
          onChange={(event) => setPrice(event.target.value)}
          className="mt-1 h-10 w-32 rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
          Promoção (R$)
        </span>
        <input
          type="number"
          min="0"
          value={promo}
          placeholder="Sem promoção"
          onChange={(event) => setPromo(event.target.value)}
          className="mt-1 h-10 w-32 rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
        />
      </label>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="h-4 w-4 accent-[#ff6a1a]"
        />
        <span className="text-sm text-zinc-300">Na vitrine</span>
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition",
            saved
              ? "bg-emerald-600 text-white"
              : "bg-[#e85d04] text-white hover:bg-[#ff6a1a]"
          )}
        >
          {saved ? "No ar ✓" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
        >
          Restaurar
        </button>
      </div>
    </div>
  );
}
