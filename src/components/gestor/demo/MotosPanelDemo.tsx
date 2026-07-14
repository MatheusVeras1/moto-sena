"use client";

import { useMemo } from "react";
import { motos } from "@/data/motos";
import type { AdminCatalogMoto, StockMovementInput } from "@/lib/site/types";
import MotosCatalogEditor, { type MotoCatalogUpdate } from "../MotosCatalogEditor";
import {
  applyDemoStockMovement,
  saveOverrides,
  useInventory,
  useOverrides,
  useStockMovements,
  type Overrides,
} from "./demo-store";

/** Catálogo da conta de apresentação: edições ficam só nesta sessão. */
export default function MotosPanelDemo() {
  const overrides = useOverrides();
  const inventory = useInventory();
  const movements = useStockMovements();
  const catalog = useMemo(() => buildCatalog(overrides, inventory), [inventory, overrides]);

  async function saveCatalog(items: MotoCatalogUpdate[]) {
    const nextOverrides = { ...overrides };
    for (const item of items) {
      nextOverrides[item.id] = {
        price: item.price,
        promoPrice: item.promoPrice,
        active: item.active,
      };
    }
    saveOverrides(nextOverrides);
    return buildCatalog(nextOverrides, inventory);
  }

  async function moveStock(input: StockMovementInput) {
    const motoName = motos.find((moto) => moto.id === input.motoId)?.name ?? input.motoId;
    return applyDemoStockMovement(input, motoName) ?? { quantity: inventory[input.motoId] ?? 0, movements: [] };
  }

  return (
    <MotosCatalogEditor
      catalog={catalog}
      subtitle="Preço, promoção e disponibilidade — alterações válidas somente nesta sessão"
      onSave={saveCatalog}
      onStockMovement={moveStock}
      onLoadStockHistory={async (motoId) => movements.filter((item) => item.motoId === motoId)}
    />
  );
}

function buildCatalog(overrides: Overrides, inventory: Record<string, number>): AdminCatalogMoto[] {
  return motos.map((moto, index) => {
    const override = overrides[moto.id];
    const hasPrice = override && Object.prototype.hasOwnProperty.call(override, "price");
    const hasPromo = override && Object.prototype.hasOwnProperty.call(override, "promoPrice");
    const numericPrice = hasPrice ? override.price ?? undefined : moto.numericPrice;
    const promoPrice = hasPromo ? override.promoPrice ?? undefined : undefined;

    return {
      ...moto,
      numericPrice,
      promoPrice,
      active: override?.active ?? (moto.defaultActive !== false),
      sortOrder: index,
      stockQuantity: inventory[moto.id] ?? 0,
    };
  });
}
