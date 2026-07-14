"use client";

import { useMemo, useState } from "react";
import OverviewDashboard from "@/components/gestor/OverviewDashboard";
import { loja } from "@/config/loja";
import { motos } from "@/data/motos";
import { getOverviewDemo } from "@/data/analytics-demo";
import { exportManagementReport } from "@/lib/site/report-export";
import type { ManagementReportData } from "@/lib/site/types";
import { useInventory, useOverrides, usePedidos, useStockMovements } from "./demo-store";

type RangeValue = 7 | 30 | 90;

export default function OverviewPanelDemo() {
  const [range, setRange] = useState<RangeValue>(30);
  const [month, setMonth] = useState("");
  const inventory = useInventory();
  const overrides = useOverrides();
  const pedidos = usePedidos();
  const movements = useStockMovements();
  const overview = useMemo(
    () => getOverviewDemo({ range, month: month || null }),
    [month, range]
  );

  async function exportReport(format: "pdf" | "xlsx") {
    const end = month
      ? new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1, 3))
      : new Date();
    const start = month
      ? new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1, 3))
      : new Date(end.getTime() - range * 86400000);
    const withinPeriod = (value: string) => {
      const time = new Date(value).getTime();
      return time >= start.getTime() && time < end.getTime();
    };
    const report: ManagementReportData = {
      store: { name: loja.nome, logoPath: loja.logoPath },
      generatedAt: new Date().toISOString(),
      overview,
      inventory: motos.map((moto, index) => ({
        ...moto,
        numericPrice: overrides[moto.id]?.price ?? moto.numericPrice,
        promoPrice: overrides[moto.id]?.promoPrice ?? undefined,
        active: overrides[moto.id]?.active ?? moto.defaultActive === true,
        sortOrder: index,
        stockQuantity: inventory[moto.id] ?? 0,
      })),
      movements: movements.filter((item) => withinPeriod(item.createdAt)),
      orders: pedidos.filter((pedido) => withinPeriod(pedido.createdAt)).map((pedido) => ({
        createdAt: pedido.createdAt,
        motoName: pedido.motoName,
        payment: pedido.payment,
        delivery: pedido.delivery,
        city: pedido.city,
        status: pedido.status,
      })),
    };
    await exportManagementReport(report, format);
  }

  return (
    <OverviewDashboard
      overview={overview}
      demo
      onSelectRange={(nextRange) => {
        setMonth("");
        setRange(nextRange);
      }}
      onSelectMonth={(nextMonth) => {
        if (nextMonth) setMonth(nextMonth);
      }}
      onExport={exportReport}
    />
  );
}
