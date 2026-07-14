"use client";

import { useSyncExternalStore } from "react";
import { pedidosDemo } from "@/data/analytics-demo";

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
};

let state: DemoState = {
  overrides: {},
  pedidos: pedidosDemo,
  settings: { banner: "", featuredMotoId: "x13-1000w" },
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

export function updatePedidoStatus(id: string, status: PedidoStatus) {
  state = {
    ...state,
    pedidos: state.pedidos.map((pedido) =>
      pedido.id === id ? { ...pedido, status } : pedido
    ),
  };
  emit();
}
