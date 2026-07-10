import { z } from "zod";

export const motoUpdateSchema = z.object({
  id: z.string().min(1),
  price: z.number().positive().nullable().optional(),
  promoPrice: z.number().positive().nullable().optional(),
  active: z.boolean(),
});

export const motosUpdateSchema = z.object({
  motos: z.array(motoUpdateSchema).min(1),
});

export const settingsUpdateSchema = z.object({
  banner: z.string().max(240).default(""),
  featuredMotoId: z.string().min(1),
});

export const orderCreateSchema = z.object({
  motoId: z.string().min(1).max(80),
  motoName: z.string().min(1).max(120),
  payment: z.string().min(1).max(40),
  delivery: z.string().min(1).max(60),
  name: z.string().max(120).default(""),
  phone: z.string().max(40).default(""),
  city: z.string().max(80).default(""),
  // Honeypot: campo invisível no formulário; humano nunca preenche.
  empresa: z.string().max(200).optional(),
});

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["novo", "atendimento", "vendido", "perdido"]),
});

// Só os eventos que o site realmente dispara — impede injeção de eventos
// inventados que poluiriam as métricas do painel.
export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "moto_click",
  "detail_open",
  "viewer_360",
  "checkout_open",
  "whatsapp_click",
  "economy_calculator",
] as const;

export const analyticsEventSchema = z.object({
  eventType: z.enum(ANALYTICS_EVENT_TYPES),
  motoId: z.string().min(1).max(80).nullable().optional(),
  sessionId: z.string().min(1).max(120).nullable().optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .refine((value) => !value || JSON.stringify(value).length <= 2000, {
      message: "Metadata grande demais.",
    }),
});
