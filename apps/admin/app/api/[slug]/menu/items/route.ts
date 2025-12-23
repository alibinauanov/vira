import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@vira/shared/db/client";
import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { createMenuItem } from "@vira/shared/db/menu";
import { requireAdminRestaurant } from "@/app/api/utils";

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

  const { error, restaurant } = await requireAdminRestaurant(slug, request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Некорректный JSON.", 400);
  }

  const payload = body as {
    categoryId?: number;
    name?: string;
    description?: string | null;
    price?: number;
    imageAssetId?: number | null;
    sortOrder?: number;
    isAvailable?: boolean;
  };

  if (!payload.categoryId || typeof payload.categoryId !== "number") {
    return jsonError("Укажите категорию.", 400);
  }

  const category = await prisma.menuCategory.findFirst({
    where: { id: payload.categoryId, restaurantId: restaurant.id },
  });
  if (!category) {
    return jsonError("Категория не найдена.", 404);
  }

  if (!payload.name || typeof payload.name !== "string") {
    return jsonError("Название блюда обязательно.", 400);
  }
  if (
    payload.price === undefined ||
    typeof payload.price !== "number" ||
    Number.isNaN(payload.price)
  ) {
    return jsonError("Цена обязательна.", 400);
  }

  if (payload.imageAssetId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: payload.imageAssetId, restaurantId: restaurant.id },
    });
    if (!asset) {
      return jsonError("Некорректное изображение.", 400);
    }
  }

  const item = await createMenuItem(restaurant.id, {
    categoryId: payload.categoryId,
    name: payload.name,
    description: payload.description ?? null,
    price: payload.price,
    imageAssetId: payload.imageAssetId ?? null,
    sortOrder: payload.sortOrder,
    isAvailable: payload.isAvailable,
  });

  return NextResponse.json({ item });
}
