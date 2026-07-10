import { trackEvent } from "@/lib/site/db";
import { analyticsEventSchema } from "@/lib/site/validation";

export const dynamic = "force-dynamic";

/** Cidade/UF detectadas pela borda da Vercel a partir do IP (vêm URL-encoded). */
function geoFromHeaders(request: Request) {
  const decode = (value: string | null) => {
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const city = decode(request.headers.get("x-vercel-ip-city"));
  const region = decode(request.headers.get("x-vercel-ip-country-region"));
  const country = decode(request.headers.get("x-vercel-ip-country"));
  if (!city && !region && !country) return null;

  return { geoCity: city, geoRegion: region, geoCountry: country };
}

export async function POST(request: Request) {
  const parsed = analyticsEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Evento inválido." }, { status: 400 });
  }

  const geo = geoFromHeaders(request);
  await trackEvent({
    ...parsed.data,
    metadata: { ...parsed.data.metadata, ...geo },
  });
  return Response.json({ ok: true });
}
