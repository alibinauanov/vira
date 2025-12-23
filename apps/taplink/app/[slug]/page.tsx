import {
  CalendarClock,
  MessageCircle,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { menuData } from "@/data/menu";
import { formatDateLabel } from "@/lib/utils";
import { ClientPageActions } from "./ClientPageActions";
import {
  defaultClientButtons,
  getClientPageConfig,
} from "@vira/shared/db/client-page";
import { listMenuCategories } from "@vira/shared/db/menu";
import { ensureRestaurantForSlug } from "@vira/shared/db/restaurants";
import { getIntegrations } from "@vira/shared/db/integrations";

export const dynamic = "force-dynamic";

export default async function RestaurantHome({
  params,
}: {
  params: { slug: string };
}) {
  const today = new Date();
  const restaurant = await ensureRestaurantForSlug(params.slug);
  const [config, menuCategories, integrations] = await Promise.all([
    getClientPageConfig(restaurant.id),
    listMenuCategories(restaurant.id),
    getIntegrations(restaurant.id),
  ]);

  const buttons = (config.buttons ?? defaultClientButtons()) as {
    id: string;
    text: string;
    color: string;
    type: "BOOKING" | "ORDER" | "WHATSAPP" | "KASPI" | "EXTERNAL_URL";
    url?: string | null;
    order: number;
    enabled: boolean;
  }[];

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

  const menuItems =
    menuCategories.length > 0
      ? menuCategories
          .filter((cat) => cat.isActive)
          .flatMap((cat) =>
            cat.items.filter((item) => item.isAvailable),
          )
      : menuData.flatMap((cat) => cat.items);
  const heroItems = menuItems.slice(0, 3);

  return (
    <main className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="grid gap-3 sm:grid-cols-[1.2fr_1fr] sm:items-center">
          <div className="flex flex-col gap-2">
            <Badge tone="neutral" className="w-fit bg-primary/10 text-primary">
              Бронирование столов · Подтверждение в WhatsApp
            </Badge>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Забронируйте визит за пару кликов. Подтвердим в WhatsApp.
            </h1>
            <p className="text-muted-foreground">
              Укажите желаемое время и количество гостей. Мы свяжемся для
              подтверждения.
            </p>
            <div className="pt-2">
              <ClientPageActions
                slug={params.slug}
                buttons={buttons}
                integrations={{
                  orderUrl: orderUrl ?? null,
                  whatsappPhone: whatsappPhone ?? null,
                  kaspiUrl: kaspiUrl ?? null,
                }}
              />
            </div>
          </div>
          <div className="grid gap-3 rounded-xl bg-gradient-to-b from-primary/5 to-primary/10 p-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-white/80 p-3 shadow-xs">
              <CalendarClock className="size-8 rounded-md bg-primary/10 p-2 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Сегодня
                </span>
                <span className="text-base font-semibold">
                  {formatDateLabel(today)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-white/80 p-3 shadow-xs">
              <Sparkles className="size-8 rounded-md bg-amber-100 p-2 text-amber-700" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Популярно сегодня
                </span>
                <div className="text-sm font-semibold">
                  {heroItems.map((item) => item.name).join(" • ")}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Как работает
            </p>
            <p className="text-muted-foreground">
              Мы фиксируем заявку и связываемся для подтверждения.
            </p>
          </div>
          <Button variant="secondary" href={`/${params.slug}/booking`}>
            Забронировать
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-white/80">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <CalendarClock className="size-5" />
                <span className="text-sm font-semibold">Выберите время</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Укажите дату, время и количество гостей.
              </p>
            </CardHeader>
          </Card>
          <Card className="bg-white/80">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <MessageCircle className="size-5" />
                <span className="text-sm font-semibold">Подтверждение</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Мы свяжемся в WhatsApp и подтвердим бронь.
              </p>
            </CardHeader>
          </Card>
          <Card className="bg-white/80">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <UtensilsCrossed className="size-5" />
                <span className="text-sm font-semibold">Приходите</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Готовим стол и ждём вас к назначенному времени.
              </p>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Хиты меню
            </p>
            <p className="text-muted-foreground">
              Несколько блюд, которые гости любят заказывать заранее.
            </p>
          </div>
          <Button variant="ghost" href={`/${params.slug}/menu`}>
            Смотреть всё меню
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {heroItems.map((item) => (
            <Card key={item.id} className="bg-white/80">
              <CardHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{item.name}</h3>
                  <Badge tone="neutral" className="bg-primary/10 text-primary">
                    {item.price.toLocaleString("ru-RU", {
                      style: "currency",
                      currency: "KZT",
                      maximumFractionDigits: 0,
                    })}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
