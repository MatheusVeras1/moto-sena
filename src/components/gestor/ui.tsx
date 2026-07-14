"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Entrada padrão dos blocos do painel: sobe suave, em cascata. */
export const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

/** Contagem animada de números nos KPIs (efeito "subindo até o valor"). */
export function useCountUp(target: number, duration = 850) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/** Selo de tendência: verde subindo, vermelho caindo. */
export function TrendBadge({
  delta,
  className,
  suffix = "%",
}: {
  delta: number;
  className?: string;
  suffix?: string;
}) {
  const positive = delta >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums",
        positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/15 text-[#f87171]",
        className
      )}
      title={`${positive ? "Subiu" : "Caiu"} ${Math.abs(delta)}${suffix} vs período anterior`}
    >
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {positive ? "+" : ""}
      {delta}{suffix}
    </span>
  );
}

export function Card({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-lg border border-white/10 bg-[#1b1b1b] p-5 transition-colors duration-300 hover:border-gestor-gold/30",
        className
      )}
    >
      {title ? (
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gestor-gold/25 bg-gestor-gold/10">
              <Icon className="h-4 w-4 text-gestor-gold-soft" />
            </span>
          ) : null}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  count,
  hint,
  icon: Icon,
  delta,
  deltaSuffix,
}: {
  label: string;
  /** Valor textual (usado quando não há `count`). */
  value?: string;
  /** Valor numérico — entra com contagem animada. */
  count?: number;
  hint?: string;
  icon?: LucideIcon;
  delta?: number;
  deltaSuffix?: string;
}) {
  const animated = useCountUp(count ?? 0);
  const display = count != null ? animated.toLocaleString("pt-BR") : value ?? "";

  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-[#1b1b1b] p-5 transition-colors duration-300 hover:border-gestor-gold/30">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-gestor-gold" /> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
        {display}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {delta != null ? <TrendBadge delta={delta} suffix={deltaSuffix} /> : null}
        {hint ? <p className="text-xs text-zinc-400">{hint}</p> : null}
      </div>
    </div>
  );
}

/**
 * Barra horizontal de magnitude: cor única (dourado), ponta do dado
 * arredondada, trilha sutil, rótulo direto e crescimento animado.
 */
export function BarRow({
  label,
  value,
  max,
  valueLabel,
  trend,
}: {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
  trend?: number;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  const display = valueLabel ?? value.toLocaleString("pt-BR");

  return (
    <div
      className={cn(
        "grid items-center gap-3",
        trend != null
          ? "grid-cols-[minmax(0,9rem)_1fr_auto_3.4rem]"
          : "grid-cols-[minmax(0,10rem)_1fr_auto]"
      )}
      title={`${label}: ${display}`}
    >
      <span className="truncate text-sm text-zinc-300">{label}</span>
      <span className="h-3 overflow-hidden rounded-r bg-white/[0.05]">
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="block h-full rounded-r bg-gestor-gold"
        />
      </span>
      <span className="text-sm font-semibold tabular-nums text-white">{display}</span>
      {trend != null ? <TrendBadge delta={trend} className="justify-self-end" /> : null}
    </div>
  );
}
