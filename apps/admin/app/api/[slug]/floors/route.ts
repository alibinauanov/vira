import { NextRequest, NextResponse } from "next/server";

import {
  listFloorPlans,
  createFloorPlan,
} from "@vira/shared/db/floor-plans";
import { jsonError, resolveSlug } from "@vira/shared/api/utils";
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
      error instanceof Error ? error.message : "Некорректный slug",
      400,
    );
  }

  const { error, restaurant } = await requireAdminRestaurant(slug, request);
  if (error) return error;

  try {
    const floors = await listFloorPlans(restaurant.id);
    return NextResponse.json({
      floors: floors.map((floor) => ({
        id: floor.id,
        name: floor.name,
        isActive: floor.isActive,
        canvasWidth: floor.canvasWidth,
        canvasHeight: floor.canvasHeight,
        tableCount: floor.tables.length,
      })),
    });
  } catch (err) {
    return jsonError(
      err instanceof Error
        ? err.message
        : "Не удалось загрузить планы этажей.",
      500,
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug?: string } | Promise<{ slug?: string }> },
) {
  let slug: string;
  try {
    slug = await resolveSlug(params);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректный slug",
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
    canvasWidth?: number;
    canvasHeight?: number;
  };

  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
    return jsonError("Название этажа обязательно.", 400);
  }

  try {
    const floor = await createFloorPlan(restaurant.id, {
      name: payload.name,
      canvasWidth: payload.canvasWidth,
      canvasHeight: payload.canvasHeight,
    });
    return NextResponse.json({
      floor: {
        id: floor.id,
        name: floor.name,
        isActive: floor.isActive,
        canvasWidth: floor.canvasWidth,
        canvasHeight: floor.canvasHeight,
        tableCount: floor.tables.length,
      },
    });
  } catch (err) {
    return jsonError(
      err instanceof Error
        ? err.message
        : "Не удалось создать план этажа.",
      400,
    );
  }
}

