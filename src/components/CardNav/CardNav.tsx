"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import { loja } from "@/config/loja";
import { trackSiteEvent } from "@/lib/site/analytics";
import "./CardNav.css";

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

type CardNavProps = {
  items: CardNavItem[];
  logo: string;
  logoAlt?: string;
  ctaHref: string;
  ctaLabel?: string;
  ease?: string;
  showingPresentationLogo?: boolean;
  onTogglePresentationLogo?: () => void;
};

export default function CardNav({
  items,
  logo,
  logoAlt = loja.nome,
  ctaHref,
  ctaLabel = "WhatsApp",
  ease = "power3.out",
  showingPresentationLogo = false,
  onTogglePresentationLogo,
}: CardNavProps) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 292;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector<HTMLElement>(".card-nav-content");
      if (!contentEl) return 360;

      const previous = {
        visibility: contentEl.style.visibility,
        pointerEvents: contentEl.style.pointerEvents,
        position: contentEl.style.position,
        height: contentEl.style.height,
      };

      contentEl.style.visibility = "visible";
      contentEl.style.pointerEvents = "auto";
      contentEl.style.position = "static";
      contentEl.style.height = "auto";

      const topBar = 68;
      const padding = 16;
      const contentHeight = contentEl.scrollHeight;

      contentEl.style.visibility = previous.visibility;
      contentEl.style.pointerEvents = previous.pointerEvents;
      contentEl.style.position = previous.position;
      contentEl.style.height = previous.height;

      return topBar + contentHeight + padding;
    }

    return 292;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 68, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 42, opacity: 0 });

    const timeline = gsap.timeline({ paused: true });

    timeline.to(navEl, {
      height: calculateHeight,
      duration: 0.42,
      ease,
    });

    timeline.to(
      cardsRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.38,
        ease,
        stagger: 0.07,
      },
      "-=0.14"
    );

    // Quem pediu menos movimento no sistema vê o menu abrir instantâneo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timeline.timeScale(100);
    }

    return timeline;
  };

  useLayoutEffect(() => {
    const timeline = createTimeline();
    timelineRef.current = timeline;

    return () => {
      timeline?.kill();
      timelineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!timelineRef.current) return;

      timelineRef.current.kill();
      const newTimeline = createTimeline();
      if (newTimeline && isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        newTimeline.progress(1);
      }
      timelineRef.current = newTimeline;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const toggleMenu = () => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      timeline.play(0);
    } else {
      setIsHamburgerOpen(false);
      timeline.eventCallback("onReverseComplete", () => setIsExpanded(false));
      timeline.reverse();
    }
  };

  const closeMenu = () => {
    const timeline = timelineRef.current;
    if (!timeline || !isExpanded) return;

    setIsHamburgerOpen(false);
    timeline.eventCallback("onReverseComplete", () => setIsExpanded(false));
    timeline.reverse();
  };

  const setCardRef = (index: number) => (element: HTMLDivElement | null) => {
    if (element) cardsRef.current[index] = element;
  };

  return (
    <div className="card-nav-container">
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""}`}
        aria-label="Navegação principal"
      >
        <div className="card-nav-top">
          <button
            type="button"
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label={isExpanded ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isExpanded}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          <a href="#" className="logo-container" onClick={closeMenu}>
            <Image src={logo} alt={logoAlt} width={56} height={56} className="logo-image" priority />
            <span className="logo-copy">
              <span>{loja.nome}</span>
              <small>Elétricas premium</small>
            </span>
          </a>

          <a
            className="card-nav-cta-button"
            href={ctaHref}
            onClick={() => trackSiteEvent("whatsapp_click", { metadata: { source: "header" } })}
          >
            <WhatsAppIcon />
            <span>{ctaLabel}</span>
          </a>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded} inert={!isExpanded}>
          {items.slice(0, 3).map((item, index) => (
            <div
              key={item.label}
              ref={setCardRef(index)}
              className="nav-card"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links.map((link) => (
                  <a
                    key={link.label}
                    className="nav-card-link"
                    href={link.href}
                    aria-label={link.ariaLabel}
                    onClick={closeMenu}
                  >
                    <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          {onTogglePresentationLogo ? (
            <button
              type="button"
              className="logo-variant-toggle"
              onClick={onTogglePresentationLogo}
              aria-pressed={showingPresentationLogo}
            >
              {showingPresentationLogo ? "Usar logo padrão" : "Alternar logo de apresentação"}
            </button>
          ) : null}
        </div>
      </nav>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="whatsapp-icon"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M16.01 3.2A12.69 12.69 0 0 0 3.3 15.85c0 2.24.59 4.43 1.72 6.36L3.2 28.8l6.78-1.78a12.67 12.67 0 0 0 6.03 1.53h.01A12.69 12.69 0 0 0 28.8 15.89 12.72 12.72 0 0 0 16.01 3.2Zm.01 23.2h-.01a10.52 10.52 0 0 1-5.37-1.47l-.39-.23-4.02 1.05 1.07-3.91-.25-.4a10.44 10.44 0 0 1-1.6-5.59c0-5.82 4.74-10.55 10.58-10.55 2.82 0 5.48 1.1 7.48 3.1a10.48 10.48 0 0 1 3.1 7.49c0 5.8-4.76 10.51-10.59 10.51Zm5.8-7.88c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.56-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.62s1.13 3.04 1.29 3.25c.16.21 2.22 3.38 5.38 4.74.75.32 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z"
      />
    </svg>
  );
}
