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
  modeloLiderId: string;
  motosMaisVistas: Array<{
    motoId: string;
    nome: string;
    vistas: number;
    pedidos: number;
    tendencia: number | null;
  }>;
  funil: Array<{ etapa: string; valor: number }>;
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
    mesesDisponiveis: string[];
  };
};

export type OrderDto = Pedido;

export type OrderStatusUpdate = {
  id: string;
  status: PedidoStatus;
};
