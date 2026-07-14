import {
  applyStockMovement,
  getAdminSiteState,
  getStockMovements,
  requireAdminUser,
  StockConflictError,
} from "@/lib/site/db";
import { stockMovementSchema } from "@/lib/site/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const motoId = searchParams.get("motoId")?.trim();
  if (!motoId) return Response.json({ error: "Modelo inválido." }, { status: 400 });

  const movements = await getStockMovements({ motoId, limit: 50 });
  return Response.json({ movements });
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const parsed = stockMovementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  try {
    await applyStockMovement(parsed.data);
    const state = await getAdminSiteState();
    const movements = await getStockMovements({ motoId: parsed.data.motoId, limit: 50 });
    return Response.json({ motos: state.motos, movements });
  } catch (error) {
    if (error instanceof StockConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
