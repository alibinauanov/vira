import { prisma } from "@vira/shared/db/client";
import { resolveAssetUrl } from "@vira/shared/db/media";
import { requireRestaurantContext } from "@/lib/tenant";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant, user } = await requireRestaurantContext(
    slug,
    `/${slug}/admin/profile`,
  );
  // Use select instead of include for better performance
  const record = await prisma.restaurant.findUnique({
    where: { id: restaurant.id },
    select: {
      id: true,
      name: true,
      phone: true,
      logoAssetId: true,
      logoAsset: {
        select: {
          id: true,
          objectKey: true,
          publicUrl: true,
        },
      },
    },
  });

  return (
    <ProfileClient
      slug={restaurant.slug}
      initialRestaurant={{
        id: restaurant.id,
        slug: restaurant.slug,
        name: record?.name ?? restaurant.name,
        phone: record?.phone ?? restaurant.phone ?? null,
        logoUrl: resolveAssetUrl(record?.logoAsset ?? null),
        logoAssetId: record?.logoAssetId ?? null,
      }}
      accountEmail={user?.primaryEmailAddress?.emailAddress ?? null}
    />
  );
}
