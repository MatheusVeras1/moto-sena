import "server-only";

import { motos as fallbackMotos } from "@/data/motos";
import { money } from "@/lib/format";
import {
  createSupabaseAdminClient,
  createSupabasePublicClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type { AdminOverview, CatalogMoto, OrderDto, SiteState } from "./types";

type MotoRow = {
  id: string;
  name: string;
  short_name: string;
  price: number | null;
  promo_price: number | null;
  active: boolean;
  sort_order: number;
  tagline: string;
  description: string;
  video: string;
  hero_video: string | null;
  poster: string;
  specs: string[];
  highlights: string[];
  caution: string | null;
  updated_at: string;
};

type SettingsRow = {
  banner: string | null;
  featured_moto_id: string | null;
};

type OrderRow = {
  id: string;
  moto_id: string;
  moto_name: string;
  payment: string;
  delivery: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_city: string | null;
  status: OrderDto["status"];
  created_at: string;
};

export function fallbackSiteState(): SiteState {
  return {
    motos: fallbackMotos.map((moto, index) => ({
      ...moto,
      active: true,
      sortOrder: (index + 1) * 10,
    })),
    settings: {
      banner: "",
      featuredMotoId: "x13-1000w",
    },
    source: "fallback",
  };
}

function toMoto(row: MotoRow): CatalogMoto {
  const priceNumber = row.promo_price ?? row.price;
  const basePrice =
    row.promo_price != null && row.price != null ? money(row.price) : undefined;

  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    price: priceNumber != null ? money(priceNumber) : "Sob consulta",
    numericPrice: row.price ?? undefined,
    promoPrice: row.promo_price ?? undefined,
    active: row.active,
    sortOrder: row.sort_order,
    tagline: row.tagline,
    description: row.description,
    video: row.video,
    heroVideo: row.hero_video ?? undefined,
    poster: row.poster,
    basePrice,
    specs: row.specs ?? [],
    highlights: row.highlights ?? [],
    caution: row.caution ?? undefined,
    updatedAt: row.updated_at,
  };
}

function toOrder(row: OrderRow): OrderDto {
  return {
    id: row.id,
    motoId: row.moto_id,
    motoName: row.moto_name,
    payment: row.payment,
    delivery: row.delivery,
    name: row.buyer_name ?? "",
    phone: row.buyer_phone ?? "",
    city: row.buyer_city ?? "",
    createdAt: row.created_at,
    status: row.status,
  };
}

export async function getPublicSiteState(): Promise<SiteState> {
  const supabase = createSupabaseAdminClient() ?? createSupabasePublicClient();
  if (!supabase) return fallbackSiteState();

  const [motosResult, settingsResult] = await Promise.all([
    supabase
      .from("motos")
      .select(
        "id,name,short_name,price,promo_price,active,sort_order,tagline,description,video,hero_video,poster,specs,highlights,caution,updated_at"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("site_settings")
      .select("banner,featured_moto_id")
      .eq("id", "main")
      .maybeSingle(),
  ]);

  if (motosResult.error || !motosResult.data?.length) return fallbackSiteState();

  const settingsRow = settingsResult.data as SettingsRow | null;
  return {
    motos: (motosResult.data as MotoRow[]).map(toMoto),
    settings: {
      banner: settingsRow?.banner ?? "",
      featuredMotoId: settingsRow?.featured_moto_id ?? "x13-1000w",
    },
    source: "supabase",
  };
}

export async function getAdminSiteState(): Promise<SiteState> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallbackSiteState();

  const [motosResult, settingsResult] = await Promise.all([
    supabase
      .from("motos")
      .select(
        "id,name,short_name,price,promo_price,active,sort_order,tagline,description,video,hero_video,poster,specs,highlights,caution,updated_at"
      )
      .order("sort_order", { ascending: true }),
    supabase
      .from("site_settings")
      .select("banner,featured_moto_id")
      .eq("id", "main")
      .maybeSingle(),
  ]);

  if (motosResult.error || !motosResult.data?.length) return fallbackSiteState();

  const settingsRow = settingsResult.data as SettingsRow | null;
  return {
    motos: (motosResult.data as MotoRow[]).map(toMoto),
    settings: {
      banner: settingsRow?.banner ?? "",
      featuredMotoId: settingsRow?.featured_moto_id ?? "x13-1000w",
    },
    source: "supabase",
  };
}

/**
 * Conta de apresentaÃ§Ã£o: loga de verdade no Supabase Auth, mas nÃ£o tem perfil
 * em admin_profiles. No painel ela vÃª os dados simulados de analytics-demo e
 * nenhuma ediÃ§Ã£o dela chega ao banco real.
 */
// TROCAR por cliente: e-mail da conta de apresentacao criada no Supabase Auth
// (sem linha em admin_profiles). Ver IMPLANTACAO.md.
export const DEMO_GESTOR_EMAIL = "demo@motosena.com.br";

export type GestorAccess = {
  userId: string;
  email: string;
  isDemo: boolean;
};

export async function getGestorAccess(): Promise<GestorAccess | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const email = userData.user.email ?? "";
  if (email.toLowerCase() === DEMO_GESTOR_EMAIL) {
    return { userId: userData.user.id, email, isDemo: true };
  }

  const adminUser = await requireAdminUser();
  if (!adminUser) return null;
  return { userId: adminUser.id, email, isDemo: false };
}

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data: profile, error: profileError } = await admin
    .from("admin_profiles")
    .select("user_id,role,email")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (profileError || !profile) return null;
  return userData.user;
}

export async function upsertMoto(input: {
  id: string;
  price?: number | null;
  promoPrice?: number | null;
  active: boolean;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase nÃ£o configurado.");

  const patch = {
    price: input.price ?? null,
    promo_price: input.promoPrice ?? null,
    active: input.active,
  };

  const { error } = await supabase.from("motos").update(patch).eq("id", input.id);
  if (error) throw error;
}

export async function updateSettings(input: { banner: string; featuredMotoId: string }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase nÃ£o configurado.");

  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    banner: input.banner,
    featured_moto_id: input.featuredMotoId,
  });
  if (error) throw error;
}

export async function createOrder(input: {
  motoId: string;
  motoName: string;
  payment: string;
  delivery: string;
  name: string;
  phone: string;
  city: string;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      moto_id: input.motoId,
      moto_name: input.motoName,
      payment: input.payment,
      delivery: input.delivery,
      buyer_name: input.name,
      buyer_phone: input.phone,
      buyer_city: input.city,
    })
    .select(
      "id,moto_id,moto_name,payment,delivery,buyer_name,buyer_phone,buyer_city,status,created_at"
    )
    .single();

  if (error) throw error;
  return toOrder(data as OrderRow);
}

export async function getOrders() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,moto_id,moto_name,payment,delivery,buyer_name,buyer_phone,buyer_city,status,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data as OrderRow[]).map(toOrder);
}

export async function updateOrderStatus(id: string, status: OrderDto["status"]) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase nÃ£o configurado.");

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function trackEvent(input: {
  eventType: string;
  motoId?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("analytics_events").insert({
    event_type: input.eventType,
    moto_id: input.motoId ?? null,
    session_id: input.sessionId ?? null,
    metadata: input.metadata ?? {},
  });
}

// Mesmos valores de referÃªncia da calculadora do site (EconomyCalculator).
const CALC_KWH_POR_KM = 0.035;
const CALC_TARIFA_ENERGIA_KWH = 1.05;

// Fuso de BrasÃ­lia (sem horÃ¡rio de verÃ£o desde 2019).
const BRT_OFFSET_HOURS = 3;

type EventRow = {
  event_type: string;
  moto_id: string | null;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

/** InÃ­cio de um mÃªs "YYYY-MM" em UTC, considerando meia-noite de BrasÃ­lia. */
function monthStartUtc(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1, BRT_OFFSET_HOURS));
}

function parseMonth(month: string) {
  const [year, mm] = month.split("-").map(Number);
  return { year, monthIndex: mm - 1 };
}

function formatMonthLabel(month: string) {
  const { year, monthIndex } = parseMonth(month);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 15)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Meses "YYYY-MM" (fuso de BrasÃ­lia) do primeiro evento atÃ© hoje, do mais recente ao mais antigo. */
function listAvailableMonths(firstEventIso: string | null) {
  const now = new Date(Date.now() - BRT_OFFSET_HOURS * 60 * 60 * 1000);
  const last = { year: now.getUTCFullYear(), monthIndex: now.getUTCMonth() };
  const firstDate = firstEventIso
    ? new Date(new Date(firstEventIso).getTime() - BRT_OFFSET_HOURS * 60 * 60 * 1000)
    : now;
  const first = { year: firstDate.getUTCFullYear(), monthIndex: firstDate.getUTCMonth() };

  const months: string[] = [];
  let { year, monthIndex } = last;
  while (year > first.year || (year === first.year && monthIndex >= first.monthIndex)) {
    months.push(`${year}-${String(monthIndex + 1).padStart(2, "0")}`);
    monthIndex -= 1;
    if (monthIndex < 0) {
      monthIndex = 11;
      year -= 1;
    }
    if (months.length >= 24) break;
  }
  return months;
}

function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function classifyOrigin(metadata: Record<string, unknown> | null): string | null {
  if (!metadata || !("referrer" in metadata)) return null; // evento antigo, sem coleta
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

export async function getOverview(options: { month?: string | null } = {}): Promise<AdminOverview> {
  const supabase = createSupabaseAdminClient();
  const month = options.month ?? null;
  const fallback: AdminOverview = {
    visitas: 0,
    cliquesWhatsApp: 0,
    pedidosEnviados: 0,
    visitasDelta: null,
    cliquesDelta: null,
    pedidosDelta: null,
    modeloLiderId: "x13-1000w",
    motosMaisVistas: fallbackMotos.map((moto) => ({
      motoId: moto.id,
      nome: moto.name,
      vistas: 0,
      pedidos: 0,
      tendencia: null,
    })),
    funil: [
      { etapa: "Visitaram o site", valor: 0 },
      { etapa: "Abriram um modelo", valor: 0 },
      { etapa: "Giraram a moto em 360Â°", valor: 0 },
      { etapa: "Montaram um pedido", valor: 0 },
      { etapa: "Enviaram no WhatsApp", valor: 0 },
    ],
    horarios: Array.from({ length: 24 }, () => 0),
    origens: [],
    cidades: [],
    calculadora: null,
    periodo: {
      label: month ? formatMonthLabel(month) : "Ãšltimos 30 dias",
      month,
      mesesDisponiveis: [],
    },
  };
  if (!supabase) return fallback;

  // PerÃ­odo atual e perÃ­odo anterior (para deltas e tendÃªncias).
  let start: Date;
  let end: Date | null;
  let prevStart: Date;
  let prevEnd: Date;
  if (month) {
    const { year, monthIndex } = parseMonth(month);
    start = monthStartUtc(year, monthIndex);
    end = monthStartUtc(year, monthIndex + 1);
    prevStart = monthStartUtc(year, monthIndex - 1);
    prevEnd = start;
  } else {
    const now = Date.now();
    start = new Date(now - 30 * 24 * 60 * 60 * 1000);
    end = null;
    prevStart = new Date(now - 60 * 24 * 60 * 60 * 1000);
    prevEnd = start;
  }

  let eventsQuery = supabase
    .from("analytics_events")
    .select("event_type,moto_id,session_id,metadata,created_at")
    .gte("created_at", start.toISOString());
  if (end) eventsQuery = eventsQuery.lt("created_at", end.toISOString());

  let ordersQuery = supabase
    .from("orders")
    .select("moto_id,status")
    .gte("created_at", start.toISOString());
  if (end) ordersQuery = ordersQuery.lt("created_at", end.toISOString());

  const [eventsResult, ordersResult, prevEventsResult, prevOrdersResult, firstEventResult] =
    await Promise.all([
      eventsQuery,
      ordersQuery,
      supabase
        .from("analytics_events")
        .select("event_type,moto_id")
        .gte("created_at", prevStart.toISOString())
        .lt("created_at", prevEnd.toISOString()),
      supabase
        .from("orders")
        .select("moto_id")
        .gte("created_at", prevStart.toISOString())
        .lt("created_at", prevEnd.toISOString()),
      supabase
        .from("analytics_events")
        .select("created_at")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  if (eventsResult.error || ordersResult.error) return fallback;

  const events = (eventsResult.data ?? []) as EventRow[];
  const orders = (ordersResult.data ?? []) as Array<{ moto_id: string | null; status: string }>;
  const prevEvents = (prevEventsResult.data ?? []) as Array<{
    event_type: string;
    moto_id: string | null;
  }>;
  const prevOrders = (prevOrdersResult.data ?? []) as Array<{ moto_id: string | null }>;

  const countType = (list: Array<{ event_type: string }>, type: string) =>
    list.filter((event) => event.event_type === type).length;

  // Vistas e pedidos por moto (perÃ­odo atual e anterior, para tendÃªncia).
  const VISTA_EVENTS = ["moto_click", "detail_open", "checkout_open"];
  const byMoto = new Map<string, { vistas: number; pedidos: number; vistasAntes: number }>();
  for (const moto of fallbackMotos) byMoto.set(moto.id, { vistas: 0, pedidos: 0, vistasAntes: 0 });
  for (const event of events) {
    if (!event.moto_id) continue;
    const entry = byMoto.get(event.moto_id);
    if (entry && VISTA_EVENTS.includes(event.event_type)) entry.vistas += 1;
  }
  for (const event of prevEvents) {
    if (!event.moto_id) continue;
    const entry = byMoto.get(event.moto_id);
    if (entry && VISTA_EVENTS.includes(event.event_type)) entry.vistasAntes += 1;
  }
  for (const order of orders) {
    if (!order.moto_id) continue;
    const entry = byMoto.get(order.moto_id);
    if (entry) entry.pedidos += 1;
  }

  const motosMaisVistas = fallbackMotos
    .map((moto) => {
      const entry = byMoto.get(moto.id) ?? { vistas: 0, pedidos: 0, vistasAntes: 0 };
      return {
        motoId: moto.id,
        nome: moto.name,
        vistas: entry.vistas,
        pedidos: entry.pedidos,
        tendencia: percentDelta(entry.vistas, entry.vistasAntes),
      };
    })
    .sort((a, b) => b.vistas - a.vistas);

  // Visitas por hora do dia, no fuso de BrasÃ­lia.
  const horarios = Array.from({ length: 24 }, () => 0);
  for (const event of events) {
    if (event.event_type !== "page_view") continue;
    const hour = (new Date(event.created_at).getUTCHours() + 24 - BRT_OFFSET_HOURS) % 24;
    horarios[hour] += 1;
  }

  // Origem das visitas (sÃ³ page_view que jÃ¡ veio com coleta de referrer).
  const origemCount = new Map<string, number>();
  for (const event of events) {
    if (event.event_type !== "page_view") continue;
    const origem = classifyOrigin(event.metadata);
    if (!origem) continue;
    origemCount.set(origem, (origemCount.get(origem) ?? 0) + 1);
  }
  const origens = [...origemCount.entries()]
    .map(([origem, visitas]) => ({ origem, visitas }))
    .sort((a, b) => b.visitas - a.visitas);

  // Cidades detectadas pelo IP (borda da Vercel).
  const cidadeCount = new Map<string, number>();
  for (const event of events) {
    if (event.event_type !== "page_view") continue;
    const city = event.metadata?.geoCity;
    if (typeof city !== "string" || !city) continue;
    cidadeCount.set(city, (cidadeCount.get(city) ?? 0) + 1);
  }
  const cidades = [...cidadeCount.entries()]
    .map(([cidade, visitas]) => ({ cidade, visitas }))
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 6);

  // Calculadora: Ãºltima simulaÃ§Ã£o de cada sessÃ£o (valores em que a pessoa parou).
  const calcBySession = new Map<string, { dailyKm: number; days: number; gasCost: number }>();
  for (const event of events) {
    if (event.event_type !== "economy_calculator") continue;
    const meta = event.metadata ?? {};
    const dailyKm = Number(meta.dailyKm);
    const days = Number(meta.days);
    const gasCost = Number(meta.gasCost);
    if (!Number.isFinite(dailyKm) || !Number.isFinite(days) || !Number.isFinite(gasCost)) continue;
    calcBySession.set(event.session_id ?? event.created_at, { dailyKm, days, gasCost });
  }
  const simulacoes = [...calcBySession.values()];
  const media = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const calculadora = simulacoes.length
    ? {
        simulacoes: simulacoes.length,
        gastoGasolinaMedio: Math.round(media(simulacoes.map((s) => s.gasCost))),
        kmPorDiaMedio: Math.round(media(simulacoes.map((s) => s.dailyKm))),
        economiaMediaEstimada: Math.round(
          media(
            simulacoes.map((s) =>
              Math.max(
                0,
                s.gasCost - s.dailyKm * s.days * CALC_KWH_POR_KM * CALC_TARIFA_ENERGIA_KWH
              )
            )
          )
        ),
      }
    : null;

  const visitas = countType(events, "page_view");
  const cliquesWhatsApp = countType(events, "whatsapp_click");

  return {
    visitas,
    cliquesWhatsApp,
    pedidosEnviados: orders.length,
    visitasDelta: percentDelta(visitas, countType(prevEvents, "page_view")),
    cliquesDelta: percentDelta(cliquesWhatsApp, countType(prevEvents, "whatsapp_click")),
    pedidosDelta: percentDelta(orders.length, prevOrders.length),
    modeloLiderId: motosMaisVistas[0]?.motoId ?? "x13-1000w",
    motosMaisVistas,
    funil: [
      { etapa: "Visitaram o site", valor: visitas },
      { etapa: "Abriram um modelo", valor: countType(events, "detail_open") },
      { etapa: "Giraram a moto em 360Â°", valor: countType(events, "viewer_360") },
      { etapa: "Montaram um pedido", valor: countType(events, "checkout_open") },
      { etapa: "Enviaram no WhatsApp", valor: cliquesWhatsApp },
    ],
    horarios,
    origens,
    cidades,
    calculadora,
    periodo: {
      label: month ? formatMonthLabel(month) : "Ãšltimos 30 dias",
      month,
      mesesDisponiveis: listAvailableMonths(firstEventResult.data?.created_at ?? null),
    },
  };
}
