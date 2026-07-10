"use client";

import Image from "next/image";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { campaignReel } from "@/data/campanhas";
import { fadeUp } from "@/lib/motion";
import { whatsappInterestHref } from "@/lib/whatsapp";

export default function CampaignReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeClip = campaignReel[activeIndex];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [activeClip.id, inView]);

  function activate(index: number) {
    if (index !== activeIndex) setActiveIndex(index);
  }

  function advance() {
    setActiveIndex((index) => (index + 1) % campaignReel.length);
  }

  return (
    <section ref={sectionRef} id="novidades" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <motion.div {...fadeUp} className="flex h-[430px] gap-2 sm:h-[500px]">
          {campaignReel.map((clip, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={clip.id}
                type="button"
                onClick={() => activate(index)}
                onMouseEnter={() => activate(index)}
                onFocus={() => activate(index)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`${isActive ? "Vídeo em exibição" : "Exibir vídeo"}: ${clip.title}`}
                className={`relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] text-left shadow-xl shadow-black/20 transition-[flex,filter,transform] duration-700 ease-out focus:outline-none focus:ring-2 focus:ring-[#ff9556] ${
                  isActive ? "flex-[5]" : "flex-[0.55] cursor-pointer grayscale-[0.45] hover:grayscale-0"
                }`}
              >
                {isActive ? (
                  <motion.video
                    ref={videoRef}
                    key={clip.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.42 }}
                    className="h-full w-full object-cover"
                    src={inView ? clip.video : undefined}
                    poster={clip.poster}
                    autoPlay
                    muted
                    playsInline
                    controls={false}
                    controlsList="nodownload noremoteplayback noplaybackrate"
                    disablePictureInPicture
                    disableRemotePlayback
                    draggable={false}
                    onContextMenu={(event) => event.preventDefault()}
                    onEnded={advance}
                    preload="metadata"
                  />
                ) : (
                  <Image src={clip.poster} alt="" fill sizes="96px" className="object-cover" />
                )}
                <span className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent ${isActive ? "" : "bg-black/35"}`} />
                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block text-base font-semibold text-white sm:text-lg">{clip.title}</span>
                    <span className="mt-1 block max-w-sm text-sm leading-5 text-zinc-200">{clip.description}</span>
                  </span>
                ) : (
                  <span className="absolute inset-x-0 bottom-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white [writing-mode:vertical-rl]">{clip.title}</span>
                )}
              </button>
            );
          })}
        </motion.div>

        <motion.div {...fadeUp} className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">Na Moto Sena</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-white sm:text-5xl">Veja a Moto Sena de perto.</h2>
          <p className="mt-5 leading-7 text-zinc-400">Modelos, atendimento e tecnologia em vídeos reais da loja no Shopping Nova Iguaçu.</p>
          <ul className="mt-7 grid gap-3 text-sm leading-6 text-zinc-300">
            {[
              "Conheça os modelos disponíveis na loja.",
              "Veja detalhes que fazem diferença no dia a dia.",
              "Fale direto com a equipe da Moto Sena.",
            ].map((item) => (
              <li key={item} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-[#ff9556]" />{item}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#modelos" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#e85d04] px-4 text-sm font-semibold text-white transition hover:bg-[#ff6a1a]">Ver modelos <ArrowRight className="h-4 w-4" /></a>
            <a href={whatsappInterestHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold text-white transition hover:bg-white/10"><MessageCircle className="h-4 w-4" />Falar no WhatsApp</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
