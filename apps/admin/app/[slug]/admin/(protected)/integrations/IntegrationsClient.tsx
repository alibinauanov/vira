"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type IntegrationType = "POS_IIKO" | "POS_RKEEPER" | "WHATSAPP" | "KASPI";
type IntegrationStatus = "DISCONNECTED" | "CONFIGURED" | "ACTIVE";

type Integration = {
  id: number;
  type: IntegrationType;
  status: IntegrationStatus;
  config: Record<string, unknown> | null;
};

type Props = {
  slug: string;
  initialIntegrations: Integration[];
};

const statusLabel = (status: IntegrationStatus) => {
  switch (status) {
    case "CONFIGURED":
      return "Настроено";
    case "ACTIVE":
      return "Активно (скоро)";
    default:
      return "Не подключено";
  }
};

export function IntegrationsClient({ slug, initialIntegrations }: Props) {
  const [integrations, setIntegrations] = useState<Integration[]>(
    initialIntegrations,
  );
  const [posProvider, setPosProvider] = useState<IntegrationType>("POS_IIKO");
  const [posOrderUrl, setPosOrderUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappGreeting, setWhatsappGreeting] = useState("");
  const [kaspiUrl, setKaspiUrl] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getConfig = (type: IntegrationType) =>
    integrations.find((item) => item.type === type)?.config ?? {};

  const handleSave = async (type: IntegrationType, config: Record<string, unknown>) => {
    setSaving(type);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/integrations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, config }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось сохранить интеграцию.");
      }
      setIntegrations((prev) => {
        const next = prev.filter((item) => item.type !== type);
        return [...next, body.integration];
      });
      setMessage("Интеграция сохранена.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить интеграцию.",
      );
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    setIntegrations(initialIntegrations);
    const posIntegration =
      initialIntegrations.find((item) => item.type === "POS_IIKO") ??
      initialIntegrations.find((item) => item.type === "POS_RKEEPER");
    const provider = posIntegration?.type ?? "POS_IIKO";
    const posConfig = posIntegration?.config ?? {};
    setPosProvider(provider);
    setPosOrderUrl((posConfig.orderUrl as string) ?? "");

    const whatsappIntegration = initialIntegrations.find(
      (item) => item.type === "WHATSAPP",
    );
    const whatsappConfig = whatsappIntegration?.config ?? {};
    setWhatsappNumber((whatsappConfig.phone as string) ?? "");
    setWhatsappGreeting((whatsappConfig.greeting as string) ?? "");

    const kaspiIntegration = initialIntegrations.find(
      (item) => item.type === "KASPI",
    );
    const kaspiConfig = kaspiIntegration?.config ?? {};
    setKaspiUrl((kaspiConfig.url as string) ?? "");
  }, [initialIntegrations]);

  const posConfig = getConfig(posProvider);

  const integrationStatus = (type: IntegrationType) =>
    integrations.find((item) => item.type === type)?.status ?? "DISCONNECTED";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Интеграции
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Подключение сервисов
        </h1>
        <p className="text-muted-foreground">
          Настройте данные сейчас. Интеграции будут активированы позже.
        </p>
      </div>

      <Card className="bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-lg font-semibold">POS провайдер</p>
            <p className="text-sm text-muted-foreground">
              Статус: {statusLabel(integrationStatus(posProvider))}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Провайдер</label>
            <Select
              value={posProvider}
              onChange={(event) =>
                setPosProvider(event.target.value as IntegrationType)
              }
            >
              <option value="POS_IIKO">iiko</option>
              <option value="POS_RKEEPER">r_keeper</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Ссылка на заказ</label>
            <Input
              value={posOrderUrl}
              onChange={(event) => setPosOrderUrl(event.target.value)}
              placeholder="https://orders.example.com"
            />
            <p className="text-xs text-muted-foreground">
              Гости будут переходить по этой ссылке при заказе.
            </p>
          </div>
          <Button
            onClick={() =>
              handleSave(posProvider, {
                ...posConfig,
                provider: posProvider,
                orderUrl: posOrderUrl,
              })
            }
            loading={saving === posProvider}
          >
            <Save className="size-4" />
            Сохранить POS
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader>
          <p className="text-lg font-semibold">WhatsApp</p>
          <p className="text-sm text-muted-foreground">
            Статус: {statusLabel(integrationStatus("WHATSAPP"))}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Номер телефона</label>
            <Input
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="+77001234567"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Приветствие</label>
            <Input
              value={whatsappGreeting}
              onChange={(event) => setWhatsappGreeting(event.target.value)}
              placeholder="Здравствуйте!"
            />
          </div>
          <Button
            onClick={() =>
              handleSave("WHATSAPP", {
                phone: whatsappNumber,
                greeting: whatsappGreeting,
              })
            }
            loading={saving === "WHATSAPP"}
          >
            <Save className="size-4" />
            Сохранить WhatsApp
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader>
          <p className="text-lg font-semibold">Kaspi</p>
          <p className="text-sm text-muted-foreground">
            Статус: {statusLabel(integrationStatus("KASPI"))}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Ссылка Kaspi</label>
            <Input
              value={kaspiUrl}
              onChange={(event) => setKaspiUrl(event.target.value)}
              placeholder="https://kaspi.kz/pay/..."
            />
          </div>
          <Button
            onClick={() =>
              handleSave("KASPI", {
                url: kaspiUrl,
              })
            }
            loading={saving === "KASPI"}
          >
            <Save className="size-4" />
            Сохранить Kaspi
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}
      {message ? (
        <Card className="border-emerald-200">
          <CardContent className="p-4 text-sm text-emerald-700">
            {message}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
