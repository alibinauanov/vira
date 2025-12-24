import { MediaAssetKind, StorageProvider } from "@prisma/client";

import { prisma } from "./client";
import { ensureSchema } from "./schema";

// Re-export Prisma enums for use in other packages
export { MediaAssetKind, StorageProvider };

export async function createMediaAsset(payload: {
  restaurantId: number;
  kind: MediaAssetKind;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  storageProvider: StorageProvider;
  objectKey: string;
  publicUrl?: string | null;
  checksum?: string | null;
  createdByClerkUserId?: string | null;
}) {
  await ensureSchema();
  return prisma.mediaAsset.create({
    data: {
      restaurantId: payload.restaurantId,
      kind: payload.kind,
      originalFilename: payload.originalFilename,
      mimeType: payload.mimeType,
      sizeBytes: payload.sizeBytes,
      width: payload.width ?? null,
      height: payload.height ?? null,
      storageProvider: payload.storageProvider,
      objectKey: payload.objectKey,
      publicUrl: payload.publicUrl ?? null,
      checksum: payload.checksum ?? null,
      createdByClerkUserId: payload.createdByClerkUserId ?? null,
    },
  });
}

export async function getMediaAsset(
  id: number,
  restaurantId: number,
) {
  await ensureSchema();
  return prisma.mediaAsset.findFirst({
    where: { id, restaurantId },
  });
}

export const buildPublicAssetUrl = (objectKey: string) =>
  `/api/media/${objectKey}`;

export const resolveAssetUrl = (asset?: {
  objectKey: string;
  publicUrl: string | null;
} | null) => {
  if (!asset) return null;
  return asset.publicUrl || buildPublicAssetUrl(asset.objectKey);
};
