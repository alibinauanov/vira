import { clerkClient } from "@clerk/nextjs/server";

type RestaurantRef = {
  id: number;
  slug: string;
};

type MetadataRecord = Record<string, unknown>;

export async function syncClerkRestaurantMetadata(options: {
  userId: string;
  restaurant: RestaurantRef;
  existingPrivateMetadata?: MetadataRecord | null;
}) {
  const { userId, restaurant, existingPrivateMetadata } = options;
  const current = existingPrivateMetadata ?? {};
  const next = {
    ...current,
    restaurantId: restaurant.id,
    restaurantSlug: restaurant.slug,
  };

  if (
    current.restaurantId === restaurant.id &&
    current.restaurantSlug === restaurant.slug
  ) {
    return;
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: next,
    });
  } catch {
    return;
  }
}
