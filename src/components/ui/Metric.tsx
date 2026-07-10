"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Valor numérico animado: conta de 0 até o total quando entra na tela e
 * desliza do valor anterior para o novo quando o usuário muda os inputs.
 */
function AnimatedValue({
  count,
  format,
}: {
  count: number;
  format: (value: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (!inView) return;

    const from = currentRef.current;
    const start = performance.now();
    const duration = 700;
    let raf: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (count - from) * eased;
      currentRef.current = value;
      setDisplay(value);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, count]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(display)}
    </span>
  );
}

export default function Metric({
  label,
  value,
  count,
  format,
  emphasis = false,
  positive = false,
}: {
  label: string;
  /** Valor textual fixo (usado quando não há `count`). */
  value?: string;
  /** Valor numérico — entra com contagem animada de 0 até o total. */
  count?: number;
  /** Formatação do valor animado (ex: moeda, "km"). */
  format?: (value: number) => string;
  /** Destaque dourado no valor. */
  emphasis?: boolean;
  /** Quadro verde de resultado positivo (economia). */
  positive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-4",
        positive ? "border-emerald-500/25 bg-emerald-500/[0.07]" : "border-white/10 bg-black/25"
      )}
    >
      <p
        className={cn(
          "text-xs uppercase tracking-[0.16em]",
          positive ? "text-emerald-400/80" : "text-zinc-400"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold",
          positive ? "text-emerald-400" : emphasis ? "text-[#ff9556]" : "text-white"
        )}
      >
        {count != null && format ? <AnimatedValue count={count} format={format} /> : value}
      </p>
    </div>
  );
}
