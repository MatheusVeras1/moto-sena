"use client";

import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [resetKey]);

  function handleStepClick(index: number) {
    setActiveStep(index);
    setResetKey((prev) => prev + 1);
  }

  // Calcula a porcentagem da linha de progresso
  const progressPercentage = (activeStep / (steps.length - 1)) * 100;

  return (
    <section
      id="comprar"
      className="scroll-mt-24 bg-[#111111] py-20 border-t border-white/[0.03]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Título Centralizado */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Como comprar
          </h2>
        </div>

        {/* Linha do Tempo */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          {/* Linha de Conexão (Fundo) */}
          <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-white/[0.08] md:left-[12.5%] md:right-[12.5%] md:top-7 md:h-0.5 md:w-auto z-0" />

          {/* Linha de Conexão (Ativa com Progresso Animado) */}
          <div className="absolute left-[27px] top-6 bottom-6 w-0.5 md:left-[12.5%] md:right-[12.5%] md:top-7 md:h-0.5 md:w-auto z-0 overflow-hidden">
            {/* Progresso Mobile (Vertical) */}
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#ff6a1a] to-[#ff9556] md:hidden"
              initial={{ height: "0%" }}
              animate={{ height: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            {/* Progresso Desktop (Horizontal) */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff6a1a] to-[#ff9556] hidden md:block"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>

          {/* Passos */}
          <div className="relative z-10 flex flex-col gap-10 md:grid md:grid-cols-4 md:gap-6">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isPast = index < activeStep;

              return (
                <div
                  key={step.number}
                  className="group flex items-start gap-5 md:flex-col md:items-center md:text-center md:gap-0 cursor-pointer"
                  onClick={() => handleStepClick(index)}
                >
                  {/* Círculo com Número */}
                  <div className="relative shrink-0 md:mb-6">
                    <motion.div
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border font-semibold text-lg transition-all duration-300",
                        isActive
                          ? "border-[#ff6a1a] text-white bg-black/60 shadow-[0_0_20px_rgba(255,106,26,0.25)]"
                          : isPast
                          ? "border-[#ff6a1a]/60 text-zinc-300 bg-[#161616]"
                          : "border-zinc-800 text-zinc-500 bg-[#151515]"
                      )}
                      animate={{
                        scale: isActive ? 1.08 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Efeito Glow Pulsante no Ativo */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full border border-[#ff6a1a] animate-ping opacity-20 pointer-events-none" />
                    )}
                  </div>

                  {/* Textos */}
                  <div
                    className={cn(
                      "pt-2 md:pt-0 transition-all duration-300",
                      isActive ? "opacity-100 transform translate-y-0" : "opacity-60 hover:opacity-85"
                    )}
                  >
                    <h3
                      className={cn(
                        "text-lg font-semibold tracking-wide transition-colors duration-300",
                        isActive ? "text-white" : "text-zinc-300"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400 max-w-[260px] md:mx-auto">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

