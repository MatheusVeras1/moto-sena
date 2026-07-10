"use client";

import { Building2, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { loja } from "@/config/loja";
import { stores } from "@/data/stores";
import { fadeUp } from "@/lib/motion";
import { whatsappHref } from "@/lib/whatsapp";

const whatsappStoreHref = whatsappHref(`Olá, quero falar com a ${loja.nome}.`);

export default function Stores() {
  return (
    <section id="lojas" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <motion.div {...fadeUp}>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">Lojas físicas</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-white sm:text-5xl">Visite uma loja e saia pilotando.</h2>
          <p className="mt-5 leading-7 text-zinc-400">Visite a Moto Sena no Shopping Nova Iguaçu para ver os modelos de perto, tirar dúvidas e confirmar disponibilidade.</p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {stores.map((store) => (
            <div key={store.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b]">
              <iframe title={`Mapa da loja ${store.name}`} src={store.mapsEmbedUrl} className="aspect-video w-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#ff6a1a]" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{store.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">{store.address}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-md border border-[#ff6a1a]/35 bg-[#ff6a1a]/10 p-3 text-sm text-[#ff9556]">
                  <Building2 className="h-5 w-5 shrink-0" />
                  <p className="font-semibold">{store.locationDetail}</p>
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] text-sm font-semibold text-white transition hover:bg-white/10">Como chegar ao shopping</a>
                  <a href={whatsappStoreHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#e85d04] text-sm font-semibold text-white transition hover:bg-[#ff6a1a]">Chamar no WhatsApp</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
