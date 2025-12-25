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
  const restaurantRecord = await prisma.restaurant.findUnique({
    where: { id: restaurant.id },
    include: { logoAsset: true },
  });
  const config = await getClientPageConfig(restaurant.id);
  const theme = (config.theme ?? defaultClientTheme()) as Record<string, unknown>;
  const backgroundAssetId = theme.backgroundAssetId as number | undefined;
  const logoOverrideAssetId = theme.logoOverrideAssetId as number | undefined;

  const [backgroundAsset, logoOverrideAsset] = await Promise.all([
    backgroundAssetId
      ? prisma.mediaAsset.findUnique({ where: { id: backgroundAssetId } })
      : null,
    logoOverrideAssetId
      ? prisma.mediaAsset.findUnique({ where: { id: logoOverrideAssetId } })
      : null,
  ]);

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
