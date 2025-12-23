import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseNumericParam(
  value: string | null,
  name: string,
): number {
  if (value === null) {
    throw new Error(`${name} обязательно`);
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`${name} должно быть числом`);
  }
  return num;
}

export function safeParseId(id: string | string[] | undefined, label = "id") {
  const raw = Array.isArray(id) ? id[0] : id;
  if (!raw) {
    throw new Error(`${label} обязателен`);
  }
  const numericId = Number(raw);
  if (Number.isNaN(numericId)) {
    throw new Error(`${label} должен быть числом`);
  }
  return numericId;
}

export async function resolveParams<T>(params: T | Promise<T>): Promise<T> {
  return await params;
}

export async function resolveSlug(
  params: { slug?: string } | Promise<{ slug?: string }>,
): Promise<string> {
  const resolved = await resolveParams(params);
  const slug = resolved.slug?.trim();
  if (!slug) {
    throw new Error("Требуется slug");
  }
  return slug;
}
