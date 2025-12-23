import { menuData } from "@/data/menu";
import { MenuClient } from "./MenuClient";
import { listMenuCategories } from "@vira/shared/db/menu";
import { ensureRestaurantForSlug } from "@vira/shared/db/restaurants";
import { getIntegrations } from "@vira/shared/db/integrations";

export const dynamic = "force-dynamic";

export default async function MenuPage({ params }: { params: { slug: string } }) {
  const restaurant = await ensureRestaurantForSlug(params.slug);
  const [menuCategories, integrations] = await Promise.all([
    listMenuCategories(restaurant.id),
    getIntegrations(restaurant.id),
  ]);

  const posIntegration = integrations.find(
    (item) => item.type === "POS_IIKO" || item.type === "POS_RKEEPER",
  );
  const whatsappIntegration = integrations.find(
    (item) => item.type === "WHATSAPP",
  );

  const orderUrl = (posIntegration?.config as Record<string, unknown> | null)
    ?.orderUrl as string | undefined;
  const whatsappPhone = (whatsappIntegration?.config as Record<string, unknown> | null)
    ?.phone as string | undefined;

  const categories =
    menuCategories.length > 0
      ? menuCategories
          .filter((category) => category.isActive)
          .map((category) => ({
            ...category,
            items: category.items.filter((item) => item.isAvailable),
          }))
      : menuData;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Меню
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Закажите заранее или за столом
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Выберите блюда и напитки сейчас. Мы подтвердим заказ в чате и подадим
          к вашему приходу.
        </p>
      </div>
      <MenuClient
        slug={params.slug}
        whatsappPhone={whatsappPhone}
        orderUrl={orderUrl}
        categories={categories}
      />
    </div>
  );
}
