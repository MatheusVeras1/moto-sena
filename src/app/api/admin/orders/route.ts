import { getOrders, requireAdminUser, updateOrderStatus } from "@/lib/site/db";
import { orderStatusSchema } from "@/lib/site/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const orders = await getOrders();
  return Response.json({ orders });
}

export async function PATCH(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const parsed = orderStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos." }, { status: 400 });
  }

  await updateOrderStatus(parsed.data.id, parsed.data.status);
  const orders = await getOrders();
  return Response.json({ orders });
}
