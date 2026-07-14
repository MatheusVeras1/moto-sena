import type { AdminOverview } from "./types";

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;
const MODEL_EVENTS = new Set(["moto_click", "detail_open", "viewer_360", "checkout_open"]);
const CALC_KWH_POR_KM = 0.035;
const CALC_TARIFA_ENERGIA_KWH = 1.05;

export type OverviewEvent = {
  id?: string;
  event_type: string;
  moto_id: string | null;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type OverviewOrder = {
  moto_id: string | null;
  status: string;
  created_at: string;
};

type MotoReference = { id: string; name: string };

function sessionKey(event: OverviewEvent) {
  return event.session_id ?? `legacy:${event.id ?? `${event.created_at}:${event.event_type}`}`;
}

function brtDay(iso: string) {
  return new Date(new Date(iso).getTime() - BRT_OFFSET_MS).toISOString().slice(0, 10);
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

export function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function classifyOrigin(metadata: Record<string, unknown> | null): string | null {
  if (!metadata || !("referrer" in metadata)) return null;
  const referrer = String(metadata.referrer ?? "").toLowerCase();
  const utm = String(metadata.utmSource ?? "").toLowerCase();
  const source = `${utm} ${referrer}`;
  if (source.includes("instagram") || utm === "ig") return "Instagram";
  if (source.includes("whatsapp") || source.includes("wa.me")) return "WhatsApp";
  if (source.includes("facebook") || source.includes("fb.me")) return "Facebook";
  if (source.includes("google")) return "Google";
  if (!referrer && !utm) return "Direto (link salvo)";
  return "Outros";
}

function uniqueSessions(events: OverviewEvent[], predicate: (event: OverviewEvent) => boolean) {
  return new Set(events.filter(predicate).map(sessionKey));
}

function funnelStage(
  etapa: string,
  sessoes: number,
  previous: number,
  total: number
): AdminOverview["funil"][number] {
  return {
    etapa,
    sessoes,
    conversaoAnterior: pct(sessoes, previous),
    conversaoTotal: pct(sessoes, total),
  };
}

export function aggregateOverviewAnalytics(input: {
  events: OverviewEvent[];
  previousEvents: OverviewEvent[];
  orders: OverviewOrder[];
  previousOrders: OverviewOrder[];
  motos: MotoReference[];
  start: Date;
  end: Date;
}) {
  const { events, previousEvents, orders, previousOrders, motos, start, end } = input;
  const pageViews = events.filter((event) => event.event_type === "page_view");
  const previousPageViews = previousEvents.filter((event) => event.event_type === "page_view");
  const whatsappEvents = events.filter((event) => event.event_type === "whatsapp_click");
  const previousWhatsappEvents = previousEvents.filter(
    (event) => event.event_type === "whatsapp_click"
  );
  const visitantes = uniqueSessions(events, (event) => event.event_type === "page_view");
  const visitantesAntes = uniqueSessions(
    previousEvents,
    (event) => event.event_type === "page_view"
  );
  const contatos = uniqueSessions(events, (event) => event.event_type === "whatsapp_click");
  const contatosAntes = uniqueSessions(
    previousEvents,
    (event) => event.event_type === "whatsapp_click"
  );
  const interacoes = uniqueSessions(events, (event) => MODEL_EVENTS.has(event.event_type));
  const aberturasPedido = uniqueSessions(events, (event) => event.event_type === "checkout_open");
  const enviosCheckout = uniqueSessions(
    events,
    (event) =>
      event.event_type === "whatsapp_click" && event.metadata?.source === "checkout"
  );

  const conversaoPedido = pct(orders.length, visitantes.size);
  const conversaoPedidoAntes = pct(previousOrders.length, visitantesAntes.size);

  const seriesMap = new Map<
    string,
    { visitantes: Set<string>; contatosWhatsApp: Set<string>; pedidos: number }
  >();
  const cursor = new Date(start);
  while (cursor < end) {
    const day = brtDay(cursor.toISOString());
    seriesMap.set(day, { visitantes: new Set(), contatosWhatsApp: new Set(), pedidos: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  for (const event of events) {
    const row = seriesMap.get(brtDay(event.created_at));
    if (!row) continue;
    if (event.event_type === "page_view") row.visitantes.add(sessionKey(event));
    if (event.event_type === "whatsapp_click") row.contatosWhatsApp.add(sessionKey(event));
  }
  for (const order of orders) {
    const row = seriesMap.get(brtDay(order.created_at));
    if (row) row.pedidos += 1;
  }
  const serieDiaria = [...seriesMap.entries()].map(([data, row]) => ({
    data,
    visitantes: row.visitantes.size,
    contatosWhatsApp: row.contatosWhatsApp.size,
    pedidos: row.pedidos,
  }));

  const modelCurrent = new Map<string, Set<string>>();
  const modelPrevious = new Map<string, Set<string>>();
  for (const moto of motos) {
    modelCurrent.set(moto.id, new Set());
    modelPrevious.set(moto.id, new Set());
  }
  for (const event of events) {
    if (event.moto_id && MODEL_EVENTS.has(event.event_type)) {
      modelCurrent.get(event.moto_id)?.add(sessionKey(event));
    }
  }
  for (const event of previousEvents) {
    if (event.moto_id && MODEL_EVENTS.has(event.event_type)) {
      modelPrevious.get(event.moto_id)?.add(sessionKey(event));
    }
  }
  const pedidosPorMoto = new Map<string, number>();
  for (const order of orders) {
    if (order.moto_id) pedidosPorMoto.set(order.moto_id, (pedidosPorMoto.get(order.moto_id) ?? 0) + 1);
  }
  const modelosDesempenho = motos
    .map((moto) => {
      const interessados = modelCurrent.get(moto.id)?.size ?? 0;
      const pedidos = pedidosPorMoto.get(moto.id) ?? 0;
      return {
        motoId: moto.id,
        nome: moto.name,
        interessados,
        pedidos,
        conversao: pct(pedidos, interessados),
        tendencia: percentDelta(interessados, modelPrevious.get(moto.id)?.size ?? 0),
      };
    })
    .sort((a, b) => b.interessados - a.interessados);

  const horarios = Array.from({ length: 24 }, () => 0);
  for (const event of pageViews) {
    const hour = (new Date(event.created_at).getUTCHours() + 21) % 24;
    horarios[hour] += 1;
  }

  const origemCount = new Map<string, number>();
  const cidadeCount = new Map<string, number>();
  for (const event of pageViews) {
    const origem = classifyOrigin(event.metadata);
    if (origem) origemCount.set(origem, (origemCount.get(origem) ?? 0) + 1);
    const cidade = event.metadata?.geoCity;
    if (typeof cidade === "string" && cidade) {
      cidadeCount.set(cidade, (cidadeCount.get(cidade) ?? 0) + 1);
    }
  }
  const origens = [...origemCount.entries()]
    .map(([origem, visitas]) => ({ origem, visitas }))
    .sort((a, b) => b.visitas - a.visitas);
  const cidades = [...cidadeCount.entries()]
    .map(([cidade, visitas]) => ({ cidade, visitas }))
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 6);

  const calcBySession = new Map<string, { dailyKm: number; days: number; gasCost: number }>();
  for (const event of events) {
    if (event.event_type !== "economy_calculator") continue;
    const dailyKm = Number(event.metadata?.dailyKm);
    const days = Number(event.metadata?.days);
    const gasCost = Number(event.metadata?.gasCost);
    if (Number.isFinite(dailyKm) && Number.isFinite(days) && Number.isFinite(gasCost)) {
      calcBySession.set(sessionKey(event), { dailyKm, days, gasCost });
    }
  }
  const simulations = [...calcBySession.values()];
  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const calculadora = simulations.length
    ? {
        simulacoes: simulations.length,
        gastoGasolinaMedio: Math.round(average(simulations.map((item) => item.gasCost))),
        kmPorDiaMedio: Math.round(average(simulations.map((item) => item.dailyKm))),
        economiaMediaEstimada: Math.round(
          average(
            simulations.map((item) =>
              Math.max(
                0,
                item.gasCost -
                  item.dailyKm * item.days * CALC_KWH_POR_KM * CALC_TARIFA_ENERGIA_KWH
              )
            )
          )
        ),
      }
    : null;

  const funil = [
    funnelStage("Visitantes", visitantes.size, visitantes.size, visitantes.size),
    funnelStage("Interagiram com um modelo", interacoes.size, visitantes.size, visitantes.size),
    funnelStage("Abriram o pedido", aberturasPedido.size, interacoes.size, visitantes.size),
    funnelStage("Enviaram pelo checkout", enviosCheckout.size, aberturasPedido.size, visitantes.size),
  ];

  return {
    visitas: pageViews.length,
    cliquesWhatsApp: whatsappEvents.length,
    pedidosEnviados: orders.length,
    visitasDelta: percentDelta(pageViews.length, previousPageViews.length),
    cliquesDelta: percentDelta(whatsappEvents.length, previousWhatsappEvents.length),
    pedidosDelta: percentDelta(orders.length, previousOrders.length),
    visitantesUnicos: visitantes.size,
    contatosWhatsAppUnicos: contatos.size,
    visitantesDelta: percentDelta(visitantes.size, visitantesAntes.size),
    contatosWhatsAppDelta: percentDelta(contatos.size, contatosAntes.size),
    conversaoPedido,
    conversaoDeltaPp:
      visitantesAntes.size > 0
        ? Math.round((conversaoPedido - conversaoPedidoAntes) * 10) / 10
        : null,
    serieDiaria,
    modelosDesempenho,
    modeloLiderId: modelosDesempenho[0]?.motoId ?? motos[0]?.id ?? "x13-1000w",
    motosMaisVistas: modelosDesempenho.map((moto) => ({
      motoId: moto.motoId,
      nome: moto.nome,
      vistas: moto.interessados,
      pedidos: moto.pedidos,
      tendencia: moto.tendencia,
    })),
    funil,
    horarios,
    origens,
    cidades,
    calculadora,
  };
}
