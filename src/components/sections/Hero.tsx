"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Calculator } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { loja } from "@/config/loja";
import { heroPoster, heroVideo, type Moto } from "@/data/motos";

type HeroProps = {
  featuredMotoId?: string;
  motos: Moto[];
  onCheckout: () => void;
};

type PlaylistItem = {
  id: string;
  name: string;
  video: string;
  poster: string;
};

// Duração do crossfade entre vídeos da playlist.
const HERO_FADE_MS = 500;

export default function Hero({ featuredMotoId, motos, onCheckout }: HeroProps) {
  const playlist = useMemo<PlaylistItem[]>(() => {
    const heroMotos = motos.filter(
      (moto): moto is Moto & { heroVideo: string } => Boolean(moto.heroVideo)
    );

    if (heroMotos.length === 0) {
      return [
        {
          id: "hero-fallback",
          name: loja.nome,
          video: heroVideo,
          poster: heroPoster,
        },
      ];
    }

    const featured = heroMotos.find((moto) => moto.id === featuredMotoId);
    const orderedMotos = featured
      ? [featured, ...heroMotos.filter((moto) => moto.id !== featured.id)]
      : heroMotos;

    return orderedMotos.map((moto) => ({
      id: moto.id,
      name: moto.name,
      video: moto.heroVideo,
      poster: moto.poster,
    }));
  }, [featuredMotoId, motos]);

  const playlistKey = playlist.map((item) => item.id).join("|");

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 lg:min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(255,106,26,0.18),transparent_34%),linear-gradient(135deg,#111111_0%,#151515_46%,#090909_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#111111] to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-7 px-4 pb-14 sm:px-6 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-0 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-2xl lg:self-end"
        >
          <div className="flex items-center gap-4">
            <Image
              src={loja.logoPath}
              alt={loja.nome}
              width={72}
              height={72}
              priority
              className="h-16 w-16 rounded-lg border border-[#ff6a1a]/40 object-cover shadow-xl shadow-black/40 sm:h-[72px] sm:w-[72px]"
            />
            <div>
              <p className="text-lg font-bold uppercase tracking-[0.18em] text-white">
                {loja.nome}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a1a]">
                {loja.cidadesResumo}
              </p>
            </div>
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Motos elétricas em Nova Iguaçu com presença de verdade.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
            Veja os modelos em movimento, compare opções e fale com a Moto Sena
            no Shopping Nova Iguaçu para confirmar disponibilidade.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.75, ease: "easeOut", delay: 0.1 }}
          className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          {/* key remonta o player quando a playlist muda, zerando o estado. */}
          <HeroPlayer key={playlistKey} playlist={playlist} onCheckout={onCheckout} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.16 }}
          className="max-w-2xl lg:col-start-1 lg:row-start-2 lg:mt-8 lg:self-start"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#modelos"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#e85d04] px-5 text-sm font-semibold text-white shadow-xl shadow-red-950/30 transition hover:bg-[#ff6a1a]"
            >
              Ver modelos
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#economia"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Simular economia
              <Calculator className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Pix e cartão", "Retirada na loja", "Entrega sob consulta"].map((label) => (
              <span
                key={label}
                className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Player da hero com dois vídeos sobrepostos: enquanto um toca, o outro já
 * baixa o próximo da playlist em segundo plano. A troca só acontece quando o
 * próximo está pronto, em crossfade por cima do atual — nunca há tela preta
 * nem espera visível entre as motos.
 */
function HeroPlayer({
  playlist,
  onCheckout,
}: {
  playlist: PlaylistItem[];
  onCheckout: () => void;
}) {
  const slot0Ref = useRef<HTMLVideoElement>(null);
  const slot1Ref = useRef<HTMLVideoElement>(null);
  const pendingRef = useRef<number | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasPlaylist = playlist.length > 1;

  // Qual vídeo da playlist cada player segura (null = player ocioso).
  const [slotIndices, setSlotIndices] = useState<[number | null, number | null]>(() => [
    0,
    playlist.length > 1 ? 1 : null,
  ]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  // Player que acabou de sair de cena: fica visível por baixo até o fade acabar.
  const [outgoingSlot, setOutgoingSlot] = useState<0 | 1 | null>(null);
  // Primeiro frame já rodou? Antes disso, o poster segura a imagem.
  const [started, setStarted] = useState(false);

  const currentIndex = Math.min(slotIndices[activeSlot] ?? 0, playlist.length - 1);
  const currentVideo = playlist[currentIndex] ?? playlist[0];

  function slotRef(slot: 0 | 1) {
    return slot === 0 ? slot0Ref : slot1Ref;
  }

  // Dá o play no player ativo na montagem (autoplay controlado por código).
  useEffect(() => {
    const video = slot0Ref.current;
    video?.play().catch(() => {});

    return () => {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, []);

  function doSwap(slot: 0 | 1) {
    pendingRef.current = null;
    const video = slotRef(slot).current;
    if (video) {
      try {
        video.currentTime = 0;
      } catch {
        // vídeo ainda sem metadata; o play resolve sozinho
      }
      video.play().catch(() => {});
    }

    const previous = slot === 0 ? 1 : 0;
    setActiveSlot(slot);
    setOutgoingSlot(previous);

    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    cleanupTimerRef.current = setTimeout(() => {
      setOutgoingSlot(null);
      slotRef(previous).current?.pause();
      // O player que saiu de cena começa a baixar o próximo da fila.
      setSlotIndices((prev) => {
        const next: [number | null, number | null] = [prev[0], prev[1]];
        const upcoming = ((prev[slot] ?? 0) + 1) % playlist.length;
        next[previous] = upcoming === prev[slot] ? null : upcoming;
        return next;
      });
    }, HERO_FADE_MS + 120);
  }

  function requestSwap(target: number) {
    if (!hasPlaylist) return;

    const nextIndex = ((target % playlist.length) + playlist.length) % playlist.length;
    if (nextIndex === currentIndex) return;

    const inactive = activeSlot === 0 ? 1 : 0;
    const inactiveVideo = slotRef(inactive).current;

    if (slotIndices[inactive] === nextIndex && inactiveVideo && inactiveVideo.readyState >= 3) {
      // Próximo já está baixado: troca imediata.
      doSwap(inactive);
      return;
    }

    // Ainda não está pronto: aponta o player ocioso pra ele e troca no canplay.
    // O vídeo atual continua na tela enquanto isso — nada de preto.
    pendingRef.current = nextIndex;
    setSlotIndices((prev) => {
      const next: [number | null, number | null] = [prev[0], prev[1]];
      next[inactive] = nextIndex;
      return next;
    });
  }

  function handleCanPlay(slot: 0 | 1) {
    if (slot === activeSlot) return;
    if (pendingRef.current !== null && slotIndices[slot] === pendingRef.current) {
      doSwap(slot);
    }
  }

  function handlePlaying(slot: 0 | 1) {
    if (slot === activeSlot) setStarted(true);
  }

  function handleError(slot: 0 | 1) {
    if (slot === activeSlot) {
      setStarted(true);
    } else if (pendingRef.current !== null && slotIndices[slot] === pendingRef.current) {
      // Próximo falhou: desiste da troca e segue no vídeo atual.
      pendingRef.current = null;
    }
  }

  function handleEnded(slot: 0 | 1) {
    if (slot !== activeSlot) return;
    // Se o próximo ainda não estiver pronto, o último frame segura a imagem
    // até o canplay disparar a troca.
    requestSwap(currentIndex + 1);
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] shadow-2xl shadow-black/40">
      {/* Poster segura a imagem até o primeiro frame do primeiro vídeo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentVideo.poster}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-500 ${
          started ? "opacity-0" : "opacity-100"
        }`}
      />

      {([0, 1] as const).map((slot) => {
        const index = slotIndices[slot];
        if (index === null) return null;
        const item = playlist[Math.min(index, playlist.length - 1)];
        if (!item) return null;

        const isActive = slot === activeSlot;
        const isOutgoing = slot === outgoingSlot;
        const visible = isActive ? started : isOutgoing;

        return (
          <video
            key={slot}
            ref={slotRef(slot)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-out ${
              isActive ? "z-20" : "z-10"
            } ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDuration: `${HERO_FADE_MS}ms` }}
            src={item.video}
            muted
            loop={!hasPlaylist}
            onEnded={() => handleEnded(slot)}
            onCanPlay={() => handleCanPlay(slot)}
            onPlaying={() => handlePlaying(slot)}
            onError={() => handleError(slot)}
            controls={false}
            controlsList="nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
            disableRemotePlayback
            draggable={false}
            onContextMenu={(event) => event.preventDefault()}
            playsInline
            preload="auto"
          />
        );
      })}

      {hasPlaylist ? (
        <div className="absolute right-2 top-2 z-30 sm:right-3 sm:top-3">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2 py-1.5 backdrop-blur-md">
            {playlist.map((item, index) => {
              const active = index === currentIndex;

              return (
                // Pílula compacta como antes; o after:: invisível amplia a
                // área de toque de cada bolinha sem mudar o visual.
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Mostrar animação da ${item.name}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => requestSwap(index)}
                  className={`relative h-2 cursor-pointer rounded-full transition-all duration-300 after:absolute after:-inset-x-1.5 after:-inset-y-3.5 after:content-[''] ${
                    active
                      ? "w-5 bg-[#ff9556] shadow-[0_0_14px_rgba(240,200,106,0.5)]"
                      : "w-2 bg-white/45 hover:bg-white/80"
                  }`}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#ff6a1a]">{loja.nome}</p>
          <p className="text-sm font-medium text-white sm:text-base">
            Sua próxima moto não pede gasolina.
          </p>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="hidden rounded-md bg-white px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-[#ff9556] sm:inline-flex"
        >
          Comprar agora
        </button>
      </div>
    </div>
  );
}
