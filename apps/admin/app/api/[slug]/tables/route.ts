import { NextRequest, NextResponse } from "next/server";

import {
  ensureActiveFloorPlan,
  saveFloorPlan,
} from "@vira/shared/db/floor-plans";
import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import { requireAdminRestaurant } from "@/app/api/utils";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

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
    const plan = await ensureActiveFloorPlan(restaurant.id);
    return NextResponse.json({
      floorPlan: {
        id: plan.id,
        name: plan.name,
        canvasWidth: plan.canvasWidth,
        canvasHeight: plan.canvasHeight,
        tables: plan.tables,
      },
    });
  } catch (err) {
    return jsonError(
      err instanceof Error
        ? err.message
        : "Не удалось загрузить план зала.",
      500,
    );
  }
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
    tables?: Array<{
      id?: number;
      number?: string;
      label?: string | null;
      seats?: number;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      rotation?: number | null;
    }>;
  };

  if (!Array.isArray(payload.tables)) {
    return jsonError("Список столов обязателен.", 400);
  }

  for (const table of payload.tables) {
    if (!table.number || typeof table.number !== "string") {
      return jsonError("Номер стола обязателен.", 400);
    }
    if (
      !isNumber(table.x) ||
      !isNumber(table.y) ||
      !isNumber(table.width) ||
      !isNumber(table.height)
    ) {
      return jsonError("Некорректные параметры стола.", 400);
    }
    if (!isNumber(table.seats) || table.seats < 1) {
      return jsonError("Укажите количество мест для стола.", 400);
    }
  }

  try {
    const plan = await saveFloorPlan(restaurant.id, {
      name: payload.name,
      canvasWidth: payload.canvasWidth,
      canvasHeight: payload.canvasHeight,
      tables: payload.tables.map((table) => ({
        id: table.id,
        number: table.number ?? "",
        label: table.label ?? null,
        seats: table.seats ?? 2,
        x: table.x ?? 0,
        y: table.y ?? 0,
        width: table.width ?? 80,
        height: table.height ?? 80,
        rotation: table.rotation ?? null,
      })),
    });
    return NextResponse.json({
      floorPlan: {
        id: plan?.id,
        name: plan?.name,
        canvasWidth: plan?.canvasWidth,
        canvasHeight: plan?.canvasHeight,
        tables: plan?.tables ?? [],
      },
    });
  } catch (err) {
    return jsonError(
      err instanceof Error
        ? err.message
        : "Не удалось сохранить план зала.",
      400,
    );
  }
}
