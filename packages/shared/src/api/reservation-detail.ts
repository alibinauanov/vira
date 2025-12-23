import { NextRequest, NextResponse } from "next/server";

import {
  deleteReservation,
  updateReservation,
} from "../db/reservations";
import { guardAdmin } from "./admin-auth";
import { jsonError, resolveSlug } from "./utils";
import { updateReservationSchema } from "./validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug?: string; id: string } | Promise<{ slug?: string; id: string }> },
) {
  let resolvedParams;
  try {
    resolvedParams = await Promise.resolve(params);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректные параметры.",
      400,
    );
  }

  let slug: string;
  try {
    slug = await resolveSlug(resolvedParams);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректный slug.",
      400,
    );
  }

  const authFailure = await guardAdmin(slug);
  if (authFailure) return authFailure;

  const id = Number(resolvedParams.id);
  if (Number.isNaN(id)) {
    return jsonError("Некорректный id брони.", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Некорректный JSON.", 400);
  }

  const parsed = updateReservationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.message, 400);
  }

  try {
    const reservation = await updateReservation(slug, id, parsed.data);
    return NextResponse.json({ reservation });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось обновить бронь.",
      400,
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug?: string; id: string } | Promise<{ slug?: string; id: string }> },
) {
  let resolvedParams;
  try {
    resolvedParams = await Promise.resolve(params);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректные параметры.",
      400,
    );
  }

  let slug: string;
  try {
    slug = await resolveSlug(resolvedParams);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректный slug.",
      400,
    );
  }

  const authFailure = await guardAdmin(slug);
  if (authFailure) return authFailure;

  const id = Number(resolvedParams.id);
  if (Number.isNaN(id)) {
    return jsonError("Некорректный id брони.", 400);
  }

  try {
    await deleteReservation(slug, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось удалить бронь.",
      400,
    );
  }
}
