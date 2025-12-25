import { ReactNode } from "react";

import {
  defaultClientTheme,
  getClientPageConfig,
} from "@vira/shared/db/client-page";
import { prisma } from "@vira/shared/db/client";
import { resolveAssetUrl } from "@vira/shared/db/media";
import { ensureRestaurantForSlug } from "@vira/shared/db/restaurants";

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug?: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug || "demo-restaurant";
  const restaurant = await ensureRestaurantForSlug(slug);
  
  // Combine all queries in parallel for better performance
  const [restaurantRecord, config] = await Promise.all([
    restaurant.id > 0
      ? prisma.restaurant.findUnique({
          where: { id: restaurant.id },
          include: { logoAsset: true },
        })
      : Promise.resolve(null),
    restaurant.id > 0 ? getClientPageConfig(restaurant.id) : Promise.resolve(null),
  ]);
  
  const theme = (config?.theme ?? defaultClientTheme()) as Record<string, unknown>;
  const backgroundAssetId = theme.backgroundAssetId as number | undefined;
  const logoOverrideAssetId = theme.logoOverrideAssetId as number | undefined;

  // Only fetch media assets if IDs are present
  const mediaAssetIds = [
    backgroundAssetId,
    logoOverrideAssetId,
  ].filter((id): id is number => typeof id === "number");

  const mediaAssets = mediaAssetIds.length > 0 && restaurant.id > 0
    ? await prisma.mediaAsset.findMany({
        where: { 
          id: { in: mediaAssetIds },
          restaurantId: restaurant.id,
        },
      })
    : [];

  const backgroundAsset = backgroundAssetId
    ? mediaAssets.find((a) => a.id === backgroundAssetId) ?? null
    : null;
  const logoOverrideAsset = logoOverrideAssetId
    ? mediaAssets.find((a) => a.id === logoOverrideAssetId) ?? null
    : null;

  const backgroundUrl = resolveAssetUrl(backgroundAsset);
  const logoUrl =
    resolveAssetUrl(logoOverrideAsset) ??
    resolveAssetUrl(restaurantRecord?.logoAsset ?? null);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: (theme.backgroundColor as string) ?? "#f8fafc",
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {children}
      </div>
    </div>
  );
}
