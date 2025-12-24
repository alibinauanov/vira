import { NextRequest, NextResponse } from "next/server";
import { IntegrationType } from "@vira/shared/db/integrations";

import { jsonError, resolveSlug } from "@vira/shared/api/utils";
import type { IntegrationConfig } from "@vira/shared/db/integrations";
import { getIntegrations, upsertIntegration } from "@vira/shared/db/integrations";
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

  const integrations = await getIntegrations(restaurant.id);
  return NextResponse.json({ integrations });
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
    type?: IntegrationType;
    config?: IntegrationConfig;
  };
  if (!payload.type || !Object.values(IntegrationType).includes(payload.type)) {
    return jsonError("Укажите тип интеграции.", 400);
  }

  const integration = await upsertIntegration(
    restaurant.id,
    payload.type,
    payload.config ?? {},
  );

  return NextResponse.json({ integration });
}
