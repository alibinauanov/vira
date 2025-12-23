import { NextRequest, NextResponse } from "next/server";

import {
  createReservation,
  listReservations,
} from "../db/reservations";
import {
  createReservationSchema,
} from "./validation";
import {
  jsonError,
  resolveSlug,
} from "./utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug?: string } | Promise<{ slug?: string }> },
) {
  try {
    const slug = await resolveSlug(params);
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") ?? undefined;
    const includeCancelled =
      (searchParams.get("includeCancelled") ?? "").toLowerCase() === "true";

    const reservations = await listReservations(slug, {
      date,
      includeCancelled,
    });
    return NextResponse.json({ reservations });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось загрузить брони.",
      error instanceof Error && error.message.includes("slug")
        ? 400
        : 500,
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug?: string } | Promise<{ slug?: string }> },
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Некорректный JSON.", 400);
  }

  const parsed = createReservationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.message, 400);
  }

  try {
    const slug = await resolveSlug(params);
    const reservation = await createReservation(slug, parsed.data);
    return NextResponse.json({ reservation });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось создать бронь.",
      error instanceof Error && error.message.includes("slug")
        ? 400
        : 400,
    );
  }
}
