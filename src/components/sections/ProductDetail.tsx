"use client";

import { motion } from "motion/react";
import { Check, ShoppingBag } from "lucide-react";
import Viewer360 from "@/components/Viewer360/Viewer360";
import type { Moto } from "@/data/motos";
import { fadeUp } from "@/lib/motion";

export default function ProductDetail({
  moto,
  onCheckout,
}: {
  moto: Moto;
  onCheckout: () => void;
}) {
  return (
    <section id="detalhe" className="scroll-mt-24 border-y border-white/10 bg-[#151515]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <motion.div {...fadeUp} className="overflow-hidden rounded-lg border border-white/10 bg-black">
          <Viewer360 src={moto.video} poster={moto.poster} motoId={moto.id} />
        </motion.div>
        <motion.div {...fadeUp} className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">
            Modelo selecionado
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
            {moto.name}
          </h2>
          <p className="mt-4 flex flex-wrap items-baseline gap-3 text-xl font-semibold text-[#ff9556]">
            {moto.basePrice ? (
              <span className="text-base font-medium text-zinc-400 line-through">
                {moto.basePrice}
              </span>
            ) : null}
            {moto.price}
            {moto.basePrice ? (
              <span className="rounded bg-[#e85d04] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                Promoção
              </span>
            ) : null}
          </p>
          <p className="mt-5 leading-7 text-zinc-300">{moto.description}</p>
          <ul className="mt-6 grid gap-3">
            {moto.highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-[#ff6a1a]" />
                {item}
              </li>
            ))}
          </ul>
          {moto.caution ? (
            <p className="mt-5 rounded-md border border-[#ff6a1a]/25 bg-[#ff6a1a]/10 p-3 text-xs leading-5 text-[#ff9556]">
              {moto.caution}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onCheckout}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#e85d04] px-5 text-sm font-semibold text-white transition hover:bg-[#ff6a1a] sm:w-fit"
          >
            Comprar este modelo
            <ShoppingBag className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
