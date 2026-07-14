"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import CardNav from "@/components/CardNav/CardNav";
import Checkout from "@/components/sections/Checkout";
import CampaignReel from "@/components/sections/CampaignReel";
import EconomyCalculator from "@/components/sections/EconomyCalculator";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import HowToBuy from "@/components/sections/HowToBuy";
import MotoCard from "@/components/sections/MotoCard";
import ProductDetail from "@/components/sections/ProductDetail";
import Stores from "@/components/sections/Stores";
import { loja } from "@/config/loja";
import type { Moto } from "@/data/motos";
import { stores } from "@/data/stores";
import { fadeUp } from "@/lib/motion";
import { trackSiteEvent } from "@/lib/site/analytics";
import type { SiteState } from "@/lib/site/types";
import { whatsappInterestHref } from "@/lib/whatsapp";

const navItems = [
  {
    label: "Modelos",
    bgColor: "#1B1B1B",
    textColor: "#F5F2EA",
    links: [
      { label: "Vitrine", href: "#modelos", ariaLabel: "Ir para vitrine de modelos" },
      { label: "Modelo selecionado", href: "#detalhe", ariaLabel: "Ir para detalhe do modelo" },
    ],
  },
  {
    label: "Comprar",
    bgColor: "#231719",
    textColor: "#F5F2EA",
    links: [
      { label: "Simular economia", href: "#economia", ariaLabel: "Ir para simulador de economia" },
      { label: "Como comprar", href: "#comprar", ariaLabel: "Ir para como comprar" },
      { label: "Comprar agora", href: "#detalhe", ariaLabel: "Ir para compra do modelo selecionado" },
    ],
  },
  {
    label: "Lojas",
    bgColor: "#211D14",
    textColor: "#F5F2EA",
    links: [
      ...stores.map((store) => ({
        label: store.name,
        href: "#lojas",
        ariaLabel: `Ir para loja ${store.name}`,
      })),
      { label: "WhatsApp", href: whatsappInterestHref, ariaLabel: `Chamar a ${loja.nome} no WhatsApp` },
      { label: "Instagram", href: loja.instagramUrl, ariaLabel: "Abrir Instagram da Moto Sena" },
    ],
  },
];

const LOGO_INDEX_KEY = "moto-sena-logo-index";
const LOGO_INDEX_EVENT = "moto-sena-logo-index-change";

function subscribeToLogoIndex(callback: () => void) {
  window.addEventListener(LOGO_INDEX_EVENT, callback);
  return () => window.removeEventListener(LOGO_INDEX_EVENT, callback);
}

function logoIndexSnapshot() {
  const stored = sessionStorage.getItem(LOGO_INDEX_KEY);
  if (!stored) return 0;
  const idx = Number.parseInt(stored, 10);
  return Number.isNaN(idx) || idx < 0 || idx > 2 ? 0 : idx;
}

export default function HomeClient({ initialState }: { initialState: SiteState }) {
  const [siteState, setSiteState] = useState(initialState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  
  const logoIndex = useSyncExternalStore(
    subscribeToLogoIndex,
    logoIndexSnapshot,
    () => 0
  );

  useEffect(() => {
    trackSiteEvent("page_view");

    const refresh = () => {
      fetch("/api/site-state", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((state: SiteState | null) => {
          if (state?.motos?.length) setSiteState(state);
        })
        .catch(() => {});
    };

    const interval = window.setInterval(refresh, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const activeMotos = useMemo(
    () => siteState.motos.filter((moto) => moto.active !== false),
    [siteState.motos]
  );

  const selectedMoto =
    activeMotos.find((moto) => moto.id === (selectedId ?? siteState.settings.featuredMotoId)) ??
    activeMotos[0];
  const checkoutMoto = checkoutId
    ? siteState.motos.find((moto) => moto.id === checkoutId) ?? null
    : null;

  function chooseMoto(moto: Moto) {
    setSelectedId(moto.id);
    trackSiteEvent("detail_open", { motoId: moto.id });
    document.getElementById("detalhe")?.scrollIntoView({ behavior: "smooth" });
  }

  function setCheckoutMoto(moto: Moto | null) {
    if (moto) trackSiteEvent("checkout_open", { motoId: moto.id });
    setCheckoutId(moto ? moto.id : null);
  }

  function rotateLogo() {
    const nextIndex = (logoIndex + 1) % 3;
    sessionStorage.setItem(LOGO_INDEX_KEY, String(nextIndex));
    window.dispatchEvent(new Event(LOGO_INDEX_EVENT));
  }

  const activeLogoPath = [
    loja.logoPath,
    loja.presentationLogoPath,
    "/brand/logo-moto-sena.jpg",
  ][logoIndex];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#111111] text-[#f5f2ea]">
      <CardNav
        logo={activeLogoPath}
        items={navItems}
        ctaHref={whatsappInterestHref}
        ctaLabel="WhatsApp"
        logoIndex={logoIndex}
        onRotateLogo={rotateLogo}
      />
      <Hero
        logoPath={activeLogoPath}
        onCheckout={() => setCheckoutMoto(selectedMoto ?? null)}
      />
      <CampaignReel />

      {siteState.settings.banner ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ff6a1a]/30 bg-[#1c1409]/95 px-4 py-3 text-center text-sm font-medium text-[#ff9556] backdrop-blur-sm">
          {siteState.settings.banner}
        </div>
      ) : null}

      <section
        id="modelos"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <motion.div {...fadeUp} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">
              Modelos em destaque
            </p>
            <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Veja cada moto de perto, em movimento, antes de visitar a loja.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
            Compare atributos, veja os modelos em movimento e confirme preço e
            disponibilidade direto com a Moto Sena.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {activeMotos.map((moto, index) => (
            <MotoCard
              key={moto.id}
              moto={moto}
              index={index}
              active={selectedMoto?.id === moto.id}
              onDetails={() => {
                trackSiteEvent("moto_click", { motoId: moto.id });
                chooseMoto(moto);
              }}
              onCheckout={() => setCheckoutMoto(moto)}
            />
          ))}
        </div>
      </section>

      {selectedMoto ? (
        <ProductDetail moto={selectedMoto} onCheckout={() => setCheckoutMoto(selectedMoto)} />
      ) : null}
      <EconomyCalculator />
      <HowToBuy />
      <Stores />
      <Footer logoPath={activeLogoPath} />

      {checkoutMoto ? (
        <Checkout
          moto={checkoutMoto}
          motos={activeMotos}
          onChangeMoto={setCheckoutId}
          onClose={() => setCheckoutMoto(null)}
        />
      ) : null}
    </main>
  );
}
