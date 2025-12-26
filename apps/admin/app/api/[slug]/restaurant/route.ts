import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@vira/shared/db/client";
import { getMediaAsset, resolveAssetUrl } from "@vira/shared/db/media";
import { formatSlug } from "@vira/shared/db/restaurants";
import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { requireAdminRestaurant } from "@/app/api/utils";
import { syncClerkRestaurantMetadata } from "@/lib/clerk-metadata";

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

  const { error, restaurant, user } = await requireAdminRestaurant(
    slug,
    request,
  );
  if (error) return error;

  // Use select for better performance
  const record = await prisma.restaurant.findUnique({
    where: { id: restaurant.id },
    select: {
      id: true,
      name: true,
      phone: true,
      logoAssetId: true,
      logoAsset: {
        select: {
          id: true,
          objectKey: true,
          publicUrl: true,
        },
      },
    },
  });

  return NextResponse.json({
    restaurant: {
      id: restaurant.id,
      name: record?.name ?? restaurant.name,
      phone: record?.phone ?? restaurant.phone ?? null,
      logoAssetId: record?.logoAssetId ?? null,
      logoUrl: resolveAssetUrl(record?.logoAsset ?? null),
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

  const { error, restaurant, user } = await requireAdminRestaurant(slug, request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Некорректный JSON.", 400);
  }

  const payload = body as {
    name?: string;
    slug?: string;
    logoAssetId?: number | null;
    phone?: string | null;
  };

  if (!payload.name || typeof payload.name !== "string") {
    return jsonError("Название обязательно.", 400);
  }

  let nextSlug = restaurant.slug;
  if (payload.slug !== undefined) {
    if (typeof payload.slug !== "string") {
      return jsonError("Slug обязателен.", 400);
    }
    const normalizedSlug = formatSlug(payload.slug);
    if (!normalizedSlug) {
      return jsonError("Некорректный slug.", 400);
    }
    if (normalizedSlug !== restaurant.slug) {
      const existing = await prisma.restaurant.findUnique({
        where: { slug: normalizedSlug },
      });
      if (existing && existing.id !== restaurant.id) {
        return jsonError("Такой slug уже используется.", 400);
      }
      nextSlug = normalizedSlug;
    }
  }

  if (payload.logoAssetId) {
    const asset = await getMediaAsset(payload.logoAssetId, restaurant.id);
    if (!asset) {
      return jsonError("Некорректный логотип.", 400);
    }
  }

  // Use select to only return needed fields
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: payload.name.trim(),
      slug: nextSlug,
      logoAssetId: payload.logoAssetId ?? null,
      phone: payload.phone?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      logoAssetId: true,
    },
  });

  if (user) {
    await syncClerkRestaurantMetadata({
      userId: user.id,
      restaurant: { id: updated.id, slug: updated.slug },
      existingPrivateMetadata:
        (user.privateMetadata as Record<string, unknown> | undefined) ??
        undefined,
    });
  }

  return NextResponse.json({
    restaurant: {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      phone: updated.phone,
      logoAssetId: updated.logoAssetId,
    },
  });
}
