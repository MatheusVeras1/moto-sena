"use client";

import { useEffect, useState } from "react";
import type { CatalogMoto, SiteState } from "@/lib/site/types";
import MotosCatalogEditor, { type MotoCatalogUpdate } from "./MotosCatalogEditor";

export default function MotosPanel() {
  const [catalog, setCatalog] = useState<CatalogMoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/admin/motos", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
        return response.json();
      })
      .then((state: SiteState) => setCatalog(state.motos))
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

    const state = (await response.json()) as SiteState;
    setCatalog(state.motos);
    return state.motos;
  }

  return (
    <MotosCatalogEditor
      key={loading ? "loading" : "loaded"}
      catalog={catalog}
      loading={loading}
      loadError={loadError}
      subtitle="Preço, promoção e disponibilidade agora são persistidos no Supabase"
      onSave={saveCatalog}
    />
  );
}
