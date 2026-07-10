import { getOverview, requireAdminUser } from "@/lib/site/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const month = new URL(request.url).searchParams.get("month");
  const overview = await getOverview({
    month: month && /^\d{4}-\d{2}$/.test(month) ? month : null,
  });
  return Response.json(overview);
}
