"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Escolha o Modelo",
    text: "Explore nosso catálogo online ou visite nossa loja física.",
  },
  {
    number: "02",
    title: "Teste Grátis",
    text: "Sinta a potência elétrica em um test-ride exclusivo no Shopping.",
  },
  {
    number: "03",
    title: "Pagamento",
    text: "Condições facilitadas no PIX, cartão ou financiamento bancário.",
  },
  {
    number: "04",
    title: "Entrega",
    text: "Saia rodando da loja ou receba em casa com segurança total.",
  },
];

export default function HowToBuy() {
  const [activeStep, setActiveStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Detecta preferência de movimento reduzido
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldReduceMotion(true);
    }

    const listener = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [resetKey, shouldReduceMotion]);

  function selectStep(index: number) {
    setActiveStep(index);
    setResetKey((current) => current + 1);
  }

  // Calcula a porcentagem da linha de progresso
  const progressPercentage = (activeStep / (steps.length - 1)) * 100;

  return (
    <section id="comprar" className="scroll-mt-24 border-t border-white/[0.03] bg-[#151515] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">
            Quatro passos
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Como comprar
          </h2>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute bottom-6 left-[27px] top-6 z-0 w-0.5 bg-white/[0.08] md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:top-7 md:h-0.5 md:w-auto" />

          <div className="absolute bottom-6 left-[27px] top-6 z-0 w-0.5 overflow-hidden md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:top-7 md:h-0.5 md:w-auto">
            <motion.div
              className="absolute left-0 top-0 w-full bg-gradient-to-b from-[#ff6a1a] to-[#ff9556] md:hidden"
              animate={{ height: `${progressPercentage}%` }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute left-0 top-0 hidden h-full bg-gradient-to-r from-[#ff6a1a] to-[#ff9556] md:block"
              animate={{ width: `${progressPercentage}%` }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 flex flex-col gap-10 md:grid md:grid-cols-4 md:gap-6">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isPast = index < activeStep;

              return (
                <button
                  key={step.number}
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => selectStep(index)}
                  className="group flex cursor-pointer items-start gap-5 text-left md:flex-col md:items-center md:gap-0 md:text-center"
                >
                  <span className="relative shrink-0 md:mb-6">
                    <motion.span
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full border text-lg font-semibold transition-all duration-300",
                        isActive
                          ? "border-[#ff6a1a] bg-black/60 text-white shadow-[0_0_20px_rgba(255,106,26,0.25)]"
                          : isPast
                            ? "border-[#ff6a1a]/60 bg-[#161616] text-zinc-300"
                            : "border-zinc-800 bg-[#151515] text-zinc-500"
                      )}
                      animate={{ scale: isActive && !shouldReduceMotion ? 1.08 : 1 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 300, damping: 20 }
                      }
                    >
                      {step.number}
                    </motion.span>
                    {isActive && !shouldReduceMotion ? (
                      <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-[#ff6a1a] opacity-20" />
                    ) : null}
                  </span>

                  <span
                    className={cn(
                      "pt-2 transition-all duration-300 md:pt-0",
                      isActive ? "translate-y-0 opacity-100" : "opacity-60 group-hover:opacity-85"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-lg font-semibold tracking-wide transition-colors duration-300",
                        isActive ? "text-white" : "text-zinc-300"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="mt-2 block max-w-[260px] text-sm leading-relaxed text-zinc-400 md:mx-auto">
                      {step.text}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

