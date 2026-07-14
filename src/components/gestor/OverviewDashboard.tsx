"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  ArrowRight,
  Bike,
  Calculator,
  CalendarDays,
  ChartNoAxesCombined,
  Clock,
  Eye,
  Filter,
  Lightbulb,
  MapPin,
  MessageCircle,
  Percent,
  Share2,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import { money } from "@/lib/format";
import type { AdminOverview } from "@/lib/site/types";
import { cn } from "@/lib/utils";
import { BarRow, Card, StatTile, rise } from "./ui";

type RangeValue = 7 | 30 | 90;

export function emptyOverview(): AdminOverview {
  return {
    visitas: 0,
    cliquesWhatsApp: 0,
    pedidosEnviados: 0,
    visitasDelta: null,
    cliquesDelta: null,
    pedidosDelta: null,
    visitantesUnicos: 0,
    contatosWhatsAppUnicos: 0,
    visitantesDelta: null,
    contatosWhatsAppDelta: null,
    conversaoPedido: 0,
    conversaoDeltaPp: null,
    atendimento: { novos: 0, emAtendimento: 0, maisAntigoNovoEm: null },
    serieDiaria: [],
    modeloLiderId: "x13-1000w",
    motosMaisVistas: [],
    modelosDesempenho: [],
    funil: [],
    horarios: Array.from({ length: 24 }, () => 0),
    origens: [],
    cidades: [],
    calculadora: null,
    periodo: { label: "Últimos 30 dias", month: null, range: 30, mesesDisponiveis: [] },
  };
}

function monthLabel(month: string) {
  const [year, mm] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, mm - 1, 15)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function relativeAge(iso: string | null) {
  if (!iso) return "Nenhum pedido novo aguardando";
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `Mais antigo aguarda há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Mais antigo aguarda há ${hours}h`;
  return `Mais antigo aguarda há ${Math.floor(hours / 24)} dias`;
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center text-sm leading-6 text-zinc-400">
      {children}
    </p>
  );
}

function shortDate(date?: string) {
  return date
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
        new Date(`${date}T12:00:00`)
      )
    : "—";
}

function AreaMetricChart({
  label,
  color,
  data,
}: {
  label: string;
  color: string;
  data: Array<{ data: string; value: number }>;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = `area-${useId().replace(/:/g, "")}`;
  const width = 420;
  const height = 170;
  const chartLeft = 12;
  const chartRight = width - 12;
  const chartTop = 18;
  const chartBottom = 140;
  const chartHeight = chartBottom - chartTop;
  const values = data.map((item) => item.value);
  const max = Math.max(...values, 1);
  const total = values.reduce((sum, value) => sum + value, 0);
  const peakIndex = values.reduce(
    (best, value, index) => (value > values[best] ? index : best),
    0
  );
  const pointAt = (value: number, index: number) => ({
    x:
      values.length > 1
        ? chartLeft + (index / (values.length - 1)) * (chartRight - chartLeft)
        : width / 2,
    y: chartBottom - (value / max) * chartHeight,
  });
  const points = values.map(pointAt);
  const linePath =
    values.length === 1
      ? `M ${chartLeft} ${points[0].y} L ${chartRight} ${points[0].y}`
      : points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const areaPath =
    values.length === 1
      ? `M ${chartLeft} ${chartBottom} L ${chartLeft} ${points[0].y} L ${chartRight} ${points[0].y} L ${chartRight} ${chartBottom} Z`
      : `M ${points[0].x} ${chartBottom} ${points
          .map((point) => `L ${point.x} ${point.y}`)
          .join(" ")} L ${points.at(-1)?.x ?? chartRight} ${chartBottom} Z`;
  const selectedIndex = activeIndex ?? peakIndex;
  const selected = data[selectedIndex];
  const selectedPoint = points[selectedIndex];
  const middle = data[Math.floor(data.length / 2)]?.data;

  const selectFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    setActiveIndex(Math.round(ratio * (data.length - 1)));
  };

  const moveSelection = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") return setActiveIndex(0);
    if (event.key === "End") return setActiveIndex(data.length - 1);
    const current = activeIndex ?? data.length - 1;
    setActiveIndex(
      event.key === "ArrowLeft"
        ? Math.max(0, current - 1)
        : Math.min(data.length - 1, current + 1)
    );
  };

  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-black/25 p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">{label}</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{total.toLocaleString("pt-BR")}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Média {(total / data.length).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}/dia · pico {values[peakIndex].toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-[#111111] px-2.5 py-2 text-right" aria-live="polite">
          <p className="truncate text-[11px] text-zinc-500">{activeIndex === null ? "Pico do período" : shortDate(selected.data)}</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">{selected.value.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      <div
        className="mt-3 cursor-crosshair rounded-md outline-none ring-offset-2 ring-offset-[#171717] focus-visible:ring-2"
        style={{ "--tw-ring-color": color } as React.CSSProperties}
        tabIndex={0}
        role="group"
        aria-label={`${label} por dia. Use as setas para navegar entre as datas.`}
        onPointerMove={selectFromPointer}
        onPointerLeave={() => setActiveIndex(null)}
        onFocus={() => setActiveIndex((current) => current ?? data.length - 1)}
        onBlur={() => setActiveIndex(null)}
        onKeyDown={moveSelection}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.34" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.33, 0.66, 1].map((step) => {
            const y = chartTop + step * chartHeight;
            return <line key={step} x1={chartLeft} y1={y} x2={chartRight} y2={y} stroke="rgba(255,255,255,.08)" strokeDasharray="3 5" />;
          })}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {selectedPoint ? (
            <g>
              <line x1={selectedPoint.x} y1={chartTop} x2={selectedPoint.x} y2={chartBottom} stroke={color} strokeOpacity="0.28" strokeDasharray="3 4" />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="7" fill={color} fillOpacity="0.18" />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="3.5" fill={color} stroke="#171717" strokeWidth="2" />
            </g>
          ) : null}
          <text x={chartLeft} y={height - 6} fill="rgb(113 113 122)" fontSize="11">{shortDate(data[0]?.data)}</text>
          <text x={width / 2} y={height - 6} fill="rgb(113 113 122)" fontSize="11" textAnchor="middle">{shortDate(middle)}</text>
          <text x={chartRight} y={height - 6} fill="rgb(113 113 122)" fontSize="11" textAnchor="end">{shortDate(data.at(-1)?.data)}</text>
        </svg>
      </div>
    </article>
  );
}

function DailyTrend({ overview }: { overview: AdminOverview }) {

  return (
    <Card
      title="Evolução do período"
      subtitle="Visitantes e contatos são únicos por sessão; pedidos vêm do checkout"
      icon={ChartNoAxesCombined}
    >
      {overview.serieDiaria.length ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <AreaMetricChart label="Visitantes" color="#d6a84a" data={overview.serieDiaria.map((day) => ({ data: day.data, value: day.visitantes }))} />
          <AreaMetricChart label="WhatsApp" color="#34d399" data={overview.serieDiaria.map((day) => ({ data: day.data, value: day.contatosWhatsApp }))} />
          <AreaMetricChart label="Pedidos" color="#67e8f9" data={overview.serieDiaria.map((day) => ({ data: day.data, value: day.pedidos }))} />
        </div>
      ) : (
        <EmptyNote>A evolução aparece quando houver eventos neste período.</EmptyNote>
      )}
    </Card>
  );
}

export default function OverviewDashboard({
  overview,
  demo = false,
  refreshing = false,
  error = "",
  onSelectRange,
  onSelectMonth,
}: {
  overview: AdminOverview;
  demo?: boolean;
  refreshing?: boolean;
  error?: string;
  onSelectRange: (range: RangeValue) => void;
  onSelectMonth: (month: string) => void;
}) {
  const maxFunnel = Math.max(overview.funil[0]?.sessoes ?? overview.funil[0]?.valor ?? 0, 1);
  const maxCity = Math.max(...overview.cidades.map((city) => city.visitas), 1);
  const maxOrigin = Math.max(...overview.origens.map((origin) => origin.visitas), 1);
  const originTotal = overview.origens.reduce((sum, origin) => sum + origin.visitas, 0);
  const maxHour = Math.max(...overview.horarios, 1);
  const peakHour = overview.horarios.indexOf(Math.max(...overview.horarios));
  const interestLeader = overview.modelosDesempenho[0];
  const conversionLeader = [...overview.modelosDesempenho]
    .filter((moto) => moto.interessados >= 10)
    .sort((a, b) => b.conversao - a.conversao)[0];
  const averageConversion = overview.modelosDesempenho.length
    ? overview.modelosDesempenho.reduce((sum, moto) => sum + moto.conversao, 0) /
      overview.modelosDesempenho.length
    : 0;
  const opportunity = overview.modelosDesempenho.find(
    (moto) => moto.interessados >= 30 && moto.conversao < averageConversion
  );
  const insights = [
    overview.horarios.some(Boolean)
      ? `O maior volume acontece às ${peakHour}h. Reforce o atendimento próximo desse horário.`
      : null,
    opportunity
      ? `${opportunity.nome} atrai ${opportunity.interessados} interessados, mas converte abaixo da média. Vale revisar oferta e abordagem.`
      : null,
    overview.origens[0]?.visitas >= 20
      ? `${overview.origens[0].origem} é a principal origem do período.`
      : null,
  ].filter(Boolean) as string[];
  const ordersHref = demo ? "/gestor/demo/pedidos" : "/gestor/pedidos";

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-[#f87171]">{error}</p>
      ) : null}

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-400">
          Mostrando <span className="font-semibold text-white">{overview.periodo.label}</span>
          {refreshing ? <span className="ml-2 text-gestor-gold">Atualizando...</span> : null}
        </p>
        <div className="flex min-w-0 w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="flex rounded-md border border-white/10 bg-[#141414] p-1" aria-label="Período rápido">
            {([7, 30, 90] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => onSelectRange(range)}
                className={cn(
                  "h-8 rounded px-3 text-xs font-semibold transition",
                  overview.periodo.range === range
                    ? "bg-gestor-gold text-[#111111]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {range}d
              </button>
            ))}
          </div>
          <label className="flex min-w-0 items-center gap-2 text-sm text-zinc-400">
            <CalendarDays className="h-4 w-4 text-gestor-gold" />
            <select
              value={overview.periodo.month ?? ""}
              onChange={(event) => onSelectMonth(event.target.value)}
              className="h-10 min-w-0 max-w-full rounded-md border border-white/15 bg-[#141414] px-2 text-base text-white outline-none transition focus:border-gestor-gold sm:text-sm"
              aria-label="Selecionar mês"
            >
              <option value="">Selecionar mês</option>
              {overview.periodo.mesesDisponiveis.map((month) => (
                <option key={month} value={month}>{monthLabel(month)}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <motion.section
        {...rise(0)}
        className="grid gap-4 rounded-lg border border-gestor-gold/35 bg-gradient-to-r from-[#241c0d] to-[#1b1b1b] p-5 lg:grid-cols-[1fr_auto] lg:items-center"
      >
        <div>
          <div className="flex items-center gap-2 text-gestor-gold-soft">
            <UsersRound className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Atendimento agora</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-7">
            <div><p className="text-3xl font-semibold text-white">{overview.atendimento.novos}</p><p className="text-sm text-zinc-400">pedidos novos</p></div>
            <div><p className="text-3xl font-semibold text-white">{overview.atendimento.emAtendimento}</p><p className="text-sm text-zinc-400">em atendimento</p></div>
            <div className="self-end"><p className="text-sm font-medium text-zinc-300">{relativeAge(overview.atendimento.maisAntigoNovoEm)}</p><p className="mt-1 text-xs text-zinc-500">Fila atual, independente do período</p></div>
          </div>
        </div>
        <Link href={ordersHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-gestor-gold px-5 text-sm font-semibold text-[#111111] transition hover:bg-gestor-gold-soft">
          Abrir pedidos <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div {...rise(0.04)}><StatTile label="Visitantes únicos" count={overview.visitantesUnicos} delta={overview.visitantesDelta ?? undefined} hint="Sessões no período" icon={Eye} /></motion.div>
        <motion.div {...rise(0.08)}><StatTile label="Contatos no WhatsApp" count={overview.contatosWhatsAppUnicos} delta={overview.contatosWhatsAppDelta ?? undefined} hint="Pessoas, não cliques" icon={MessageCircle} /></motion.div>
        <motion.div {...rise(0.12)}><StatTile label="Pedidos gerados" count={overview.pedidosEnviados} delta={overview.pedidosDelta ?? undefined} hint="Pedidos qualificados" icon={ShoppingBag} /></motion.div>
        <motion.div {...rise(0.16)}><StatTile label="Conversão em pedido" value={`${overview.conversaoPedido.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`} delta={overview.conversaoDeltaPp ?? undefined} deltaSuffix=" p.p." hint="Visitante → pedido" icon={Percent} /></motion.div>
      </div>

      <motion.div {...rise(0.1)}><DailyTrend overview={overview} /></motion.div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <motion.div {...rise(0.1)}>
          <Card title="Funil comercial" subtitle="Sessões únicas em cada etapa" icon={Filter}>
            <div className="grid gap-3">
              {overview.funil.map((stage) => {
                const sessions = stage.sessoes ?? stage.valor ?? 0;
                return <BarRow key={stage.etapa} label={stage.etapa} value={sessions} max={maxFunnel} valueLabel={`${sessions.toLocaleString("pt-BR")} · ${(stage.conversaoTotal ?? 0).toLocaleString("pt-BR")}%`} />;
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div {...rise(0.14)}>
          <Card title="Desempenho por modelo" subtitle="Interesse único, pedidos e conversão" icon={Bike}>
            {overview.modelosDesempenho.length ? (
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-zinc-500"><tr><th className="pb-3 font-medium">Modelo</th><th className="pb-3 text-right font-medium">Interessados</th><th className="pb-3 text-right font-medium">Pedidos</th><th className="pb-3 text-right font-medium">Conversão</th></tr></thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {overview.modelosDesempenho.map((moto) => (
                      <tr key={moto.motoId}><td className="py-3 font-medium text-white">{moto.nome}<span className="ml-2 inline-flex gap-1">{moto.motoId === interestLeader?.motoId ? <span className="rounded bg-gestor-gold/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gestor-gold-soft">Interesse</span> : null}{moto.motoId === conversionLeader?.motoId ? <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">Conversão</span> : null}</span></td><td className="py-3 text-right tabular-nums text-zinc-300">{moto.interessados}</td><td className="py-3 text-right tabular-nums text-zinc-300">{moto.pedidos}</td><td className="py-3 text-right font-semibold tabular-nums text-white">{moto.conversao.toLocaleString("pt-BR")}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyNote>Os modelos aparecem quando houver interações no período.</EmptyNote>}
          </Card>
        </motion.div>
      </div>

      {insights.length ? (
        <Card title="Leituras rápidas" subtitle="Sinais que merecem ação" icon={Lightbulb}>
          <div className="grid gap-3 lg:grid-cols-3">{insights.map((insight) => <p key={insight} className="rounded-md border border-white/10 bg-black/25 p-4 text-sm leading-6 text-zinc-300">{insight}</p>)}</div>
        </Card>
      ) : null}

      <section className="grid min-w-0 gap-4" aria-labelledby="publico-aquisicao-title">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gestor-gold">Diagnóstico</p>
          <h2 id="publico-aquisicao-title" className="mt-1 text-lg font-semibold text-white">Público e aquisição</h2>
          <p className="mt-1 text-sm text-zinc-400">Origem, localização, horários e comportamento no simulador</p>
        </div>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Card title="Origem das visitas" subtitle="Por onde o cliente chegou" icon={Share2}>{overview.origens.length ? <div className="grid gap-3">{overview.origens.map((origin) => <BarRow key={origin.origem} label={origin.origem} value={origin.visitas} max={maxOrigin} valueLabel={`${Math.round((origin.visitas / Math.max(originTotal, 1)) * 100)}%`} />)}</div> : <EmptyNote>A origem aparecerá nas próximas visitas.</EmptyNote>}</Card>
          <Card title="De onde acessam" subtitle="Cidade detectada pelo IP" icon={MapPin}>{overview.cidades.length ? <div className="grid gap-3">{overview.cidades.map((city) => <BarRow key={city.cidade} label={city.cidade} value={city.visitas} max={maxCity} />)}</div> : <EmptyNote>As cidades aparecem conforme chegam visitas.</EmptyNote>}</Card>
          <Card title="Horários de acesso" subtitle={overview.horarios.some(Boolean) ? `Pico às ${peakHour}h` : "Visitas por hora"} icon={Clock}>{overview.horarios.some(Boolean) ? <><div className="flex h-28 items-end gap-[3px]">{overview.horarios.map((value, hour) => <div key={hour} title={`${hour}h — ${value} visitas`} style={{ height: `${Math.max((value / maxHour) * 100, value ? 4 : 0)}%` }} className={cn("flex-1 rounded-t-[3px]", hour === peakHour ? "bg-gestor-gold-soft" : "bg-gestor-gold/60")} />)}</div><div className="mt-2 flex justify-between text-xs text-zinc-400"><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div></> : <EmptyNote>Sem visitas registradas neste período.</EmptyNote>}</Card>
          <Card title="O que digitam na calculadora" subtitle={overview.calculadora ? `${overview.calculadora.simulacoes.toLocaleString("pt-BR")} simulações` : "Médias do simulador"} icon={Calculator}>{overview.calculadora ? <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-md border border-white/10 bg-black/25 p-4"><p className="text-xs text-zinc-400">Gasolina</p><p className="mt-2 text-xl font-semibold text-white">{money(overview.calculadora.gastoGasolinaMedio)}</p></div><div className="rounded-md border border-white/10 bg-black/25 p-4"><p className="text-xs text-zinc-400">Km por dia</p><p className="mt-2 text-xl font-semibold text-white">{overview.calculadora.kmPorDiaMedio} km</p></div><div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-4"><p className="text-xs text-emerald-400/80">Economia estimada</p><p className="mt-2 text-xl font-semibold text-emerald-400">{money(overview.calculadora.economiaMediaEstimada)}</p></div></div> : <EmptyNote>As médias aparecem após o uso do simulador.</EmptyNote>}</Card>
        </div>
      </section>
    </div>
  );
}
