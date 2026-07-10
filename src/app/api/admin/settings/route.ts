import { getAdminSiteState, requireAdminUser, updateSettings } from "@/lib/site/db";
import { settingsUpdateSchema } from "@/lib/site/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const state = await getAdminSiteState();
  return Response.json(state.settings);
}

export async function PUT(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const parsed = settingsUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos." }, { status: 400 });
  }

  await updateSettings(parsed.data);
  const state = await getAdminSiteState();
  return Response.json(state.settings);
}
