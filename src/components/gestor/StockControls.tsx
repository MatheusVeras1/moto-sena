"use client";

import {
  ChevronDown,
  History,
  Loader2,
  PackageMinus,
  PackagePlus,
  RefreshCcw,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import type { StockMovement, StockMovementInput } from "@/lib/site/types";
import { cn } from "@/lib/utils";

type StockResult = { quantity: number; movements: StockMovement[] };

const LABELS: Record<StockMovement["type"], string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
  venda: "Venda automática",
  estorno_venda: "Estorno da venda",
};

const OPERATION_META: Record<StockMovementInput["type"], {
  label: string;
  confirmation: string;
  icon: LucideIcon;
  button: string;
  panel: string;
  confirm: string;
  preview: string;
  input: string;
}> = {
  entrada: {
    label: "Registrar entrada",
    confirmation: "Confirmar entrada",
    icon: PackagePlus,
    button: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15",
    panel: "border-emerald-500/35 bg-emerald-500/[0.06]",
    confirm: "bg-emerald-500 text-[#07150f] hover:bg-emerald-400",
    preview: "text-emerald-300",
    input: "focus:border-emerald-500",
  },
  saida: {
    label: "Registrar saída",
    confirmation: "Confirmar saída",
    icon: PackageMinus,
    button: "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15",
    panel: "border-red-500/35 bg-red-500/[0.06]",
    confirm: "bg-red-500 text-white hover:bg-red-400",
    preview: "text-red-300",
    input: "focus:border-red-500",
  },
  ajuste: {
    label: "Ajustar saldo",
    confirmation: "Aplicar ajuste",
    icon: SlidersHorizontal,
    button: "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/15",
    panel: "border-sky-500/35 bg-sky-500/[0.06]",
    confirm: "bg-sky-500 text-[#07131a] hover:bg-sky-400",
    preview: "text-sky-300",
    input: "focus:border-sky-500",
  },
};

const HISTORY_META: Record<StockMovement["type"], { icon: LucideIcon; accent: string; iconColor: string }> = {
  entrada: { icon: PackagePlus, accent: "border-l-emerald-500", iconColor: "text-emerald-300" },
  saida: { icon: PackageMinus, accent: "border-l-red-500", iconColor: "text-red-300" },
  ajuste: { icon: SlidersHorizontal, accent: "border-l-sky-500", iconColor: "text-sky-300" },
  venda: { icon: ShoppingBag, accent: "border-l-red-500", iconColor: "text-red-300" },
  estorno_venda: { icon: RefreshCcw, accent: "border-l-emerald-500", iconColor: "text-emerald-300" },
};

export default function StockControls({
  motoId,
  initialQuantity,
  onMove,
  onLoadHistory,
}: {
  motoId: string;
  initialQuantity: number;
  onMove: (input: StockMovementInput) => Promise<StockResult>;
  onLoadHistory: (motoId: string) => Promise<StockMovement[]>;
}) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [type, setType] = useState<StockMovementInput["type"] | null>(null);
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const parsedAmount = Number(amount);
  const validAmount = Number.isInteger(parsedAmount) && parsedAmount >= (type === "ajuste" ? 0 : 1);
  const projectedQuantity = !type || !validAmount
    ? null
    : type === "entrada"
      ? quantity + parsedAmount
      : type === "saida"
        ? quantity - parsedAmount
        : parsedAmount;
  const operation = type ? OPERATION_META[type] : null;
  const ActiveOperationIcon = operation?.icon ?? SlidersHorizontal;

  async function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (!next || history.length) return;
    setLoadingHistory(true);
    try {
      setHistory(await onLoadHistory(motoId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao carregar histórico.");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function submit() {
    if (!type) return;
    const parsed = Number(amount);
    if (!Number.isInteger(parsed) || parsed < (type === "ajuste" ? 0 : 1)) {
      setError("Informe uma quantidade inteira válida.");
      return;
    }
    if (type === "ajuste" && !note.trim()) {
      setError("Informe o motivo do ajuste.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await onMove({ motoId, type, quantity: parsed, note: note.trim() });
      setQuantity(result.quantity);
      setHistory(result.movements);
      setType(null);
      setAmount("1");
      setNote("");
      const difference = Math.abs(result.quantity - quantity);
      setMessage(
        type === "ajuste"
          ? `Saldo ajustado para ${result.quantity}.`
          : `${type === "entrada" ? "Entrada" : "Saída"} de ${difference} ${difference === 1 ? "unidade registrada" : "unidades registradas"}. Saldo atual: ${result.quantity}.`
      );
      window.setTimeout(() => setMessage(""), 2200);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao atualizar estoque.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-white/10 bg-[#151515] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Estoque interno</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-white">{quantity}</span>
            <span className="text-sm text-zinc-400">{quantity === 1 ? "unidade" : "unidades"}</span>
            {quantity === 0 ? <span className="rounded bg-red-500/10 px-2 py-1 text-xs font-bold text-red-300">Sem estoque</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(OPERATION_META) as Array<StockMovementInput["type"]>).map((operationType) => {
            const meta = OPERATION_META[operationType];
            return <ActionButton key={operationType} icon={meta.icon} label={meta.label} selected={type === operationType} className={meta.button} onClick={() => { setType(operationType); setError(""); setMessage(""); }} />;
          })}
        </div>
      </div>

      {type && operation ? (
        <div className={cn("mt-4 rounded-md border p-3", operation.panel)}>
          <div className="mb-3 flex items-center gap-2">
            <span className={cn("flex size-8 items-center justify-center rounded-md border bg-black/20", operation.button)}><ActiveOperationIcon className="size-4" /></span>
            <p className="font-semibold text-white">{operation.label}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-end">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              {type === "ajuste" ? "Novo saldo" : "Quantidade"}
              <input type="number" min={type === "ajuste" ? 0 : 1} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className={cn("mt-2 h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 text-base text-white outline-none", operation.input)} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Observação {type === "ajuste" ? "(obrigatória)" : "(opcional)"}
              <input value={note} maxLength={240} onChange={(event) => setNote(event.target.value)} placeholder="Ex.: compra do fornecedor" className={cn("mt-2 h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 text-base normal-case text-white outline-none sm:text-sm", operation.input)} />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setType(null)} className="h-10 rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Cancelar</button>
              <button type="button" disabled={saving || projectedQuantity === null || projectedQuantity < 0} onClick={submit} className={cn("inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50", operation.confirm)}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <ActiveOperationIcon className="size-4" />} {operation.confirmation}
              </button>
            </div>
          </div>
          <p className={cn("mt-3 text-sm font-semibold tabular-nums", projectedQuantity !== null && projectedQuantity < 0 ? "text-red-300" : operation.preview)} aria-live="polite">
            {projectedQuantity === null
              ? "Informe uma quantidade inteira para visualizar o impacto."
              : projectedQuantity < 0
                ? `Saldo insuficiente: ${quantity} unidades disponíveis.`
                : `Saldo: ${quantity} → ${projectedQuantity}`}
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300" role="alert">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-300" role="status">{message}</p> : null}

      <button type="button" onClick={toggleHistory} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white" aria-expanded={historyOpen}>
        <History className="h-4 w-4 text-gestor-gold" /> Histórico
        <ChevronDown className={cn("h-4 w-4 transition", historyOpen && "rotate-180")} />
      </button>

      {historyOpen ? (
        <div className="mt-2 grid gap-2">
          {loadingHistory ? <p className="text-sm text-zinc-400">Carregando histórico...</p> : history.length ? history.map((movement) => {
            const meta = HISTORY_META[movement.type];
            const MovementIcon = meta.icon;
            return (
              <div key={movement.id} className={cn("grid gap-1 rounded-md border border-l-2 border-white/[0.07] bg-black/25 px-3 py-2 text-xs sm:grid-cols-[1fr_auto]", meta.accent)}>
                <div>
                  <p className="flex items-center gap-2 font-semibold text-zinc-200"><MovementIcon className={cn("size-4", meta.iconColor)} />{LABELS[movement.type]} · <span className={movement.delta > 0 ? "text-emerald-300" : "text-red-300"}>{movement.delta > 0 ? "+" : ""}{movement.delta}</span></p>
                  <p className="mt-1 text-zinc-500">{movement.note || "Sem observação"} · {movement.actorEmail}</p>
                </div>
                <p className="text-zinc-400 sm:text-right">Saldo {movement.newQuantity}<br />{new Date(movement.createdAt).toLocaleString("pt-BR")}</p>
              </div>
            );}) : <p className="text-sm text-zinc-500">Nenhuma movimentação registrada.</p>}
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({ icon: Icon, label, selected, className, onClick }: { icon: LucideIcon; label: string; selected: boolean; className: string; onClick: () => void }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70", className, selected && "ring-2 ring-white/40")}><Icon className="size-4" />{label}</button>;
}
