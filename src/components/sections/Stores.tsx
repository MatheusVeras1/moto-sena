"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { stores } from "@/data/stores";
import { fadeUp } from "@/lib/motion";
import { whatsappHref } from "@/lib/whatsapp";
import { loja } from "@/config/loja";
import { cn } from "@/lib/utils";

const whatsappStoreHref = whatsappHref(`Olá, quero falar com a ${loja.nome}.`);

export default function Stores() {
  const [activeStoreId, setActiveStoreId] = useState(stores[0]?.id ?? "");

  const selectedStore =
    stores.find((store) => store.id === activeStoreId) ?? stores[0];

  if (!selectedStore) return null;

  return (
    <section id="lojas" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <motion.div {...fadeUp} className="flex flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">
          Nossas Lojas
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold text-white sm:text-4xl">
          Visite uma loja e saia pilotando.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
          Compare modelos de perto, sinta a potência das elétricas premium e fale com quem entende.
        </p>

        {/* Seleção de Abas (Tabs) */}
        {stores.length > 1 ? (
          <div className="mt-8 flex flex-wrap justify-center gap-3" aria-label="Unidades da loja">
            {stores.map((store) => {
              const isActive = store.id === activeStoreId;
              return (
                <button
                  key={store.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveStoreId(store.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
                    isActive
                      ? "border-[#ff6a1a] bg-[#ff6a1a]/10 text-white shadow-[0_0_15px_rgba(255,106,26,0.15)]"
                      : "border-white/10 text-zinc-400 bg-white/[0.02] hover:border-white/20 hover:text-white"
                  }`}
                >
                  {store.shortName}
                </button>
              );
            })}
          </div>
        ) : null}
      </motion.div>

      {/* Conteúdo das Abas com AnimatePresence */}
      <div className="mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStore.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 items-center"
          >
            {/* Informações da Loja */}
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold text-white sm:text-3xl tracking-tight">
                {selectedStore.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 max-w-lg">
                {selectedStore.description}
              </p>

              <div className="mt-8 space-y-6">
                {/* Endereço */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/[0.04] border-2 border-white/25 text-[#ff6a1a]">
                    <MapPin className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                      Endereço
                    </h4>
                    <p className="mt-1 text-sm text-zinc-300 leading-relaxed max-w-sm">
                      {selectedStore.address}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#ff6a1a]">
                      {selectedStore.locationDetail}
                    </p>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/[0.04] border-2 border-white/25 text-[#ff6a1a]">
                    <Clock className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                      Horário de Funcionamento
                    </h4>
                    {selectedStore.openingHours.map((openingHour) => (
                      <p key={openingHour.label} className="mt-1 text-sm text-zinc-300">
                        {openingHour.label}:{" "}
                        <span className="font-medium text-white">{openingHour.value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappStoreHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-[#e85d04] px-6 text-sm font-semibold text-white transition hover:bg-[#ff6a1a]"
                >
                  <WhatsAppIcon />
                  Falar no WhatsApp
                </a>
                <a
                  href={selectedStore.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/10 uppercase"
                >
                  Como chegar ao shopping
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Painel do Mapa Premium (Pré-carregado com 0ms de troca e fundo original) */}
            <div className="relative rounded-xl border border-white/10 bg-[#161616] p-2.5 shadow-2xl group aspect-[4/3] w-full">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#ff6a1a] to-[#ff9556] opacity-60 z-10" />
              
              {stores.map((store) => (
                <iframe
                  key={store.id}
                  title={`Mapa da unidade ${store.name}`}
                  src={store.mapsEmbedUrl}
                  className={cn(
                    "absolute inset-2.5 w-[calc(100%-1.25rem)] h-[calc(100%-1.25rem)] border-0 rounded-lg transition-all duration-300",
                    activeStoreId === store.id ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  )}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="h-4 w-4 fill-current"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16.01 3.2A12.69 12.69 0 0 0 3.3 15.85c0 2.24.59 4.43 1.72 6.36L3.2 28.8l6.78-1.78a12.67 12.67 0 0 0 6.03 1.53h.01A12.69 12.69 0 0 0 28.8 15.89 12.72 12.72 0 0 0 16.01 3.2Zm.01 23.2h-.01a10.52 10.52 0 0 1-5.37-1.47l-.39-.23-4.02 1.05 1.07-3.91-.25-.4a10.44 10.44 0 0 1-1.6-5.59c0-5.82 4.74-10.55 10.58-10.55 2.82 0 5.48 1.1 7.48 3.1a10.48 10.48 0 0 1 3.1 7.49c0 5.8-4.76 10.51-10.59 10.51Zm5.8-7.88c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.56-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.62s1.13 3.04 1.29 3.25c.16.21 2.22 3.38 5.38 4.74.75.32 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z"
      />
    </svg>
  );
}
