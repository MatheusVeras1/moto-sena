"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, StatTile } from "../ui";
import { updatePedidoStatus, usePedidos, type PedidoStatus } from "./demo-store";

const STATUS_OPTIONS: { value: PedidoStatus; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "atendimento", label: "Em atendimento" },
  { value: "vendido", label: "Vendido" },
  { value: "perdido", label: "Perdido" },
];

const STATUS_STYLE: Record<PedidoStatus, string> = {
  novo: "border-gestor-gold/50 text-gestor-gold-soft",
  atendimento: "border-sky-500/50 text-sky-300",
  vendido: "border-emerald-500/50 text-emerald-300",
  perdido: "border-zinc-400/50 text-zinc-400",
};

const STATUS_EDGE: Record<PedidoStatus, string> = {
  novo: "border-l-gestor-gold",
  atendimento: "border-l-sky-400",
  vendido: "border-l-emerald-400",
  perdido: "border-l-zinc-400",
};

/** Pedidos da conta de apresentação: exemplos simulados, edição só na sessão. */
export default function PedidosPanelDemo() {
  const pedidos = usePedidos();

  const contagem = (status: PedidoStatus) =>
    pedidos.filter((p) => p.status === status).length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Novos" value={String(contagem("novo"))} hint="Aguardando contato" />
        <StatTile label="Em atendimento" value={String(contagem("atendimento"))} />
        <StatTile label="Vendidos" value={String(contagem("vendido"))} />
        <StatTile label="Perdidos" value={String(contagem("perdido"))} />
      </div>

      <Card
        title="Pedidos recebidos"
        subtitle="Todo pedido enviado pelo site fica registrado aqui, além de chegar no WhatsApp"
      >
        {pedidos.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Nenhum pedido ainda — os pedidos enviados pelo site aparecem aqui.
          </p>
        ) : (
          <div className="grid gap-3">
            {pedidos.map((pedido, index) => (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: "easeOut", delay: Math.min(index * 0.05, 0.4) }}
                className={cn(
                  "grid items-center gap-3 rounded-md border border-l-4 border-white/10 bg-black/25 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]",
                  STATUS_EDGE[pedido.status]
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {pedido.name || "Nome não informado"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {pedido.phone || "Telefone não informado"} ·{" "}
                    {pedido.city || "Cidade não informada"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-300">{pedido.motoName}</p>
                  <p className="text-xs text-zinc-400">
                    {pedido.payment} · {pedido.delivery}
                  </p>
                </div>
                <p className="text-xs text-zinc-400">
                  {new Date(pedido.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <select
                  value={pedido.status}
                  onChange={(event) =>
                    updatePedidoStatus(pedido.id, event.target.value as PedidoStatus)
                  }
                  className={cn(
                    "h-10 rounded-md border bg-black/40 px-3 text-base font-semibold outline-none sm:text-sm transition focus:border-gestor-gold",
                    STATUS_STYLE[pedido.status]
                  )}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#151515] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
