import { BookingForm } from "./BookingForm";
import { ensureRestaurantForSlug } from "@vira/shared/db/restaurants";
import { getIntegrations } from "@vira/shared/db/integrations";
import { getActiveFloorPlan } from "@vira/shared/db/floor-plans";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await ensureRestaurantForSlug(slug);
  const [integrations, floorPlan] = await Promise.all([
    getIntegrations(restaurant.id),
    getActiveFloorPlan(restaurant.id),
  ]);
  const whatsappIntegration = integrations.find(
    (item) => item.type === "WHATSAPP",
  );
  const whatsappPhone = (whatsappIntegration?.config as Record<string, unknown> | null)
    ?.phone as string | undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Бронирование
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Забронируйте визит
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Укажите время и количество гостей. Мы подтвердим бронь в WhatsApp.
        </p>
      </div>
      <BookingForm
        slug={slug}
        whatsappPhone={whatsappPhone}
        floorPlan={
          floorPlan
            ? {
                canvasWidth: floorPlan.canvasWidth ?? 800,
                canvasHeight: floorPlan.canvasHeight ?? 480,
                tables: floorPlan.tables.map((table) => ({
                  id: table.id,
                  number: table.number,
                  label: table.label,
                  seats: table.seats,
                  x: table.x,
                  y: table.y,
                  width: table.width,
                  height: table.height,
                  rotation: table.rotation,
                })),
              }
            : null
        }
      />
    </div>
  );
}
