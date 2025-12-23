import { NextRequest } from "next/server";

import {
  createAdminSession,
  destroyAdminSession,
  verifyPassword,
} from "./admin-auth";
import { jsonError, resolveSlug } from "./utils";
import { adminLoginSchema } from "./validation";

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

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.message, 400);
  }

  if (!verifyPassword(parsed.data.password)) {
    return jsonError("Неверный пароль.", 401);
  }

  try {
    const slug = await resolveSlug(params);
    return createAdminSession(slug);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Некорректный slug.",
      400,
    );
  }
}

export async function DELETE() {
  return destroyAdminSession();
}
