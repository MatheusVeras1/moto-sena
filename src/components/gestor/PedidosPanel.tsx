"use client";

import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { OrderDto, PedidoStatus } from "@/lib/site/types";
import { cn } from "@/lib/utils";
import { Card, StatTile } from "./ui";

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

export default function PedidosPanel() {
  const [pedidos, setPedidos] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os pedidos.");
        return response.json();
      })
      .then((data: { orders: OrderDto[] }) => setPedidos(data.orders))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: PedidoStatus) {
    setSaving(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Não foi possível atualizar o pedido.");
      }
      const data = (await response.json()) as { orders: OrderDto[] };
      setPedidos(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar pedido.");
    } finally {
      setSaving("");
    }
  }

  const contagem = (status: PedidoStatus) =>
    pedidos.filter((pedido) => pedido.status === status).length;

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-gestor-gold" />
        Carregando pedidos...
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Novos" value={String(contagem("novo"))} hint="Aguardando contato" />
        <StatTile label="Em atendimento" value={String(contagem("atendimento"))} />
        <StatTile label="Vendidos" value={String(contagem("vendido"))} />
        <StatTile label="Perdidos" value={String(contagem("perdido"))} />
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-[#f87171]">
          {error}
        </p>
      ) : null}

      <Card
        title="Pedidos recebidos"
        subtitle="Todo pedido enviado pelo site fica registrado aqui, além de chegar no WhatsApp"
      >
        {pedidos.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Nenhum pedido ainda. Os pedidos enviados pelo site aparecem aqui.
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
                  disabled={saving === pedido.id}
                  onChange={(event) => updateStatus(pedido.id, event.target.value as PedidoStatus)}
                  className={cn(
                    "h-10 rounded-md border bg-black/40 px-3 text-base font-semibold outline-none sm:text-sm transition focus:border-gestor-gold disabled:opacity-60",
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
