import { describe, expect, it } from "vitest";
import {
  aggregateOverviewAnalytics,
  type OverviewEvent,
  type OverviewOrder,
} from "./overview-analytics";

const start = new Date("2026-07-01T03:00:00.000Z");
const end = new Date("2026-07-04T03:00:00.000Z");
const motos = [
  { id: "x13", name: "X13" },
  { id: "bob", name: "Bob Max" },
];

function event(
  id: string,
  type: string,
  session: string | null,
  options: Partial<OverviewEvent> = {}
): OverviewEvent {
  return {
    id,
    event_type: type,
    session_id: session,
    moto_id: null,
    metadata: {},
    created_at: "2026-07-01T15:00:00.000Z",
    ...options,
  };
}

function order(id: string, motoId = "x13"): OverviewOrder {
  return {
    moto_id: motoId,
    status: id,
    created_at: "2026-07-01T16:00:00.000Z",
  };
}

describe("aggregateOverviewAnalytics", () => {
  it("deduplica eventos por sessão e separa WhatsApp geral do checkout", () => {
    const result = aggregateOverviewAnalytics({
      events: [
        event("1", "page_view", "session-a"),
        event("2", "page_view", "session-a"),
        event("3", "page_view", "session-b"),
        event("4", "detail_open", "session-a", { moto_id: "x13" }),
        event("5", "viewer_360", "session-a", { moto_id: "x13" }),
        event("6", "checkout_open", "session-a", { moto_id: "x13" }),
        event("7", "whatsapp_click", "session-a", { metadata: { source: "header" } }),
        event("8", "whatsapp_click", "session-a", { metadata: { source: "checkout" } }),
        event("9", "whatsapp_click", "session-a", { metadata: { source: "checkout" } }),
        event("10", "whatsapp_click", "session-b", { metadata: { source: "header" } }),
      ],
      previousEvents: [],
      orders: [order("novo")],
      previousOrders: [],
      motos,
      start,
      end,
    });

    expect(result.visitas).toBe(3);
    expect(result.visitantesUnicos).toBe(2);
    expect(result.cliquesWhatsApp).toBe(4);
    expect(result.contatosWhatsAppUnicos).toBe(2);
    expect(result.funil.map((stage) => stage.sessoes)).toEqual([2, 1, 1, 1]);
    expect(result.modelosDesempenho[0]).toMatchObject({
      motoId: "x13",
      interessados: 1,
      pedidos: 1,
      conversao: 100,
    });
    expect(result.conversaoPedido).toBe(50);
  });

  it("respeita o dia de Brasília na série diária", () => {
    const result = aggregateOverviewAnalytics({
      events: [
        event("1", "page_view", "late-session", {
          created_at: "2026-07-02T02:30:00.000Z",
        }),
      ],
      previousEvents: [],
      orders: [],
      previousOrders: [],
      motos,
      start,
      end,
    });

    expect(result.serieDiaria[0]).toMatchObject({ data: "2026-07-01", visitantes: 1 });
    expect(result.serieDiaria[1]).toMatchObject({ data: "2026-07-02", visitantes: 0 });
  });

  it("mantém conversões em zero quando não existe base", () => {
    const result = aggregateOverviewAnalytics({
      events: [],
      previousEvents: [],
      orders: [],
      previousOrders: [],
      motos,
      start,
      end,
    });

    expect(result.conversaoPedido).toBe(0);
    expect(result.conversaoDeltaPp).toBeNull();
    expect(result.funil.every((stage) => stage.conversaoTotal === 0)).toBe(true);
  });

  it("calcula delta de conversão em pontos percentuais", () => {
    const result = aggregateOverviewAnalytics({
      events: [event("1", "page_view", "a"), event("2", "page_view", "b")],
      previousEvents: [
        event("3", "page_view", "c"),
        event("4", "page_view", "d"),
        event("5", "page_view", "e"),
        event("6", "page_view", "f"),
      ],
      orders: [order("novo")],
      previousOrders: [order("vendido")],
      motos,
      start,
      end,
    });

    expect(result.conversaoPedido).toBe(50);
    expect(result.conversaoDeltaPp).toBe(25);
  });
});
