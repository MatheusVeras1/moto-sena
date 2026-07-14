import type { Moto } from "@/data/motos";

export type PedidoStatus = "novo" | "atendimento" | "vendido" | "perdido";

export type Pedido = {
  id: string;
  motoId: string;
  motoName: string;
  payment: string;
  delivery: string;
  name: string;
  phone: string;
  city: string;
  createdAt: string;
  status: PedidoStatus;
};

export type SiteSettings = {
  banner: string;
  featuredMotoId: string;
};

export type CatalogMoto = Moto & {
  active: boolean;
  promoPrice?: number;
  sortOrder: number;
  updatedAt?: string;
};

export type SiteState = {
  motos: CatalogMoto[];
  settings: SiteSettings;
  source: "supabase" | "fallback";
};

export type AdminOverview = {
  visitas: number;
  cliquesWhatsApp: number;
  pedidosEnviados: number;
  /** Variações % vs período anterior; null quando não há base de comparação. */
  visitasDelta: number | null;
  cliquesDelta: number | null;
  pedidosDelta: number | null;
  visitantesUnicos: number;
  contatosWhatsAppUnicos: number;
  visitantesDelta: number | null;
  contatosWhatsAppDelta: number | null;
  conversaoPedido: number;
  conversaoDeltaPp: number | null;
  atendimento: {
    novos: number;
    emAtendimento: number;
    maisAntigoNovoEm: string | null;
  };
  serieDiaria: Array<{
    data: string;
    visitantes: number;
    contatosWhatsApp: number;
    pedidos: number;
  }>;
  modeloLiderId: string;
  motosMaisVistas: Array<{
    motoId: string;
    nome: string;
    vistas: number;
    pedidos: number;
    tendencia: number | null;
  }>;
  modelosDesempenho: Array<{
    motoId: string;
    nome: string;
    interessados: number;
    pedidos: number;
    conversao: number;
    tendencia: number | null;
  }>;
  funil: Array<{
    etapa: string;
    sessoes?: number;
    valor?: number;
    conversaoAnterior?: number;
    conversaoTotal?: number;
  }>;
  /** Visitas por hora do dia (0-23), no fuso de Brasília. */
  horarios: number[];
  origens: Array<{ origem: string; visitas: number }>;
  cidades: Array<{ cidade: string; visitas: number }>;
  calculadora: {
    simulacoes: number;
    gastoGasolinaMedio: number;
    kmPorDiaMedio: number;
    economiaMediaEstimada: number;
  } | null;
  periodo: {
    label: string;
    month: string | null;
    range: 7 | 30 | 90 | null;
    mesesDisponiveis: string[];
  };
};

export type OrderDto = Pedido;

export type OrderStatusUpdate = {
  id: string;
  status: PedidoStatus;
};

export type AdminCatalogMoto = CatalogMoto & {
  stockQuantity: number;
};

export type StockMovementType =
  | "entrada"
  | "saida"
  | "ajuste"
  | "venda"
  | "estorno_venda";

export type StockMovement = {
  id: string;
  motoId: string;
  motoName: string;
  type: StockMovementType;
  delta: number;
  previousQuantity: number;
  newQuantity: number;
  note: string;
  orderId: string | null;
  actorEmail: string;
  createdAt: string;
};

export type StockMovementInput = {
  motoId: string;
  type: "entrada" | "saida" | "ajuste";
  quantity: number;
  note?: string;
};

export type AdminSiteState = Omit<SiteState, "motos"> & {
  motos: AdminCatalogMoto[];
};

export type ManagementReportOrder = {
  createdAt: string;
  motoName: string;
  payment: string;
  delivery: string;
  city: string;
  status: PedidoStatus;
};

export type ManagementReportData = {
  store: { name: string; logoPath: string };
  generatedAt: string;
  overview: AdminOverview;
  inventory: AdminCatalogMoto[];
  movements: StockMovement[];
  orders: ManagementReportOrder[];
};
