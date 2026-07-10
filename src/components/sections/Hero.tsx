"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Calculator, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loja } from "@/config/loja";
import { campaignHero } from "@/data/campanhas";

type HeroProps = {
  logoPath: string;
  onCheckout: () => void;
};

function HeroCampaignVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.15),
      { threshold: [0, 0.15] }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    if (isVisible) video.play().catch(() => {});
    else video.pause();
  }, [isVisible, muted]);

  return (
    <div ref={containerRef} className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-2xl shadow-black/40">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={campaignHero.video}
        poster={campaignHero.poster}
        autoPlay
        muted={muted}
        loop
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        onContextMenu={(event) => event.preventDefault()}
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff9556]">Na loja</p>
        <p className="mt-1 text-lg font-semibold text-white">{campaignHero.title}</p>
        <p className="mt-1 text-sm text-zinc-200">{campaignHero.description}</p>
      </div>
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        aria-pressed={!muted}
        className="absolute right-3 top-3 inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-[#e85d04]"
      >
        {muted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        {muted ? "Ouvir áudio" : "Silenciar"}
      </button>
    </div>
  );
}

export default function Hero({ logoPath, onCheckout }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 lg:min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(255,106,26,0.18),transparent_34%),linear-gradient(135deg,#111111_0%,#151515_46%,#090909_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#111111] to-transparent" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-7 px-4 pb-14 sm:px-6 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-0 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: "easeOut" }} className="max-w-2xl lg:self-end">
          <div className="flex items-center gap-4">
            <Image src={logoPath} alt={loja.nome} width={72} height={72} priority className="h-16 w-16 rounded-lg border border-[#ff6a1a]/40 object-cover shadow-xl shadow-black/40 sm:h-[72px] sm:w-[72px]" />
            <div>
              <p className="text-lg font-bold uppercase tracking-[0.18em] text-white">{loja.nome}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a1a]">{loja.cidadesResumo}</p>
            </div>
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">Motos elétricas em Nova Iguaçu com presença de verdade.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">Veja os modelos em movimento, compare opções e fale com a Moto Sena no Shopping Nova Iguaçu.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96, x: 24 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.75, ease: "easeOut", delay: 0.1 }} className="relative mx-auto w-full max-w-sm lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroCampaignVideo />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.16 }} className="max-w-2xl lg:col-start-1 lg:row-start-2 lg:mt-8 lg:self-start">
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#modelos" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#e85d04] px-5 text-sm font-semibold text-white shadow-xl shadow-orange-950/30 transition hover:bg-[#ff6a1a]">Ver modelos <ArrowRight className="h-4 w-4" /></a>
            <a href="#economia" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Simular economia <Calculator className="h-4 w-4" /></a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Pix e cartão", "Retirada na loja", "Entrega sob consulta"].map((label) => <span key={label} className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300">{label}</span>)}
          </div>
          <button type="button" onClick={onCheckout} className="mt-5 text-sm font-semibold text-[#ff9556] transition hover:text-white">Quero falar sobre um modelo</button>
        </motion.div>
      </div>
    </section>
  );
}
