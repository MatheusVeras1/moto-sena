import { getOverview, requireAdminUser } from "@/lib/site/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const month = searchParams.get("month");
  const rangeParam = searchParams.get("range");
  const range = rangeParam === "7" || rangeParam === "90" ? Number(rangeParam) : 30;
  const overview = await getOverview({
    month: month && /^\d{4}-\d{2}$/.test(month) ? month : null,
    range: range as 7 | 30 | 90,
  });
  return Response.json(overview);
}
