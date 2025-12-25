import { PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ensureRestaurantForSlug } from "@vira/shared/db/restaurants";
import { getIntegrations } from "@vira/shared/db/integrations";

export const dynamic = "force-dynamic";

export default async function WhatsappPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await ensureRestaurantForSlug(slug);
  const integrations = await getIntegrations(restaurant.id);
  const whatsappIntegration = integrations.find(
    (item) => item.type === "WHATSAPP",
  );
  const phone = (whatsappIntegration?.config as Record<string, unknown> | null)
    ?.phone as string | undefined;
  const phoneDigits = (phone ?? "").replace(/[^\d]/g, "");
  const hasPhone = phoneDigits.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          WhatsApp
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Свяжитесь с хостес мгновенно
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Напишите нам, чтобы подтвердить бронь или уточнить детали.
        </p>
      </div>

      <Card className="bg-white/80">
        <CardHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary">
            <PhoneCall className="size-4" />
            <span className="text-sm font-semibold">WhatsApp</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {phone ?? "Не настроено"}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            href={hasPhone ? `https://wa.me/${phoneDigits}` : undefined}
            disabled={!hasPhone}
          >
            Открыть чат
          </Button>
          <Button variant="secondary" href={`/${slug}/booking`}>
            Забронировать визит
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
