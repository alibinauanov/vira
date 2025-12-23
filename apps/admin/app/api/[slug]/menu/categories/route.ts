import { NextRequest, NextResponse } from "next/server";

import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { createMenuCategory } from "@vira/shared/db/menu";
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
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  if (!payload.name || typeof payload.name !== "string") {
    return jsonError("Название категории обязательно.", 400);
  }

  const category = await createMenuCategory(restaurant.id, {
    name: payload.name,
    sortOrder: payload.sortOrder,
    isActive: payload.isActive,
  });

  return NextResponse.json({ category });
}

export async function GET() {
  return NextResponse.json(
    { error: "Используйте /menu для списка категорий." },
    { status: 400 },
  );
}
