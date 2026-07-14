"use client";

import { useMemo } from "react";
import { motos } from "@/data/motos";
import type { CatalogMoto } from "@/lib/site/types";
import MotosCatalogEditor, { type MotoCatalogUpdate } from "../MotosCatalogEditor";
import { saveOverrides, useOverrides, type Overrides } from "./demo-store";

/** Catálogo da conta de apresentação: edições ficam só nesta sessão. */
export default function MotosPanelDemo() {
  const overrides = useOverrides();
  const catalog = useMemo(() => buildCatalog(overrides), [overrides]);

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
    return buildCatalog(nextOverrides);
  }

  return (
    <MotosCatalogEditor
      catalog={catalog}
      subtitle="Preço, promoção e disponibilidade — alterações válidas somente nesta sessão"
      onSave={saveCatalog}
    />
  );
}

function buildCatalog(overrides: Overrides): CatalogMoto[] {
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
      active: override?.active !== false,
      sortOrder: index,
    };
  });
}
