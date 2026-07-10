"use client";

import { useEffect, useRef, useState } from "react";

type LazyVideoProps = {
  src: string;
  poster: string;
  className?: string;
  loop?: boolean;
  onEnded?: () => void;
  /**
   * Quando true, o vídeo começa a carregar e tocar imediatamente
   * (uso: hero, modal de checkout). Quando false, só carrega/toca ao
   * entrar na viewport e pausa ao sair — economiza dados no celular.
   */
  eager?: boolean;
};

export default function LazyVideo({
  src,
  poster,
  className,
  loop = true,
  onEnded,
  eager = false,
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(eager);
  const [visible, setVisible] = useState(eager);

  // Observa a viewport: ativa o download na primeira aparição e
  // pausa/retoma o loop conforme o vídeo entra e sai da tela.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || eager) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            setVisible(true);
          } else {
            setVisible(false);
          }
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [eager]);

  // Toca quando visível (inclusive após troca de src, ex: modelo selecionado).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;

    if (visible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active, visible, src]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={active ? src : undefined}
      poster={poster}
      autoPlay={eager}
      muted
      loop={loop}
      onEnded={onEnded}
      controls={false}
      controlsList="nodownload noremoteplayback noplaybackrate"
      disablePictureInPicture
      disableRemotePlayback
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      playsInline
      preload={eager ? "auto" : "none"}
    />
  );
}
