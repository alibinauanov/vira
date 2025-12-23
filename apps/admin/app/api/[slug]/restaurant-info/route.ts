import { NextRequest, NextResponse } from "next/server";

import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import {
  getRestaurantInfo,
  upsertRestaurantInfo,
} from "@vira/shared/db/restaurant-info";
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

  const info = await getRestaurantInfo(restaurant.id);
  return NextResponse.json({ info });
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
    address?: string | null;
    workSchedule?: unknown;
    about?: string | null;
  };

  const info = await upsertRestaurantInfo(restaurant.id, {
    address: payload.address ?? null,
    workSchedule: payload.workSchedule ?? null,
    about: payload.about ?? null,
  });

  return NextResponse.json({ info });
}
