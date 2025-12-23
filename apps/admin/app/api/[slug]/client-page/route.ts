import { NextRequest, NextResponse } from "next/server";

import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import {
  defaultClientButtons,
  defaultClientTheme,
  getClientPageConfig,
  upsertClientPageConfig,
} from "@vira/shared/db/client-page";
import { prisma } from "@vira/shared/db/client";
import { resolveAssetUrl } from "@vira/shared/db/media";
import { requireAdminRestaurant } from "@/app/api/utils";

export async function GET(
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

  const { error, restaurant } = await requireAdminRestaurant(slug, request);
  if (error) return error;

  const config = await getClientPageConfig(restaurant.id);
  const theme = (config.theme ?? defaultClientTheme()) as Record<string, unknown>;
  const buttons = (config.buttons ?? defaultClientButtons()) as Record<string, unknown>[];

  const backgroundAssetId = theme.backgroundAssetId as number | null | undefined;
  const logoOverrideAssetId = theme.logoOverrideAssetId as number | null | undefined;

  const [backgroundAsset, logoOverrideAsset] = await Promise.all([
    backgroundAssetId
      ? prisma.mediaAsset.findUnique({ where: { id: backgroundAssetId } })
      : null,
    logoOverrideAssetId
      ? prisma.mediaAsset.findUnique({ where: { id: logoOverrideAssetId } })
      : null,
  ]);

  return NextResponse.json({
    config: {
      theme,
      buttons,
      backgroundAsset: backgroundAsset
        ? {
            id: backgroundAsset.id,
            url: resolveAssetUrl(backgroundAsset),
          }
        : null,
      logoOverrideAsset: logoOverrideAsset
        ? {
            id: logoOverrideAsset.id,
            url: resolveAssetUrl(logoOverrideAsset),
          }
        : null,
    },
  });
}

export async function PUT(
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

  const { error, restaurant } = await requireAdminRestaurant(slug, request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Некорректный JSON.", 400);
  }

  const payload = body as {
    theme?: Record<string, unknown> | null;
    buttons?: Record<string, unknown>[] | null;
  };

  const theme = payload.theme ?? {};
  const backgroundAssetId = theme.backgroundAssetId as number | undefined;
  const logoOverrideAssetId = theme.logoOverrideAssetId as number | undefined;

  if (backgroundAssetId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: backgroundAssetId, restaurantId: restaurant.id },
    });
    if (!asset) {
      return jsonError("Некорректный фон.", 400);
    }
  }

  if (logoOverrideAssetId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: logoOverrideAssetId, restaurantId: restaurant.id },
    });
    if (!asset) {
      return jsonError("Некорректный логотип.", 400);
    }
  }

  const config = await upsertClientPageConfig(restaurant.id, {
    theme: payload.theme ?? null,
    buttons: payload.buttons ?? null,
  });

  return NextResponse.json({ config });
}
