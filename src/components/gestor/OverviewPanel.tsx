"use client";

import {
  Bike,
  Calculator,
  CalendarDays,
  Clock,
  Eye,
  Filter,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { motos } from "@/data/motos";
import { money } from "@/lib/format";
import type { AdminOverview } from "@/lib/site/types";
import { cn } from "@/lib/utils";
import { BarRow, Card, StatTile, rise } from "./ui";

const EMPTY_OVERVIEW: AdminOverview = {
  visitas: 0,
  cliquesWhatsApp: 0,
  pedidosEnviados: 0,
  visitasDelta: null,
  cliquesDelta: null,
  pedidosDelta: null,
  modeloLiderId: "x13-1000w",
  motosMaisVistas: motos.map((moto) => ({
    motoId: moto.id,
    nome: moto.name,
    vistas: 0,
    pedidos: 0,
    tendencia: null,
  })),
  funil: [
    { etapa: "Visitaram o site", valor: 0 },
    { etapa: "Abriram um modelo", valor: 0 },
    { etapa: "Giraram a moto em 360°", valor: 0 },
    { etapa: "Montaram um pedido", valor: 0 },
    { etapa: "Enviaram no WhatsApp", valor: 0 },
  ],
  horarios: Array.from({ length: 24 }, () => 0),
  origens: [],
  cidades: [],
  calculadora: null,
  periodo: { label: "Últimos 30 dias", month: null, mesesDisponiveis: [] },
};

function monthLabel(month: string) {
  const [year, mm] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, mm - 1, 15)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center text-sm leading-6 text-zinc-400">
      {children}
    </p>
  );
}

export default function OverviewPanel() {
  const [overview, setOverview] = useState<AdminOverview>(EMPTY_OVERVIEW);
  const [month, setMonth] = useState<string>(""); // "" = últimos 30 dias
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const query = month ? `?month=${month}` : "";
    fetch(`/api/admin/overview${query}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os indicadores.");
        return response.json();
      })
      .then((data: AdminOverview) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  const maxVistas = Math.max(...overview.motosMaisVistas.map((moto) => moto.vistas), 1);
  const maxFunil = Math.max(overview.funil[0]?.valor ?? 0, 1);
  const maxCidade = Math.max(...overview.cidades.map((c) => c.visitas), 1);
  const maxOrigem = Math.max(...overview.origens.map((o) => o.visitas), 1);
  const totalOrigens = overview.origens.reduce((sum, o) => sum + o.visitas, 0);
  const maxHora = Math.max(...overview.horarios, 1);
  const temHorarios = overview.horarios.some((valor) => valor > 0);
  const horaPico = overview.horarios.indexOf(Math.max(...overview.horarios));
  const lider = motos.find((moto) => moto.id === overview.modeloLiderId) ?? motos[0];
  const comparacaoHint = overview.periodo.month
    ? "vs mês anterior"
    : "vs 30 dias anteriores";

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#ff6a1a]" />
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <p className="rounded-md border border-[#ff6a1a]/30 bg-[#ff6a1a]/10 px-3 py-2 text-sm text-[#f87171]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          Mostrando <span className="font-semibold text-white">{overview.periodo.label}</span>
          {refreshing ? (
            <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-[#ff6a1a]" />
          ) : null}
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4 text-[#ff6a1a]" />
          Período
          <select
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setRefreshing(true);
              setError("");
            }}
            className="h-9 rounded-md border border-white/15 bg-[#141414] px-2 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
          >
            <option value="">Últimos 30 dias</option>
            {overview.periodo.mesesDisponiveis.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div {...rise(0)}>
          <StatTile
            label="Visitas"
            count={overview.visitas}
            delta={overview.visitasDelta ?? undefined}
            hint={overview.visitasDelta != null ? comparacaoHint : overview.periodo.label}
            icon={Eye}
          />
        </motion.div>
        <motion.div {...rise(0.06)}>
          <StatTile
            label="Cliques no WhatsApp"
            count={overview.cliquesWhatsApp}
            delta={overview.cliquesDelta ?? undefined}
            hint={overview.cliquesDelta != null ? comparacaoHint : "Todos os botões"}
            icon={MessageCircle}
          />
        </motion.div>
        <motion.div {...rise(0.12)}>
          <StatTile
            label="Pedidos enviados"
            count={overview.pedidosEnviados}
            delta={overview.pedidosDelta ?? undefined}
            hint={overview.pedidosDelta != null ? comparacaoHint : "Via checkout"}
            icon={ShoppingBag}
          />
        </motion.div>

        <motion.div
          {...rise(0.18)}
          className="rounded-lg border border-[#ff6a1a]/30 bg-gradient-to-br from-[#241c0d] to-[#1b1b1b] p-5 transition-colors duration-300 hover:border-[#ff6a1a]/55"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff6a1a]">
              Modelo líder
            </p>
            <Trophy className="h-4 w-4 text-[#ff9556]" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <video
              src={lider.video}
              poster={lider.poster}
              autoPlay
              muted
              loop
              controls={false}
              controlsList="nodownload noremoteplayback noplaybackrate"
              disablePictureInPicture
              disableRemotePlayback
              draggable={false}
              onContextMenu={(event) => event.preventDefault()}
              playsInline
              className="h-14 w-24 shrink-0 rounded-md border border-[#ff6a1a]/30 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white">{lider.name}</p>
              <p className="text-xs text-zinc-400">Mais vista no período</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div {...rise(0.1)}>
          <Card
            title="Motos mais vistas"
            subtitle={`Cliques no card, detalhe e checkout · variação ${comparacaoHint}`}
            icon={Bike}
          >
            <div className="grid gap-3">
              {overview.motosMaisVistas.map((moto) => (
                <BarRow
                  key={moto.motoId}
                  label={moto.nome}
                  value={moto.vistas}
                  max={maxVistas}
                  valueLabel={`${moto.vistas.toLocaleString("pt-BR")} · ${moto.pedidos} pedidos`}
                  trend={moto.tendencia ?? undefined}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...rise(0.16)}>
          <Card title="Funil de interesse" subtitle="Da visita ao pedido no WhatsApp" icon={Filter}>
            <div className="grid gap-3">
              {overview.funil.map((etapa) => (
                <BarRow
                  key={etapa.etapa}
                  label={etapa.etapa}
                  value={etapa.valor}
                  max={maxFunil}
                  valueLabel={`${etapa.valor.toLocaleString("pt-BR")} · ${Math.round(
                    (etapa.valor / maxFunil) * 100
                  )}%`}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...rise(0.1)}>
          <Card title="De onde acessam" subtitle="Cidade do visitante (detectada pelo IP)" icon={MapPin}>
            {overview.cidades.length ? (
              <div className="grid gap-3">
                {overview.cidades.map((cidade) => (
                  <BarRow
                    key={cidade.cidade}
                    label={cidade.cidade}
                    value={cidade.visitas}
                    max={maxCidade}
                  />
                ))}
              </div>
            ) : (
              <EmptyNote>
                As cidades aparecem aqui conforme novos visitantes acessam o site.
              </EmptyNote>
            )}
          </Card>
        </motion.div>

        <motion.div {...rise(0.16)}>
          <Card
            title="Horários de acesso"
            subtitle={
              temHorarios
                ? `Pico às ${horaPico}h — reforce o atendimento no WhatsApp`
                : "Visitas por hora do dia"
            }
            icon={Clock}
          >
            {temHorarios ? (
              <>
                <div className="flex h-28 items-end gap-[3px]">
                  {overview.horarios.map((valor, hora) => (
                    <motion.div
                      key={hora}
                      title={`${hora}h — ${valor} visitas`}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max((valor / maxHora) * 100, valor > 0 ? 4 : 0)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: hora * 0.015 }}
                      className={cn(
                        "flex-1 rounded-t-[3px]",
                        hora === horaPico ? "bg-[#ff9556]" : "bg-[#ff6a1a]/60"
                      )}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-zinc-400">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                  <span>18h</span>
                  <span>23h</span>
                </div>
              </>
            ) : (
              <EmptyNote>Sem visitas registradas neste período ainda.</EmptyNote>
            )}
          </Card>
        </motion.div>

        <motion.div {...rise(0.1)}>
          <Card title="Origem das visitas" subtitle="Por onde o cliente chegou" icon={Share2}>
            {overview.origens.length ? (
              <div className="grid gap-3">
                {overview.origens.map((origem) => (
                  <BarRow
                    key={origem.origem}
                    label={origem.origem}
                    value={origem.visitas}
                    max={maxOrigem}
                    valueLabel={`${Math.round((origem.visitas / totalOrigens) * 100)}%`}
                  />
                ))}
              </div>
            ) : (
              <EmptyNote>
                A origem passa a ser registrada nas próximas visitas — em pouco tempo você
                vê quanto vem do Instagram, do Google e de link direto.
              </EmptyNote>
            )}
          </Card>
        </motion.div>

        <motion.div {...rise(0.16)}>
          <Card
            title="O que digitam na calculadora"
            subtitle={
              overview.calculadora
                ? `${overview.calculadora.simulacoes.toLocaleString("pt-BR")} simulações no período`
                : "Médias do simulador de economia"
            }
            icon={Calculator}
          >
            {overview.calculadora ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                      Gasto médio com gasolina
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {money(overview.calculadora.gastoGasolinaMedio)}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                      Km por dia (média)
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {overview.calculadora.kmPorDiaMedio} km
                    </p>
                  </div>
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-emerald-400/80">
                      Economia média estimada
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-400">
                      {money(overview.calculadora.economiaMediaEstimada)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-400">
                  Use esses números no balcão: é o quanto o público diz gastar hoje —
                  argumento direto para a troca pela elétrica. Valores de economia são
                  estimativas da simulação.
                </p>
              </>
            ) : (
              <EmptyNote>
                Quando um visitante usar o simulador de economia, as médias do que ele
                digitou aparecem aqui.
              </EmptyNote>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
