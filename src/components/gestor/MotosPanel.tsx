"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { CheckCircle2, Eye, EyeOff, Loader2, RotateCcw, Save, Search, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CatalogMoto, SiteState } from "@/lib/site/types";
import { cn } from "@/lib/utils";
import { Card } from "./ui";

type EditableMoto = CatalogMoto & {
  priceInput: string;
  promoInput: string;
};

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "vitrine", label: "Na vitrine" },
  { id: "promocao", label: "Em promoção" },
  { id: "consulta", label: "Sob consulta" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function MotosPanel() {
  const [motos, setMotos] = useState<EditableMoto[]>([]);
  const [initial, setInitial] = useState<EditableMoto[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("todas");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | "all" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/motos", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
        return response.json();
      })
      .then((state: SiteState) => {
        const editable = state.motos.map(toEditable);
        setMotos(editable);
        setInitial(editable);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return motos.filter((moto) => {
      const matchesQuery =
        !normalized ||
        moto.name.toLowerCase().includes(normalized) ||
        moto.shortName.toLowerCase().includes(normalized);
      const matchesFilter =
        filter === "todas" ||
        (filter === "vitrine" && moto.active) ||
        (filter === "promocao" && Boolean(moto.promoInput.trim())) ||
        (filter === "consulta" && !moto.priceInput.trim());
      return matchesQuery && matchesFilter;
    });
  }, [filter, motos, query]);

  const changedCount = motos.filter((moto) => isDirty(moto, initial.find((item) => item.id === moto.id))).length;

  function updateMoto(id: string, patch: Partial<EditableMoto>) {
    setMotos((current) =>
      current.map((moto) => (moto.id === id ? { ...moto, ...patch } : moto))
    );
  }

  async function saveMotos(items: EditableMoto[], savingKey: string | "all") {
    setSaving(savingKey);
    setError("");
    setMessage("");

    const payload = {
      motos: items.map((moto) => ({
        id: moto.id,
        price: parseMoneyInput(moto.priceInput),
        promoPrice: parseMoneyInput(moto.promoInput),
        active: moto.active,
      })),
    };

    try {
      const response = await fetch("/api/admin/motos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Não foi possível salvar as motos.");

      const state = (await response.json()) as SiteState;
      const editable = state.motos.map(toEditable);
      setMotos(editable);
      setInitial(editable);
      setMessage(savingKey === "all" ? "Catálogo atualizado no site." : "Moto atualizada no site.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(null);
      window.setTimeout(() => setMessage(""), 2600);
    }
  }

  function resetMoto(id: string) {
    const original = initial.find((moto) => moto.id === id);
    if (!original) return;
    updateMoto(id, original);
  }

  return (
    <div className="grid gap-5">
      <Card
        title="Catálogo"
        subtitle="Preço, promoção e disponibilidade agora são persistidos no Supabase"
      >
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar modelo"
              className="h-11 w-full rounded-md border border-white/10 bg-black/35 pl-10 pr-3 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "h-10 rounded-md border px-3 text-sm font-semibold transition",
                  filter === item.id
                    ? "border-[#ff6a1a] bg-[#ff6a1a]/15 text-[#ff9556]"
                    : "border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/10"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">
            {filtered.length} modelos visíveis nesta busca · {changedCount} alterações pendentes
          </p>
          <button
            type="button"
            disabled={changedCount === 0 || saving !== null}
            onClick={() => saveMotos(motos, "all")}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#e85d04] px-4 text-sm font-semibold text-white transition hover:bg-[#ff6a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar tudo
          </button>
        </div>

        {message ? (
          <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-md border border-[#ff6a1a]/30 bg-[#ff6a1a]/10 px-3 py-2 text-sm text-[#f87171]">
            {error}
          </p>
        ) : null}
      </Card>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#ff6a1a]" />
          Carregando catálogo...
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((moto, index) => {
            const original = initial.find((item) => item.id === moto.id);
            const dirty = isDirty(moto, original);
            return (
              <motion.article
                key={moto.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut", delay: Math.min(index * 0.04, 0.35) }}
                className={cn(
                  "overflow-hidden rounded-lg border bg-[#1b1b1b] shadow-xl shadow-black/10 transition",
                  dirty ? "border-[#ff6a1a]/50" : "border-white/10",
                  !moto.active && "opacity-65"
                )}
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[9rem_1fr]">
                  <Image
                    src={moto.poster}
                    alt={moto.name}
                    width={160}
                    height={90}
                    className="aspect-video w-full rounded-md object-cover sm:w-36"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{moto.name}</h3>
                        <p className="text-xs text-zinc-400">{moto.tagline}</p>
                      </div>
                      <StatusBadges moto={moto} dirty={dirty} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <MoneyField
                        label="Preço (R$)"
                        value={moto.priceInput}
                        placeholder="Sob consulta"
                        onChange={(value) => updateMoto(moto.id, { priceInput: value })}
                      />
                      <MoneyField
                        label="Promoção (R$)"
                        value={moto.promoInput}
                        placeholder="Sem promoção"
                        onChange={(value) => updateMoto(moto.id, { promoInput: value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/20 p-4">
                  <button
                    type="button"
                    onClick={() => updateMoto(moto.id, { active: !moto.active })}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
                      moto.active
                        ? "border-[#ff6a1a]/40 bg-[#ff6a1a]/10 text-[#ff9556]"
                        : "border-white/10 bg-white/[0.04] text-zinc-400"
                    )}
                  >
                    {moto.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {moto.active ? "Na vitrine" : "Oculta"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!dirty || saving !== null}
                      onClick={() => resetMoto(moto.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restaurar
                    </button>
                    <button
                      type="button"
                      disabled={!dirty || saving !== null}
                      onClick={() => saveMotos([moto], moto.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[#e85d04] px-4 text-sm font-semibold text-white transition hover:bg-[#ff6a1a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === moto.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toEditable(moto: CatalogMoto): EditableMoto {
  return {
    ...moto,
    priceInput: moto.numericPrice != null ? String(moto.numericPrice) : "",
    promoInput: moto.promoPrice != null ? String(moto.promoPrice) : "",
  };
}

function parseMoneyInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isDirty(moto: EditableMoto, original?: EditableMoto) {
  if (!original) return true;
  return (
    moto.priceInput !== original.priceInput ||
    moto.promoInput !== original.promoInput ||
    moto.active !== original.active
  );
}

function MoneyField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      <input
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none sm:text-sm transition focus:border-[#ff6a1a]"
      />
    </label>
  );
}

function StatusBadges({ moto, dirty }: { moto: EditableMoto; dirty: boolean }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {moto.active ? (
        <span className="inline-flex items-center gap-1 rounded border border-[#ff6a1a]/30 bg-[#ff6a1a]/10 px-2 py-1 text-xs font-bold text-[#ff9556]">
          <Eye className="h-3.5 w-3.5" />
          Vitrine
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-bold text-zinc-400">
          <EyeOff className="h-3.5 w-3.5" />
          Oculta
        </span>
      )}
      {moto.promoInput.trim() ? (
        <span className="inline-flex items-center gap-1 rounded border border-[#e85d04]/40 bg-[#e85d04]/15 px-2 py-1 text-xs font-bold text-[#f87171]">
          <Tag className="h-3.5 w-3.5" />
          Promoção
        </span>
      ) : null}
      {!moto.priceInput.trim() ? (
        <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-bold text-zinc-400">
          Sob consulta
        </span>
      ) : null}
      {dirty ? (
        <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs font-bold text-sky-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Editado
        </span>
      ) : null}
    </div>
  );
}
