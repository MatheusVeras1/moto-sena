"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Metric from "@/components/ui/Metric";
import { money } from "@/lib/format";
import { fadeUp } from "@/lib/motion";
import { trackSiteEvent } from "@/lib/site/analytics";

// Valores de referência para a simulação comercial — não são medição real.
// Consumo médio estimado de moto elétrica urbana, em kWh por km rodado.
const KWH_POR_KM = 0.035;
// Tarifa média de energia residencial estimada, em R$ por kWh.
const TARIFA_ENERGIA_KWH = 1.05;

export default function EconomyCalculator() {
  const [dailyKm, setDailyKm] = useState(24);
  const [days, setDays] = useState(24);
  const [gasCost, setGasCost] = useState(520);
  const tracked = useRef(false);

  const estimate = useMemo(() => {
    const monthlyKm = Math.max(0, dailyKm) * Math.max(0, days);
    const electricCost = monthlyKm * KWH_POR_KM * TARIFA_ENERGIA_KWH;
    const savings = Math.max(0, gasCost - electricCost);

    return { monthlyKm, electricCost, savings };
  }, [dailyKm, days, gasCost]);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      trackSiteEvent("economy_calculator", {
        metadata: { dailyKm, days, gasCost },
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [dailyKm, days, gasCost]);

  return (
    <section id="economia" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">
            Simulador de economia
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-white sm:text-5xl">
            Quanto sobra no seu bolso longe da bomba?
          </h2>
          <p className="mt-5 leading-7 text-zinc-400">
            Informe quanto você roda e gasta hoje com gasolina e compare com o
            custo de carregar uma moto elétrica na tomada. O resultado é uma
            estimativa e varia conforme uso, bateria e tarifa de energia.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#1b1b1b] p-5 shadow-xl shadow-black/20">
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberInput label="Km por dia" value={dailyKm} onChange={setDailyKm} />
            <NumberInput label="Dias por mês" value={days} onChange={setDays} />
            <NumberInput label="Gasto atual gasolina" value={gasCost} onChange={setGasCost} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric
              label="Km estimados no mês"
              count={estimate.monthlyKm}
              format={(value) => `${Math.round(value)} km`}
            />
            <Metric label="Energia estimada" count={estimate.electricCost} format={money} />
            <Metric
              label="Economia possível"
              count={estimate.savings}
              format={money}
              positive
            />
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-400">
            Simulação estimada. Valores podem variar conforme uso, bateria,
            peso, relevo e tarifa de energia.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>
      {/* inputMode garante teclado numérico; text-base evita zoom do iOS. */}
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none transition focus:border-[#ff6a1a] sm:text-sm"
      />
    </label>
  );
}
