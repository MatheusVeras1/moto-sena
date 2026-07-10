import { getAdminSiteState, requireAdminUser, upsertMoto } from "@/lib/site/db";
import { motosUpdateSchema } from "@/lib/site/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const state = await getAdminSiteState();
  return Response.json(state);
}

export async function PUT(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const parsed = motosUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos." }, { status: 400 });
  }

  await Promise.all(parsed.data.motos.map((moto) => upsertMoto(moto)));
  const state = await getAdminSiteState();
  return Response.json(state);
}
