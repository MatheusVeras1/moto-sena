"use client";

import {
  Bike,
  Calculator,
  Clock,
  Eye,
  Filter,
  MapPin,
  MessageCircle,
  Share2,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import {
  PERIODO_LABEL,
  calculadora,
  cidades,
  funil,
  horarios,
  kpis,
  motosMaisVistas,
  origens,
} from "@/data/analytics-demo";
import { motos } from "@/data/motos";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BarRow, Card, StatTile, rise } from "../ui";

/** Visão geral da conta de apresentação: usa os dados simulados completos. */
export default function OverviewPanelDemo() {
  const maxVistas = Math.max(...motosMaisVistas.map((m) => m.vistas));
  const maxCidade = Math.max(...cidades.map((c) => c.visitas));
  const maxFunil = funil[0].valor;
  const maxHora = Math.max(...horarios);
  const horaPico = horarios.indexOf(maxHora);
  const maxOrigem = Math.max(...origens.map((o) => o.visitas));
  const totalOrigens = origens.reduce((sum, o) => sum + o.visitas, 0);
  const lider = motos.find((moto) => moto.id === kpis.modeloLiderId) ?? motos[0];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div {...rise(0)}>
          <StatTile
            label="Visitas"
            count={kpis.visitas}
            delta={kpis.visitasDelta}
            hint={PERIODO_LABEL}
            icon={Eye}
          />
        </motion.div>
        <motion.div {...rise(0.06)}>
          <StatTile
            label="Cliques no WhatsApp"
            count={kpis.cliquesWhatsApp}
            delta={kpis.cliquesDelta}
            hint="Todos os botões"
            icon={MessageCircle}
          />
        </motion.div>
        <motion.div {...rise(0.12)}>
          <StatTile
            label="Pedidos enviados"
            count={kpis.pedidosEnviados}
            delta={kpis.pedidosDelta}
            hint="Via checkout"
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
            subtitle="Cliques no card + aberturas do detalhe · variação vs mês anterior"
            icon={Bike}
          >
            <div className="grid gap-3">
              {motosMaisVistas.map((moto) => (
                <BarRow
                  key={moto.motoId}
                  label={moto.nome}
                  value={moto.vistas}
                  max={maxVistas}
                  trend={moto.tendencia}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...rise(0.16)}>
          <Card title="De onde acessam" subtitle="Cidade do visitante (detectada pelo IP)" icon={MapPin}>
            <div className="grid gap-3">
              {cidades.map((cidade) => (
                <BarRow
                  key={cidade.cidade}
                  label={cidade.cidade}
                  value={cidade.visitas}
                  max={maxCidade}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...rise(0.1)}>
          <Card title="Funil de interesse" subtitle="Da visita ao pedido no WhatsApp" icon={Filter}>
            <div className="grid gap-3">
              {funil.map((etapa) => (
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

        <motion.div {...rise(0.16)}>
          <Card
            title="Horários de acesso"
            subtitle={`Pico às ${horaPico}h — reforce o atendimento no WhatsApp`}
            icon={Clock}
          >
            <div className="flex h-28 items-end gap-[3px]">
              {horarios.map((valor, hora) => (
                <motion.div
                  key={hora}
                  title={`${hora}h — ${valor} visitas`}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(valor / maxHora) * 100}%` }}
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
          </Card>
        </motion.div>

        <motion.div {...rise(0.1)}>
          <Card title="Origem das visitas" subtitle="Por onde o cliente chegou" icon={Share2}>
            <div className="grid gap-3">
              {origens.map((origem) => (
                <BarRow
                  key={origem.origem}
                  label={origem.origem}
                  value={origem.visitas}
                  max={maxOrigem}
                  valueLabel={`${Math.round((origem.visitas / totalOrigens) * 100)}%`}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...rise(0.16)}>
          <Card
            title="O que digitam na calculadora"
            subtitle={`${calculadora.usos.toLocaleString("pt-BR")} simulações no período`}
            icon={Calculator}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                  Gasto médio com gasolina
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {money(calculadora.gastoGasolinaMedio)}
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                  Km por dia (média)
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {calculadora.kmPorDiaMedio} km
                </p>
              </div>
              <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-emerald-400/80">
                  Economia média estimada
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-400">
                  {money(calculadora.economiaMediaEstimada)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-400">
              Use esses números no balcão: é o quanto o público diz gastar hoje —
              argumento direto para a troca pela elétrica.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
