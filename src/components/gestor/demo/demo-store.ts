"use client";

import { useSyncExternalStore } from "react";
import { pedidosDemo } from "@/data/analytics-demo";
import type { StockMovement, StockMovementInput } from "@/lib/site/types";

// ---------------------------------------------------------------------------
// Estado em memória do painel na conta de apresentação (demo).
// Nada aqui toca o banco real: as edições valem só enquanto a aba está aberta
// e servem para demonstrar o fluxo do painel ao vivo.
// ---------------------------------------------------------------------------

export type MotoOverride = {
  /** Preço atual em reais. Ausente = preço original do catálogo. */
  price?: number | null;
  /** Preço promocional em reais. Definido = mostra "de X por Y". */
  promoPrice?: number | null;
  /** false = moto sai da vitrine (esgotada/indisponível). */
  active?: boolean;
};

export type Overrides = Record<string, MotoOverride>;

export type PedidoStatus = "novo" | "atendimento" | "vendido" | "perdido";

export type Pedido = {
  id: string;
  motoId: string;
  motoName: string;
  payment: string;
  delivery: string;
  name: string;
  phone: string;
  city: string;
  createdAt: string;
  status: PedidoStatus;
};

export type SiteSettings = {
  banner: string;
  featuredMotoId: string;
};

type DemoState = {
  overrides: Overrides;
  pedidos: Pedido[];
  settings: SiteSettings;
  inventory: Record<string, number>;
  movements: StockMovement[];
};

let state: DemoState = {
  overrides: {},
  pedidos: pedidosDemo,
  settings: { banner: "", featuredMotoId: "x13-1000w" },
  inventory: {
    "mini-bob-500w": 4,
    "bob-max-1000w": 3,
    "one-max-1000w": 2,
    "ttx-1000w": 1,
    "v9-max-1000w": 2,
    "x11-1000w": 5,
    "x13-1000w": 3,
    "yep-1000w": 1,
  },
  movements: [
    {
      id: "demo-mov-1",
      motoId: "x11-1000w",
      motoName: "X11 1000W",
      type: "entrada",
      delta: 5,
      previousQuantity: 0,
      newQuantity: 5,
      note: "Compra recebida do fornecedor.",
      orderId: null,
      actorEmail: "demo@loja-modelo.local",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "demo-mov-2",
      motoId: "mini-bob-500w",
      motoName: "Mini Bob 500W",
      type: "ajuste",
      delta: 1,
      previousQuantity: 3,
      newQuantity: 4,
      note: "Conferência física do estoque.",
      orderId: null,
      actorEmail: "demo@loja-modelo.local",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function useDemoState(): DemoState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  );
}

export function useOverrides(): Overrides {
  return useDemoState().overrides;
}

export function useSiteSettings(): SiteSettings {
  return useDemoState().settings;
}

export function usePedidos(): Pedido[] {
  return useDemoState().pedidos;
}

export function useInventory(): Record<string, number> {
  return useDemoState().inventory;
}

export function useStockMovements(): StockMovement[] {
  return useDemoState().movements;
}

export function saveOverride(motoId: string, override: MotoOverride) {
  state = { ...state, overrides: { ...state.overrides, [motoId]: override } };
  emit();
}

export function saveOverrides(overrides: Overrides) {
  state = { ...state, overrides };
  emit();
}

export function clearOverride(motoId: string) {
  const overrides = { ...state.overrides };
  delete overrides[motoId];
  state = { ...state, overrides };
  emit();
}

export function saveSettings(settings: SiteSettings) {
  state = { ...state, settings };
  emit();
}

function movement(input: {
  motoId: string;
  motoName: string;
  type: StockMovement["type"];
  delta: number;
  previous: number;
  next: number;
  note: string;
  orderId?: string;
}): StockMovement {
  return {
    id: crypto.randomUUID(),
    motoId: input.motoId,
    motoName: input.motoName,
    type: input.type,
    delta: input.delta,
    previousQuantity: input.previous,
    newQuantity: input.next,
    note: input.note,
    orderId: input.orderId ?? null,
    actorEmail: "demo@loja-modelo.local",
    createdAt: new Date().toISOString(),
  };
}

export function applyDemoStockMovement(input: StockMovementInput, motoName: string) {
  const previous = state.inventory[input.motoId] ?? 0;
  const next = input.type === "entrada"
    ? previous + input.quantity
    : input.type === "saida"
      ? previous - input.quantity
      : input.quantity;
  if (next < 0) throw new Error("A saída é maior que o estoque disponível.");
  if (next === previous) {
    return { quantity: next, movements: state.movements.filter((item) => item.motoId === input.motoId) };
  }

  const entry = movement({
    motoId: input.motoId,
    motoName,
    type: input.type,
    delta: next - previous,
    previous,
    next,
    note: input.note ?? "",
  });
  state = {
    ...state,
    inventory: { ...state.inventory, [input.motoId]: next },
    movements: [entry, ...state.movements],
  };
  emit();
  return { quantity: next, movements: state.movements.filter((item) => item.motoId === input.motoId) };
}

export function updatePedidoStatus(id: string, status: PedidoStatus) {
  const pedido = state.pedidos.find((item) => item.id === id);
  if (!pedido || pedido.status === status) return;

  const previous = state.inventory[pedido.motoId] ?? 0;
  let next = previous;
  let entry: StockMovement | null = null;
  if (pedido.status !== "vendido" && status === "vendido") {
    if (previous < 1) {
      throw new Error("Esta moto está sem estoque. Registre uma entrada antes de concluir a venda.");
    }
    next = previous - 1;
    entry = movement({ motoId: pedido.motoId, motoName: pedido.motoName, type: "venda", delta: -1, previous, next, note: "Baixa automática pelo pedido vendido.", orderId: pedido.id });
  } else if (pedido.status === "vendido" && status !== "vendido") {
    next = previous + 1;
    entry = movement({ motoId: pedido.motoId, motoName: pedido.motoName, type: "estorno_venda", delta: 1, previous, next, note: "Estorno automático após alteração do pedido.", orderId: pedido.id });
  }

  state = {
    ...state,
    pedidos: state.pedidos.map((pedido) =>
      pedido.id === id ? { ...pedido, status } : pedido
    ),
    inventory: { ...state.inventory, [pedido.motoId]: next },
    movements: entry ? [entry, ...state.movements] : state.movements,
  };
  emit();
}
