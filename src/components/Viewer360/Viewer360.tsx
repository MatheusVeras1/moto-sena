"use client";

import { Rotate3d } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackSiteEvent } from "@/lib/site/analytics";
import { cn } from "@/lib/utils";

type Viewer360Props = {
  src: string;
  poster: string;
  motoId?: string;
  className?: string;
};

// Tempo parado após soltar o arrasto antes do giro automático voltar.
const RESUME_DELAY_MS = 1600;
// Quantas voltas completas um arrasto de ponta a ponta da tela dá.
const DRAG_SENSITIVITY = 1.1;

/**
 * Apresenta o vídeo em loop como um objeto 3D girando: o visitante toca e
 * arrasta para girar a moto no ângulo que quiser (o arrasto controla o
 * currentTime do loop). Ao soltar, o giro automático retoma sozinho.
 */
export default function Viewer360({ src, poster, motoId, className }: Viewer360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const dragRef = useRef<{ startX: number; startTime: number; width: number } | null>(null);
  const pendingSeek = useRef<number | null>(null);
  const isSeeking = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  // Carrega e gira só quando a seção aparece na tela; pausa ao sair.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Retoma o giro quando o modelo selecionado muda.
  useEffect(() => {
    if (active) videoRef.current?.play().catch(() => {});
  }, [active, src]);

  useEffect(
    () => () => {
      if (resumeTimer.current !== null) window.clearTimeout(resumeTimer.current);
    },
    []
  );

  // Aplica no máximo um seek por vez; o mais recente vence (giro sem engasgo).
  function applyPendingSeek() {
    const video = videoRef.current;
    if (!video || isSeeking.current || pendingSeek.current === null) return;

    isSeeking.current = true;
    video.currentTime = pendingSeek.current;
    pendingSeek.current = null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !Number.isFinite(video.duration)) return;

    container.setPointerCapture(event.pointerId);
    if (resumeTimer.current !== null) window.clearTimeout(resumeTimer.current);
    video.pause();
    setHasInteracted(true);
    if (!hasInteracted) trackSiteEvent("viewer_360", { motoId });
    dragRef.current = {
      startX: event.clientX,
      startTime: video.currentTime,
      width: container.getBoundingClientRect().width,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const video = videoRef.current;
    const drag = dragRef.current;
    if (!video || !drag) return;

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const deltaTurns = ((event.clientX - drag.startX) / drag.width) * DRAG_SENSITIVITY;
    const rawTime = drag.startTime - deltaTurns * duration;
    // O loop é uma volta completa: passou do fim, continua do começo.
    const wrapped = ((rawTime % duration) + duration) % duration;

    pendingSeek.current = wrapped;
    applyPendingSeek();
  }

  function endDrag() {
    if (!dragRef.current) return;

    dragRef.current = null;
    resumeTimer.current = window.setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, RESUME_DELAY_MS);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative cursor-grab touch-pan-y select-none active:cursor-grabbing",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <video
        ref={videoRef}
        className="pointer-events-none aspect-video w-full object-cover"
        src={active ? src : undefined}
        poster={poster}
        muted
        loop
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        onContextMenu={(event) => event.preventDefault()}
        playsInline
        preload="none"
        onSeeked={() => {
          isSeeking.current = false;
          applyPendingSeek();
        }}
      />

      <span className="pointer-events-none absolute right-3 top-3 rounded-md border border-[#ff6a1a]/40 bg-black/55 px-2.5 py-1 text-xs font-bold tracking-[0.14em] text-[#ff9556] backdrop-blur-sm">
        360°
      </span>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-opacity duration-500",
          hasInteracted ? "opacity-0" : "opacity-100"
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
          <Rotate3d className="h-4 w-4 text-[#ff9556]" />
          Arraste para girar a moto
        </span>
      </div>
    </div>
  );
}
