import { requireAdminUser } from "@/lib/site/db";
import { getManagementReport } from "@/lib/site/reports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireAdminUser();
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthValue = searchParams.get("month");
  const month = monthValue && /^\d{4}-\d{2}$/.test(monthValue) ? monthValue : null;
  const rangeValue = Number(searchParams.get("range"));
  const range = rangeValue === 7 || rangeValue === 90 ? rangeValue : 30;

  return Response.json(await getManagementReport({ month, range }));
}
