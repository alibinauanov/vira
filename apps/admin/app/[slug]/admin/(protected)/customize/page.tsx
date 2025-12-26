import { prisma } from "@vira/shared/db/client";
import {
  type ClientPageButton,
  defaultClientButtons,
  defaultClientTheme,
  getClientPageConfig,
} from "@vira/shared/db/client-page";
import { resolveAssetUrl } from "@vira/shared/db/media";
import { requireRestaurantContext } from "@/lib/tenant";
import { CustomizerClient } from "./CustomizerClient";

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurantContext(
    slug,
    `/${slug}/admin/customize`,
  );

  // Load config and assets in parallel for better performance
  const config = await getClientPageConfig(restaurant.id);
  const theme = (config.theme ?? defaultClientTheme()) as Record<string, unknown>;
  const buttons = (config.buttons ?? defaultClientButtons()) as Record<string, unknown>[];

  const backgroundAssetId = theme.backgroundAssetId as number | undefined;
  const logoOverrideAssetId = theme.logoOverrideAssetId as number | undefined;

  // Batch media asset queries for better performance
  const assetIds = [backgroundAssetId, logoOverrideAssetId].filter(
    (id): id is number => typeof id === "number"
  );
  
  const assets = assetIds.length > 0
    ? await prisma.mediaAsset.findMany({
        where: { id: { in: assetIds }, restaurantId: restaurant.id },
      })
    : [];

  const backgroundAsset = backgroundAssetId
    ? assets.find((a) => a.id === backgroundAssetId) ?? null
    : null;
  const logoOverrideAsset = logoOverrideAssetId
    ? assets.find((a) => a.id === logoOverrideAssetId) ?? null
    : null;

  return (
    <CustomizerClient
      slug={restaurant.slug}
      initialTheme={{
        backgroundColor: (theme.backgroundColor as string) ?? "#f8fafc",
        backgroundAssetId: backgroundAsset?.id ?? null,
        logoOverrideAssetId: logoOverrideAsset?.id ?? null,
      }}
      initialButtons={buttons as ClientPageButton[]}
      initialBackgroundUrl={resolveAssetUrl(backgroundAsset)}
      initialLogoUrl={resolveAssetUrl(logoOverrideAsset)}
    />
  );
}
