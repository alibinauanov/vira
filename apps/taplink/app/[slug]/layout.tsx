import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
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
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full bg-white/70 px-3 py-1">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={restaurant.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  restaurant.name.slice(0, 1)
                )}
              </div>
              <span className="text-sm font-semibold text-primary">
                {restaurant.name}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Taplink · Бронирование · Меню
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" href={`/${slug}/booking`}>
              Бронь
            </Button>
            <Button variant="ghost" href={`/${slug}/menu`}>
              Меню
            </Button>
            <Button variant="ghost" href={`/${slug}/whatsapp`}>
              WhatsApp
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
