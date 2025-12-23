import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { requireRestaurantContext } from "@/lib/tenant";

type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

const resolveNextParam = (searchParams?: SearchParams) => {
  const raw = searchParams?.next;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/")) return null;
  return value;
};

const buildRedirectPath = (slug: string, nextValue: string | null) => {
  if (!nextValue) return `/${slug}/admin`;
  const url = new URL(nextValue, "http://localhost");
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[1] === "admin") {
    const rest = segments.slice(2).join("/");
    const base = `/${slug}/admin`;
    const path = rest ? `${base}/${rest}` : base;
    return `${path}${url.search}`;
  }
  return `/${slug}/admin`;
};

export default async function AdminEntry({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const nextValue = resolveNextParam(resolvedSearchParams);
  const { userId } = await auth();
  if (!userId) {
    const redirectTarget = `/admin${nextValue ? `?next=${nextValue}` : ""}`;
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`,
    );
  }

  const { restaurant } = await requireRestaurantContext(
    undefined,
    "/admin",
  );
  redirect(buildRedirectPath(restaurant.slug, nextValue));
}
