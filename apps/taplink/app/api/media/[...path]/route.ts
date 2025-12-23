import { NextRequest } from "next/server";
import path from "node:path";

import { readUploadFile } from "@vira/shared/storage/local";

export const runtime = "nodejs";

const contentTypeFor = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const segments = params.path ?? [];
  const objectKey = segments.join("/");
  try {
    const { filePath, buffer } = await readUploadFile(objectKey);

    return new Response(buffer, {
      headers: {
        "Content-Type": contentTypeFor(filePath),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
