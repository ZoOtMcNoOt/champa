import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

const MEDIA_DIR = path.join(process.cwd(), "champa-resources");
const SAFE_PATTERN = /^\d{4}-\d{2}-\d{2}_\d{3}\.(jpg|jpeg|mp4)$/i;

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "mp4":
      return "video/mp4";
    case "jpeg":
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function badRequest() {
  return NextResponse.json({ ok: false, message: "Invalid media path." }, { status: 400 });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  if (!filename || !SAFE_PATTERN.test(filename)) {
    return badRequest();
  }

  const safeName = path.basename(filename);
  const fullPath = path.join(MEDIA_DIR, safeName);
  const ext = path.extname(safeName).slice(1).toLowerCase();

  let stat;
  try {
    stat = await fs.stat(fullPath);
  } catch {
    return NextResponse.json({ ok: false, message: "Media not found." }, { status: 404 });
  }

  const range = request.headers.get("range");
  if (ext === "mp4" && range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (!match) {
      return badRequest();
    }

    const start = match[1] ? Number.parseInt(match[1], 10) : 0;
    const end = match[2] ? Number.parseInt(match[2], 10) : stat.size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || end >= stat.size) {
      return badRequest();
    }

    const chunk = await fs.readFile(fullPath);
    const partial = chunk.subarray(start, end + 1);
    return new NextResponse(partial, {
      status: 206,
      headers: {
        "Content-Type": contentTypeForExt(ext),
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": String(partial.byteLength),
        "Cache-Control": "private, max-age=3600"
      }
    });
  }

  const file = await fs.readFile(fullPath);
  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": contentTypeForExt(ext),
      "Content-Length": String(stat.size),
      "Cache-Control": "private, max-age=3600"
    }
  });
}
