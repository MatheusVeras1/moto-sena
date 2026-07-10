import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIDEO_ROOT = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "private",
  "videos"
);

const allowedVideos = {
  campanhas: new Set(["vitrine", "atendimento", "modelos", "tecnologia", "entrega"]),
  hero: new Set(["hero-urban-stickman"]),
  "hero-modelos": new Set([
    "bob-max-1000w",
    "mini-bob-500w",
    "one-max-1000w",
    "ttx-1000w",
    "v9-max-1000w",
    "x11-1000w",
    "x13-1000w",
    "yep-1000w",
  ]),
  motos: new Set([
    "bob-max-1000w",
    "mini-bob-500w",
    "one-max-1000w",
    "ttx-1000w",
    "v9-max-1000w",
    "x11-1000w",
    "x13-1000w",
    "yep-1000w",
  ]),
} as const;

type VideoGroup = keyof typeof allowedVideos;

function isVideoGroup(group: string): group is VideoGroup {
  return group in allowedVideos;
}

function notFound() {
  return new Response(null, { status: 404 });
}

function isDocumentRequest(request: NextRequest) {
  const fetchDest = request.headers.get("sec-fetch-dest");
  const accept = request.headers.get("accept") ?? "";

  return fetchDest === "document" || accept.includes("text/html");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ group: string; id: string }> }
) {
  const { group, id } = await params;

  if (!isVideoGroup(group) || !allowedVideos[group].has(id) || isDocumentRequest(request)) {
    return notFound();
  }

  const filePath = path.join(VIDEO_ROOT, group, `${id}.mp4`);

  let size: number;
  try {
    size = statSync(filePath).size;
  } catch {
    return notFound();
  }

  const range = request.headers.get("range");
  const commonHeaders = {
    "Accept-Ranges": "bytes",
    "Content-Type": "video/mp4",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": "inline",
  };

  if (!range) {
    const stream = createReadStream(filePath);

    return new Response(Readable.toWeb(stream) as BodyInit, {
      status: 200,
      headers: {
        ...commonHeaders,
        "Content-Length": String(size),
      },
    });
  }

  const match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    return new Response(null, {
      status: 416,
      headers: {
        ...commonHeaders,
        "Content-Range": `bytes */${size}`,
      },
    });
  }

  const start = match[1] ? Number.parseInt(match[1], 10) : 0;
  const end = match[2] ? Number.parseInt(match[2], 10) : size - 1;

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end >= size ||
    start > end
  ) {
    return new Response(null, {
      status: 416,
      headers: {
        ...commonHeaders,
        "Content-Range": `bytes */${size}`,
      },
    });
  }

  const stream = createReadStream(filePath, { start, end });
  const chunkSize = end - start + 1;

  return new Response(Readable.toWeb(stream) as BodyInit, {
    status: 206,
    headers: {
      ...commonHeaders,
      "Content-Length": String(chunkSize),
      "Content-Range": `bytes ${start}-${end}/${size}`,
    },
  });
}
