import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "vira_admin_session";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

const getPassword = () => process.env.ADMIN_PASSWORD ?? "admin123";

export async function isAdminAuthenticated(slug: string) {
  const store = await cookies();
  const session =
    typeof store.get === "function"
      ? store.get(ADMIN_COOKIE)?.value
      : store
          .getAll?.()
          ?.find((cookie) => cookie.name === ADMIN_COOKIE)?.value;
  return session === slug;
}

export async function guardAdmin(slug: string) {
  const authed = await isAdminAuthenticated(slug);
  if (!authed) {
    return NextResponse.json({ error: "Нет доступа." }, { status: 401 });
  }
  return null;
}

export function createAdminSession(slug: string) {
  const response = NextResponse.json({ ok: true, slug });
  response.cookies.set(ADMIN_COOKIE, slug, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}

export function destroyAdminSession() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function verifyPassword(password: string) {
  return password === getPassword();
}

export const adminCookieName = ADMIN_COOKIE;
