import { MapPin, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  defaultClientButtons,
  defaultClientTheme,
  getClientPageConfig,
} from "@vira/shared/db/client-page";
import { prisma } from "@vira/shared/db/client";
import { getIntegrations } from "@vira/shared/db/integrations";
import { resolveAssetUrl } from "@vira/shared/db/media";
import { getRestaurantInfo } from "@vira/shared/db/restaurant-info";
import { ensureRestaurantForSlug } from "@vira/shared/db/restaurants";
import { ClientPageActions } from "./ClientPageActions";

export const dynamic = "force-dynamic";

export default async function RestaurantHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await ensureRestaurantForSlug(slug);
  
  // Only fetch related data if restaurant.id is valid (not fallback)
  const [config, restaurantRecord, restaurantInfo, integrations] = await Promise.all([
    restaurant.id > 0 ? getClientPageConfig(restaurant.id).catch(() => null) : Promise.resolve(null),
    restaurant.id > 0
      ? prisma.restaurant
          .findUnique({
            where: { id: restaurant.id },
            include: { logoAsset: true },
          })
          .catch(() => null)
      : Promise.resolve(null),
    restaurant.id > 0 ? getRestaurantInfo(restaurant.id).catch(() => null) : Promise.resolve(null),
    restaurant.id > 0 ? getIntegrations(restaurant.id).catch(() => []) : Promise.resolve([]),
  ]);

  // Ensure we have valid config data - getClientPageConfig now properly parses JSON
  const themeConfig = config
    ? ((config.theme ?? defaultClientTheme()) as Record<string, unknown>)
    : defaultClientTheme();
  // Ensure buttons is always an array, even if config is null or buttons is null/undefined
  const buttons = Array.isArray(config?.buttons) && config.buttons.length > 0
    ? (config.buttons as {
        id: string;
        text: string;
        color: string;
        type: "BOOKING" | "MENU" | "ORDER" | "WHATSAPP" | "KASPI" | "EXTERNAL_URL";
        url?: string | null;
        order: number;
        enabled: boolean;
      }[])
    : defaultClientButtons();
  const backgroundAssetId = themeConfig.backgroundAssetId as number | undefined;
  const logoOverrideAssetId = themeConfig.logoOverrideAssetId as number | undefined;

  // Extract integration URLs for buttons
  const posIntegration = integrations.find(
    (item) => item.type === "POS_IIKO" || item.type === "POS_RKEEPER",
  );
  const whatsappIntegration = integrations.find(
    (item) => item.type === "WHATSAPP",
  );
  const kaspiIntegration = integrations.find((item) => item.type === "KASPI");

  const orderUrl = (posIntegration?.config as Record<string, unknown> | null)
    ?.orderUrl as string | undefined;
  const whatsappPhone = (whatsappIntegration?.config as Record<string, unknown> | null)
    ?.phone as string | undefined;
  const kaspiUrl = (kaspiIntegration?.config as Record<string, unknown> | null)
    ?.url as string | undefined;

  // Only fetch media assets if IDs are present - use findMany for better performance
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
      }).catch(() => [])
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

  // Parse work schedule - it can be JSON or plain text
  let workScheduleText: string | null = null;
  if (restaurantInfo?.workSchedule) {
    try {
      const schedule = restaurantInfo.workSchedule as unknown;
      if (typeof schedule === "string") {
        workScheduleText = schedule;
      } else if (typeof schedule === "object" && schedule !== null) {
        workScheduleText = JSON.stringify(schedule, null, 2);
      }
    } catch {
      workScheduleText = String(restaurantInfo.workSchedule);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[60vh]">
      <Card
        className="w-full max-w-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg"
        style={{
          backgroundColor: (themeConfig.backgroundColor as string) ?? "#ffffff",
        }}
      >
        <div
          className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5"
          style={{
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex h-full items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-white/90 shadow-lg">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={restaurant.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {restaurant.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {restaurant.name}
              </h1>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {restaurantInfo?.about && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {restaurantInfo.about}
              </p>
            </div>
          )}

          <div className="pt-2">
            <ClientPageActions
              slug={slug}
              buttons={buttons}
              integrations={{
                orderUrl: orderUrl ?? null,
                whatsappPhone: whatsappPhone ?? null,
                kaspiUrl: kaspiUrl ?? null,
              }}
            />
          </div>

          {restaurantInfo?.address && (
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Адрес
                </p>
                <p className="text-muted-foreground">{restaurantInfo.address}</p>
              </div>
            </div>
          )}

          {workScheduleText && (
            <div className="flex items-start gap-3">
              <Clock className="size-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  График работы
                </p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {workScheduleText}
                </p>
              </div>
            </div>
          )}

          {restaurant.phone && (
            <div className="flex items-start gap-3">
              <div className="size-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Телефон
                </p>
                <p className="text-muted-foreground">{restaurant.phone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
