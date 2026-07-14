import { describe, expect, it } from "vitest";
import { stockMovementSchema } from "./validation";

describe("stockMovementSchema", () => {
  it("accepts purchases and manual exits with positive integer quantities", () => {
    expect(stockMovementSchema.safeParse({ motoId: "x11", type: "entrada", quantity: 3 }).success).toBe(true);
    expect(stockMovementSchema.safeParse({ motoId: "x11", type: "saida", quantity: 1 }).success).toBe(true);
  });

  it("requires a note for an exact balance adjustment", () => {
    expect(stockMovementSchema.safeParse({ motoId: "x11", type: "ajuste", quantity: 0 }).success).toBe(false);
    expect(stockMovementSchema.safeParse({ motoId: "x11", type: "ajuste", quantity: 0, note: "Contagem física" }).success).toBe(true);
  });

  it("rejects zero exits, fractions and negative quantities", () => {
    expect(stockMovementSchema.safeParse({ motoId: "x11", type: "saida", quantity: 0 }).success).toBe(false);
    expect(stockMovementSchema.safeParse({ motoId: "x11", type: "entrada", quantity: 1.5 }).success).toBe(false);
    expect(stockMovementSchema.safeParse({ motoId: "x11", type: "ajuste", quantity: -1, note: "Teste" }).success).toBe(false);
  });
});
