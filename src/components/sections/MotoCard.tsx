"use client";

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import LazyVideo from "@/components/LazyVideo/LazyVideo";
import type { Moto } from "@/data/motos";
import { cn } from "@/lib/utils";

export default function MotoCard({
  moto,
  index,
  active,
  onDetails,
  onCheckout,
}: {
  moto: Moto;
  index: number;
  active: boolean;
  onDetails: () => void;
  onCheckout: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.04, 0.24) }}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-[#1b1b1b] transition",
        active ? "border-[#ff6a1a]/65 shadow-xl shadow-black/20" : "border-white/10"
      )}
    >
      {moto.basePrice ? (
        <span className="absolute left-3 top-3 z-10 rounded bg-[#e85d04] px-2 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-black/30">
          Promoção
        </span>
      ) : null}
      <button type="button" onClick={onDetails} className="group block w-full text-left">
        <LazyVideo
          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          src={moto.video}
          poster={moto.poster}
        />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{moto.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{moto.tagline}</p>
            </div>
            <div className="shrink-0 text-right">
              {moto.basePrice ? (
                <p className="text-xs text-zinc-400 line-through">{moto.basePrice}</p>
              ) : null}
              <p className="text-sm font-semibold text-[#ff9556]">{moto.price}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {moto.specs.map((spec) => (
              <span
                key={spec}
                className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </button>
      <div className="flex gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={onDetails}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Detalhes
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCheckout}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#e85d04] text-sm font-semibold text-white transition hover:bg-[#ff6a1a]"
        >
          Tenho interesse
        </button>
      </div>
    </motion.article>
  );
}
