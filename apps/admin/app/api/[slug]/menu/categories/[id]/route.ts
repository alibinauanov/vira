import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@vira/shared/db/client";
import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { deleteMenuCategory, updateMenuCategory } from "@vira/shared/db/menu";
import { requireAdminRestaurant } from "@/app/api/utils";

const parseId = (raw: string) => {
  const id = Number(raw);
  if (Number.isNaN(id)) {
    throw new Error("Некорректный id категории.");
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

  const existing = await prisma.menuCategory.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!existing) {
    return jsonError("Категория не найдена.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Некорректный JSON.", 400);
  }

  const payload = body as {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  const category = await updateMenuCategory(restaurant.id, id, payload);
  return NextResponse.json({ category });
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

  const existing = await prisma.menuCategory.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!existing) {
    return jsonError("Категория не найдена.", 404);
  }

  await deleteMenuCategory(restaurant.id, id);
  return NextResponse.json({ success: true });
}
