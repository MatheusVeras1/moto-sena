import "server-only";

import { loja } from "@/config/loja";
import type { ManagementReportData } from "./types";
import {
  getAdminSiteState,
  getOverview,
  getReportOrders,
  getStockMovements,
  resolveReportPeriod,
} from "./db";

export async function getManagementReport(options: {
  month?: string | null;
  range?: 7 | 30 | 90;
}): Promise<ManagementReportData> {
  const period = resolveReportPeriod(options);
  const [overview, state, movements, orders] = await Promise.all([
    getOverview(options),
    getAdminSiteState(),
    getStockMovements({ start: period.start, end: period.end, limit: 5000 }),
    getReportOrders(period.start, period.end),
  ]);

  return {
    store: { name: loja.nome, logoPath: loja.logoPath },
    generatedAt: new Date().toISOString(),
    overview,
    inventory: state.motos,
    movements,
    orders,
  };
}
