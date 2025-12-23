import { auth, clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { jsonError } from "@vira/shared/api/utils";
import { ensureRestaurantForUser } from "@vira/shared/db/restaurants";
import { syncClerkRestaurantMetadata } from "@/lib/clerk-metadata";

const buildDisplayName = (user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  emailAddresses?: Array<{ emailAddress: string }>;
} | null) => {
  if (!user) return null;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.username || user.emailAddresses?.[0]?.emailAddress;
};

export async function requireAdminRestaurant(
  paramsSlug?: string,
  request?: NextRequest,
) {
  const primaryAuth = await auth();
  const fallbackAuth = request ? getAuth(request) : null;
  const userId = primaryAuth.userId ?? fallbackAuth?.userId ?? null;
  if (!userId) {
    return { error: jsonError("Требуется авторизация.", 401) };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const restaurant = await ensureRestaurantForUser({
    clerkUserId: userId,
    name: buildDisplayName(user),
    preferredSlug: paramsSlug ?? null,
  });
  await syncClerkRestaurantMetadata({
    userId,
    restaurant: { id: restaurant.id, slug: restaurant.slug },
    existingPrivateMetadata:
      (user.privateMetadata as Record<string, unknown> | undefined) ?? undefined,
  });

  if (paramsSlug && restaurant.slug !== paramsSlug) {
    return {
      error: NextResponse.json(
        {
          error: "Slug не совпадает.",
          redirectSlug: restaurant.slug,
        },
        { status: 403 },
      ),
    };
  }

  return { restaurant, user };
}
