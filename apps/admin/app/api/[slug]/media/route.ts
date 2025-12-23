import { NextRequest, NextResponse } from "next/server";
import { MediaAssetKind, StorageProvider } from "@prisma/client";

import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { createMediaAsset, buildPublicAssetUrl } from "@vira/shared/db/media";
import { buildObjectKey, createChecksum, writeUploadFile } from "@vira/shared/storage/local";
import { requireAdminRestaurant } from "@/app/api/utils";

export const runtime = "nodejs";

const allowedMime = ["image/jpeg", "image/png", "image/webp"];
const maxBytes = 5 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: { slug?: string } | Promise<{ slug?: string }> },
) {
  let slug: string;
  try {
    slug = await resolveSlug(params);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректный slug.",
      400,
    );
  }

  const { error, restaurant, user } = await requireAdminRestaurant(
    slug,
    request,
  );
  if (error) return error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Некорректные данные формы.", 400);
  }

  const file = formData.get("file");
  const kindRaw = formData.get("kind");

  if (!(file instanceof File)) {
    return jsonError("Файл обязателен.", 400);
  }
  if (file.size > maxBytes) {
    return jsonError("Файл слишком большой.", 400);
  }
  if (!allowedMime.includes(file.type)) {
    return jsonError("Неподдерживаемый формат файла.", 400);
  }

  const kind = Object.values(MediaAssetKind).includes(
    kindRaw as MediaAssetKind,
  )
    ? (kindRaw as MediaAssetKind)
    : MediaAssetKind.OTHER;

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = createChecksum(buffer);
  const objectKey = buildObjectKey(
    restaurant.id,
    file.name,
    kind.toLowerCase(),
  );
  await writeUploadFile(objectKey, buffer);

  const publicUrl = buildPublicAssetUrl(objectKey);
  const asset = await createMediaAsset({
    restaurantId: restaurant.id,
    kind,
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    storageProvider: StorageProvider.LOCAL,
    objectKey,
    publicUrl,
    checksum,
    createdByClerkUserId: user.id,
  });

  return NextResponse.json({
    asset: {
      id: asset.id,
      publicUrl,
      kind: asset.kind,
      objectKey: asset.objectKey,
    },
  });
}
