// ---------------------------------------------------------------------------
// Dados simulados do painel do gestor (modo demo para apresentação).
// Quando o Supabase for conectado, estes números passam a vir de eventos
// reais coletados no site.
// ---------------------------------------------------------------------------

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
