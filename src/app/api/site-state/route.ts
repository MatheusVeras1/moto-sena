import { getPublicSiteState } from "@/lib/site/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getPublicSiteState();
  return Response.json(state, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
