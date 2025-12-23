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

  const config = await getClientPageConfig(restaurant.id);
  const theme = (config.theme ?? defaultClientTheme()) as Record<string, unknown>;
  const buttons = (config.buttons ?? defaultClientButtons()) as Record<string, unknown>[];

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
