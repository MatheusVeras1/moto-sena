"use client";

import { useEffect, useState } from "react";
import type {
  AdminCatalogMoto,
  AdminSiteState,
  StockMovement,
  StockMovementInput,
} from "@/lib/site/types";
import MotosCatalogEditor, { type MotoCatalogUpdate } from "./MotosCatalogEditor";

export default function MotosPanel() {
  const [catalog, setCatalog] = useState<AdminCatalogMoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/admin/motos", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
        return response.json();
      })
      .then((state: AdminSiteState) => setCatalog(state.motos))
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function saveCatalog(items: MotoCatalogUpdate[]) {
    const response = await fetch("/api/admin/motos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motos: items }),
    });
    if (!response.ok) throw new Error("Não foi possível salvar as motos.");

    const state = (await response.json()) as AdminSiteState;
    setCatalog(state.motos);
    return state.motos;
  }

  async function loadStockHistory(motoId: string) {
    const response = await fetch(`/api/admin/stock?motoId=${encodeURIComponent(motoId)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível carregar o histórico.");
    return ((await response.json()) as { movements: StockMovement[] }).movements;
  }

  async function moveStock(input: StockMovementInput) {
    const response = await fetch("/api/admin/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      motos?: AdminCatalogMoto[];
      movements?: StockMovement[];
    };
    if (!response.ok || !data.motos || !data.movements) {
      throw new Error(data.error ?? "Não foi possível atualizar o estoque.");
    }
    setCatalog(data.motos);
    return {
      quantity: data.motos.find((moto) => moto.id === input.motoId)?.stockQuantity ?? 0,
      movements: data.movements,
    };
  }

  return (
    <MotosCatalogEditor
      key={loading ? "loading" : "loaded"}
      catalog={catalog}
      loading={loading}
      loadError={loadError}
      subtitle="Preço, promoção e disponibilidade agora são persistidos no Supabase"
      onSave={saveCatalog}
      onStockMovement={moveStock}
      onLoadStockHistory={loadStockHistory}
    />
  );
}
