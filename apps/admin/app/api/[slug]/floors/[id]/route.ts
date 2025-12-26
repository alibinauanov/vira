import { NextRequest, NextResponse } from "next/server";

import {
  getFloorPlanById,
  updateFloorPlan,
  deleteFloorPlan,
  setActiveFloorPlan,
} from "@vira/shared/db/floor-plans";
import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { requireAdminRestaurant } from "@/app/api/utils";

const parseId = (raw: string) => {
  const id = Number(raw);
  if (Number.isNaN(id)) {
    throw new Error("Некорректный id этажа.");
  }
  return id;
};

export async function GET(
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

  try {
    const floor = await getFloorPlanById(restaurant.id, id);
    if (!floor) {
      return jsonError("План этажа не найден.", 404);
    }
    return NextResponse.json({
      floor: {
        id: floor.id,
        name: floor.name,
        isActive: floor.isActive,
        canvasWidth: floor.canvasWidth,
        canvasHeight: floor.canvasHeight,
        tables: floor.tables.map((table) => ({
          id: table.id,
          number: table.number,
          label: table.label,
          seats: table.seats,
          x: table.x,
          y: table.y,
          width: table.width,
          height: table.height,
          rotation: table.rotation,
        })),
      },
    });
  } catch (err) {
    return jsonError(
      err instanceof Error
        ? err.message
        : "Не удалось загрузить план этажа.",
      500,
    );
  }
}

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
    setActive?: boolean;
  };

  try {
    if (payload.setActive === true) {
      const floor = await setActiveFloorPlan(restaurant.id, id);
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
    } else {
      const floor = await updateFloorPlan(restaurant.id, id, {
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
    }
  } catch (err) {
    return jsonError(
      err instanceof Error
        ? err.message
        : "Не удалось обновить план этажа.",
      400,
    );
  }
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

  try {
    await deleteFloorPlan(restaurant.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return jsonError(
      err instanceof Error
        ? err.message
        : "Не удалось удалить план этажа.",
      400,
    );
  }
}

