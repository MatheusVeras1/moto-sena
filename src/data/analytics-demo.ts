// ---------------------------------------------------------------------------
// Dados simulados do painel do gestor (modo demo para apresentação).
// Quando o Supabase for conectado, estes números passam a vir de eventos
// reais coletados no site.
// ---------------------------------------------------------------------------

import type { AdminOverview } from "@/lib/site/types";

export const PERIODO_LABEL = "Últimos 30 dias";

export const kpis = {
  visitas: 4826,
  visitasDelta: 12,
  cliquesWhatsApp: 342,
  cliquesDelta: 8,
  pedidosEnviados: 57,
  pedidosDelta: 18,
  modeloLiderId: "x13-1000w",
};

/** Funil geral do site no período. */
export const funil = [
  { etapa: "Visitaram o site", valor: 4826 },
  { etapa: "Abriram um modelo", valor: 2214 },
  { etapa: "Giraram a moto em 360°", valor: 1038 },
  { etapa: "Montaram um pedido", valor: 486 },
  { etapa: "Enviaram no WhatsApp", valor: 342 },
];

/** Interações por modelo (cliques no card + aberturas de detalhe).
 * `tendencia` = variação % vs período anterior. */
export const motosMaisVistas = [
  { motoId: "x13-1000w", nome: "X13 1000W", vistas: 1462, pedidos: 18, tendencia: 14 },
  { motoId: "bob-max-1000w", nome: "Bob Max 1000W", vistas: 1187, pedidos: 12, tendencia: 6 },
  { motoId: "mini-bob-500w", nome: "Mini Bob 500W", vistas: 968, pedidos: 9, tendencia: 9 },
  { motoId: "x11-1000w", nome: "X11 1000W", vistas: 842, pedidos: 7, tendencia: -3 },
  { motoId: "yep-1000w", nome: "YEP 1000W", vistas: 631, pedidos: 4, tendencia: 2 },
  { motoId: "one-max-1000w", nome: "One Max 1000W", vistas: 555, pedidos: 3, tendencia: -7 },
  { motoId: "ttx-1000w", nome: "TTX 1000W", vistas: 447, pedidos: 2, tendencia: -9 },
  { motoId: "v9-max-1000w", nome: "V9 Max 1000W", vistas: 389, pedidos: 2, tendencia: 1 },
];

/** De onde os visitantes acessam (cidade detectada pelo IP). */
export const cidades = [
  { cidade: "Nova Iguaçu", visitas: 1834 },
  { cidade: "Rio de Janeiro", visitas: 1062 },
  { cidade: "Duque de Caxias", visitas: 531 },
  { cidade: "Mesquita", visitas: 434 },
  { cidade: "Nilópolis", visitas: 338 },
  { cidade: "Queimados", visitas: 289 },
  { cidade: "Japeri", visitas: 193 },
  { cidade: "Outras", visitas: 145 },
];

/** Visitas por hora do dia (soma do período). */
export const horarios = [
  38, 22, 14, 9, 8, 12, 31, 74, 118, 142, 168, 196, 214, 189, 172, 181, 208,
  247, 296, 334, 302, 246, 152, 78,
];

/** Como os visitantes chegaram ao site. */
export const origens = [
  { origem: "Instagram", visitas: 2606 },
  { origem: "Acesso direto", visitas: 1351 },
  { origem: "Google", visitas: 869 },
];

/** Médias do que os visitantes digitam na calculadora de economia. */
export const calculadora = {
  usos: 1214,
  gastoGasolinaMedio: 486,
  kmPorDiaMedio: 27,
  economiaMediaEstimada: 447,
};

function scale(value: number, factor: number) {
  return Math.max(0, Math.round(value * factor));
}

export function getOverviewDemo(options: {
  range?: 7 | 30 | 90;
  month?: string | null;
} = {}): AdminOverview {
  const range = options.range ?? 30;
  const month = options.month ?? null;
  const [selectedYear, selectedMonth] = month?.split("-").map(Number) ?? [];
  const days = month ? new Date(Date.UTC(selectedYear, selectedMonth, 0)).getUTCDate() : range;
  const factor = days / 30;
  const serieDiaria = Array.from({ length: days }, (_, index) => {
    const date = month
      ? new Date(Date.UTC(selectedYear, selectedMonth - 1, index + 1, 12))
      : new Date();
    if (!month) date.setDate(date.getDate() - (days - index - 1));
    const wave = Math.sin(index * 0.72) * 18;
    const visitors = Math.max(62, Math.round(134 + wave + (index % 6) * 5));
    return {
      data: date.toISOString().slice(0, 10),
      visitantes: visitors,
      contatosWhatsApp: Math.max(4, Math.round(visitors * (0.066 + (index % 3) * 0.004))),
      pedidos: Math.max(1, Math.round(visitors * (0.011 + (index % 4) * 0.002))),
    };
  });
  const visitantesUnicos = serieDiaria.reduce((sum, day) => sum + day.visitantes, 0);
  const contatosWhatsAppUnicos = serieDiaria.reduce(
    (sum, day) => sum + day.contatosWhatsApp,
    0
  );
  const pedidosEnviados = serieDiaria.reduce((sum, day) => sum + day.pedidos, 0);
  const conversaoPedido = Math.round((pedidosEnviados / visitantesUnicos) * 1000) / 10;
  const modelosDesempenho = motosMaisVistas.map((moto) => {
    const interessados = scale(moto.vistas * 0.58, factor);
    const pedidos = scale(moto.pedidos, factor);
    return {
      motoId: moto.motoId,
      nome: moto.nome,
      interessados,
      pedidos,
      conversao: interessados ? Math.round((pedidos / interessados) * 1000) / 10 : 0,
      tendencia: moto.tendencia,
    };
  });
  const interactions = Math.round(visitantesUnicos * 0.46);
  const checkout = Math.round(visitantesUnicos * 0.1);
  const checkoutWhatsapp = Math.min(Math.round(visitantesUnicos * 0.071), checkout);

  return {
    visitas: scale(kpis.visitas, factor),
    cliquesWhatsApp: scale(kpis.cliquesWhatsApp, factor),
    pedidosEnviados,
    visitasDelta: kpis.visitasDelta,
    cliquesDelta: kpis.cliquesDelta,
    pedidosDelta: kpis.pedidosDelta,
    visitantesUnicos,
    contatosWhatsAppUnicos,
    visitantesDelta: 11,
    contatosWhatsAppDelta: 8,
    conversaoPedido,
    conversaoDeltaPp: 0.3,
    atendimento: {
      novos: 2,
      emAtendimento: 1,
      maisAntigoNovoEm: new Date(Date.now() - 84 * 60 * 1000).toISOString(),
    },
    serieDiaria,
    modeloLiderId: modelosDesempenho[0]?.motoId ?? "x13-1000w",
    motosMaisVistas: modelosDesempenho.map((moto) => ({
      motoId: moto.motoId,
      nome: moto.nome,
      vistas: moto.interessados,
      pedidos: moto.pedidos,
      tendencia: moto.tendencia,
    })),
    modelosDesempenho,
    funil: [
      { etapa: "Visitantes", sessoes: visitantesUnicos, conversaoAnterior: 100, conversaoTotal: 100 },
      {
        etapa: "Interagiram com um modelo",
        sessoes: interactions,
        conversaoAnterior: 46,
        conversaoTotal: 46,
      },
      {
        etapa: "Abriram o pedido",
        sessoes: checkout,
        conversaoAnterior: Math.round((checkout / interactions) * 1000) / 10,
        conversaoTotal: 10,
      },
      {
        etapa: "Enviaram pelo checkout",
        sessoes: checkoutWhatsapp,
        conversaoAnterior: Math.round((checkoutWhatsapp / checkout) * 1000) / 10,
        conversaoTotal: Math.round((checkoutWhatsapp / visitantesUnicos) * 1000) / 10,
      },
    ],
    horarios: horarios.map((value) => scale(value, factor)),
    origens: origens.map((item) => ({ ...item, visitas: scale(item.visitas, factor) })),
    cidades: cidades.map((item) => ({ ...item, visitas: scale(item.visitas, factor) })),
    calculadora: {
      simulacoes: scale(calculadora.usos, factor),
      gastoGasolinaMedio: calculadora.gastoGasolinaMedio,
      kmPorDiaMedio: calculadora.kmPorDiaMedio,
      economiaMediaEstimada: calculadora.economiaMediaEstimada,
    },
    periodo: {
      label: month
        ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
            .format(new Date(Date.UTC(selectedYear, selectedMonth - 1, 15)))
            .replace(/^./, (letter) => letter.toUpperCase())
        : `Últimos ${range} dias`,
      month,
      range: month ? null : range,
      mesesDisponiveis: ["2026-07", "2026-06", "2026-05"],
    },
  };
}

/** Pedidos de exemplo para o mini-CRM (aparecem só se não houver pedidos). */
export const pedidosDemo = [
  {
    id: "demo-1",
    motoId: "x13-1000w",
    motoName: "X13 1000W",
    payment: "Pix",
    delivery: "Retirada na loja",
    name: "Carlos Henrique",
    phone: "(21) 98877-1234",
    city: "Nova Iguaçu",
    createdAt: "2026-07-01T19:42:00.000Z",
    status: "novo" as const,
  },
  {
    id: "demo-2",
    motoId: "bob-max-1000w",
    motoName: "Bob Max 1000W",
    payment: "Crédito",
    delivery: "Entrega sob consulta",
    name: "Fernanda Lima",
    phone: "(21) 97654-8890",
    city: "Rio de Janeiro",
    createdAt: "2026-07-01T14:18:00.000Z",
    status: "atendimento" as const,
  },
  {
    id: "demo-3",
    motoId: "mini-bob-500w",
    motoName: "Mini Bob 500W",
    payment: "Pix",
    delivery: "Retirada na loja",
    name: "Jorge Santos",
    phone: "(21) 96543-2211",
    city: "Duque de Caxias",
    createdAt: "2026-06-30T20:05:00.000Z",
    status: "vendido" as const,
  },
  {
    id: "demo-4",
    motoId: "x11-1000w",
    motoName: "X11 1000W",
    payment: "Débito",
    delivery: "Retirada na loja",
    name: "Ana Paula Ribeiro",
    phone: "(21) 99876-3345",
    city: "Nova Iguaçu",
    createdAt: "2026-06-29T11:37:00.000Z",
    status: "perdido" as const,
  },
  {
    id: "demo-5",
    motoId: "yep-1000w",
    motoName: "YEP 1000W",
    payment: "Pix",
    delivery: "Entrega sob consulta",
    name: "Marcos Vinícius",
    phone: "(21) 95432-7788",
    city: "Nilópolis",
    createdAt: "2026-06-28T16:52:00.000Z",
    status: "novo" as const,
  },
];
