import { createOrder } from "@/lib/site/db";
import { orderCreateSchema } from "@/lib/site/validation";

export const dynamic = "force-dynamic";

// Limite de pedidos por IP (melhor esforço em serverless: vale por instância,
// mas já barra rajadas de spam vindas de um mesmo cliente).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentByIp = new Map<string, number[]>();

function clientIp(request: Request) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconhecido"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const hits = (recentByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recentByIp.set(ip, hits);
    return true;
  }
  hits.push(now);
  recentByIp.set(ip, hits);
  if (recentByIp.size > 5000) recentByIp.clear();
  return false;
}

export async function POST(request: Request) {
  const parsed = orderCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const { empresa, ...orderInput } = parsed.data;

  // Honeypot preenchido = bot. Responde ok sem gravar nada.
  if (empresa) {
    return Response.json({ ok: true });
  }

  if (isRateLimited(clientIp(request))) {
    return Response.json({ error: "Muitos pedidos em sequência." }, { status: 429 });
  }

  const order = await createOrder(orderInput);
  return Response.json({ ok: true, order });
}
