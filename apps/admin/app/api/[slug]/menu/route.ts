import { NextRequest, NextResponse } from "next/server";

import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { listMenuCategories } from "@vira/shared/db/menu";
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

  const categories = await listMenuCategories(restaurant.id);
  return NextResponse.json({ categories });
}
