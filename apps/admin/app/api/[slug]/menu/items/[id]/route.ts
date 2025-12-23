import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@vira/shared/db/client";
import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { updateMenuItem, deleteMenuItem } from "@vira/shared/db/menu";
import { requireAdminRestaurant } from "@/app/api/utils";

const parseId = (raw: string) => {
  const id = Number(raw);
  if (Number.isNaN(id)) {
    throw new Error("Некорректный id блюда.");
  }
  return id;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug?: string; id: string } | Promise<{ slug?: string; id: string }> },
) {
  let slug: string;
  let id: number;
  try {
    const resolved = await Promise.resolve(params);
    slug = await resolveSlug(resolved);
    id = parseId(resolved.id);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректные параметры.",
      400,
    );
  }

  const { error, restaurant } = await requireAdminRestaurant(slug, request);
  if (error) return error;

  const existing = await prisma.menuItem.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!existing) {
    return jsonError("Блюдо не найдено.", 404);
  }

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

  if (payload.categoryId) {
    const category = await prisma.menuCategory.findFirst({
      where: { id: payload.categoryId, restaurantId: restaurant.id },
    });
    if (!category) {
      return jsonError("Категория не найдена.", 404);
    }
  }

  if (
    payload.price !== undefined &&
    (typeof payload.price !== "number" || Number.isNaN(payload.price))
  ) {
    return jsonError("Некорректная цена.", 400);
  }

  if (payload.imageAssetId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: payload.imageAssetId, restaurantId: restaurant.id },
    });
    if (!asset) {
      return jsonError("Некорректное изображение.", 400);
    }
  }

  const item = await updateMenuItem(restaurant.id, id, payload);
  return NextResponse.json({ item });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug?: string; id: string } | Promise<{ slug?: string; id: string }> },
) {
  let slug: string;
  let id: number;
  try {
    const resolved = await Promise.resolve(params);
    slug = await resolveSlug(resolved);
    id = parseId(resolved.id);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректные параметры.",
      400,
    );
  }

  const { error, restaurant } = await requireAdminRestaurant(slug, request);
  if (error) return error;

  const existing = await prisma.menuItem.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!existing) {
    return jsonError("Блюдо не найдено.", 404);
  }

  await deleteMenuItem(restaurant.id, id);
  return NextResponse.json({ success: true });
}
