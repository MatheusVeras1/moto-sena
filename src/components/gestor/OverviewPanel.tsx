"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdminOverview, ManagementReportData } from "@/lib/site/types";
import { exportManagementReport } from "@/lib/site/report-export";
import OverviewDashboard, { emptyOverview } from "./OverviewDashboard";

type RangeValue = 7 | 30 | 90;

export default function OverviewPanel() {
  const [overview, setOverview] = useState<AdminOverview>(() => emptyOverview());
  const [range, setRange] = useState<RangeValue>(30);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const query = month ? `?month=${month}` : `?range=${range}`;

    fetch(`/api/admin/overview${query}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os indicadores.");
        return response.json();
      })
      .then((data: AdminOverview) => {
        if (!cancelled) setOverview(data);
      })
      .catch((caught: Error) => {
        if (!cancelled) setError(caught.message);
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
  }, [month, range]);

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-white/10 bg-[#1b1b1b] text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-gestor-gold" />
        Carregando indicadores...
      </div>
    );
  }

  async function exportReport(format: "pdf" | "xlsx") {
    const query = overview.periodo.month
      ? `?month=${overview.periodo.month}`
      : `?range=${overview.periodo.range ?? 30}`;
    const response = await fetch(`/api/admin/reports/data${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível preparar os dados do relatório.");
    await exportManagementReport((await response.json()) as ManagementReportData, format);
  }

  return (
    <OverviewDashboard
      overview={overview}
      refreshing={refreshing}
      error={error}
      onSelectRange={(nextRange) => {
        setMonth("");
        setRange(nextRange);
        setRefreshing(true);
        setError("");
      }}
      onSelectMonth={(nextMonth) => {
        if (!nextMonth) return;
        setMonth(nextMonth);
        setRefreshing(true);
        setError("");
      }}
      onExport={exportReport}
    />
  );
}
