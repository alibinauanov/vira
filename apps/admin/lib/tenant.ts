import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ensureRestaurantForUser } from "@vira/shared/db/restaurants";
import { syncClerkRestaurantMetadata } from "@/lib/clerk-metadata";

const buildDisplayName = (user: Awaited<ReturnType<typeof currentUser>>) => {
  if (!user) return null;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.username || user.emailAddresses?.[0]?.emailAddress;
};

export async function requireRestaurantContext(
  slug?: string,
  returnBackUrl?: string,
) {
  const { userId } = await auth();
  if (!userId) {
    const target =
      returnBackUrl && returnBackUrl.startsWith("/")
        ? returnBackUrl
        : "/";
    const redirectTarget = `/admin?next=${target}`;
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`,
    );
  }

  const user = await currentUser();
  const restaurant = await ensureRestaurantForUser({
    clerkUserId: userId,
    name: buildDisplayName(user),
    preferredSlug: slug ?? null,
  });
  if (user) {
    const privateMetadata =
      (user.privateMetadata as Record<string, unknown> | undefined) ?? undefined;
    await syncClerkRestaurantMetadata({
      userId,
      restaurant: { id: restaurant.id, slug: restaurant.slug },
      existingPrivateMetadata: privateMetadata,
    });
  }

  return { restaurant, user };
}
