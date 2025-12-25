"use client";

import { useMemo, useState } from "react";
import { ImageUp, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ClientPageButton, ClientPageButtonType } from "@vira/shared/db/client-page";

type ClientButton = ClientPageButton;

type ThemeConfig = {
  backgroundColor?: string | null;
  backgroundAssetId?: number | null;
  logoOverrideAssetId?: number | null;
};

type Props = {
  slug: string;
  initialButtons: ClientButton[];
  initialTheme: ThemeConfig;
  initialBackgroundUrl?: string | null;
  initialLogoUrl?: string | null;
};

export function CustomizerClient({
  slug,
  initialButtons,
  initialTheme,
  initialBackgroundUrl,
  initialLogoUrl,
}: Props) {
  const [buttons, setButtons] = useState<ClientButton[]>(initialButtons);
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(
    initialBackgroundUrl ?? null,
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialLogoUrl ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedButtons = useMemo(() => {
    const sorted = [...buttons].sort((a, b) => {
      // Ensure BOOKING and MENU are always first
      const aPriority = a.type === "BOOKING" ? 0 : a.type === "MENU" ? 1 : 2;
      const bPriority = b.type === "BOOKING" ? 0 : b.type === "MENU" ? 1 : 2;
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      return a.order - b.order;
    });
    return sorted;
  }, [buttons]);

  const addButton = () => {
    setButtons((prev) => {
      // Find the highest order number
      const maxOrder = Math.max(...prev.map((b) => b.order), 0);
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: "Новая кнопка",
          color: "#0f172a",
          type: "EXTERNAL_URL" as ClientPageButtonType,
          url: "",
          order: maxOrder + 1,
          enabled: true,
        },
      ];
    });
  };

  const updateButton = (id: string, patch: Partial<ClientButton>) => {
    setButtons((prev) =>
      prev.map((button) => (button.id === id ? { ...button, ...patch } : button)),
    );
  };

  const removeButton = (id: string) => {
    setButtons((prev) => prev.filter((button) => button.id !== id));
  };

  const uploadAsset = async (file: File, kind: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    const res = await fetch(`/api/${slug}/media`, {
      method: "POST",
      body: formData,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error ?? "Не удалось загрузить файл.");
    }
    return body.asset as { id: number; publicUrl: string };
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/client-page`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          buttons,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось сохранить настройки.");
      }
      setMessage("Настройки клиентской страницы сохранены.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить настройки.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Клиентская страница
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Настройка таплинка
        </h1>
        <p className="text-muted-foreground">
          Настройте кнопки, цвета и обложку для гостей.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="bg-white/80">
            <CardHeader className="text-lg font-semibold">
              Тема и брендинг
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Цвет фона</label>
                <Input
                  type="color"
                  value={theme.backgroundColor ?? "#f8fafc"}
                  onChange={(event) =>
                    setTheme((prev) => ({
                      ...prev,
                      backgroundColor: event.target.value,
                    }))
                  }
                  className="h-12 w-24"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Фоновое изображение (опционально)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex size-20 items-center justify-center rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
                    {backgroundUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={backgroundUrl}
                        alt="Фон"
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      "Нет изображения"
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          const asset = await uploadAsset(
                            file,
                            "BACKGROUND_IMAGE",
                          );
                          setTheme((prev) => ({
                            ...prev,
                            backgroundAssetId: asset.id,
                          }));
                          setBackgroundUrl(asset.publicUrl);
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Не удалось загрузить файл.",
                          );
                        }
                      }}
                    />
                    <ImageUp className="size-4" />
                    Загрузить
                  </label>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Логотип для клиента (опционально)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex size-20 items-center justify-center rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Логотип"
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      "Нет логотипа"
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          const asset = await uploadAsset(file, "LOGO");
                          setTheme((prev) => ({
                            ...prev,
                            logoOverrideAssetId: asset.id,
                          }));
                          setLogoUrl(asset.publicUrl);
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Не удалось загрузить файл.",
                          );
                        }
                      }}
                    />
                    <ImageUp className="size-4" />
                    Загрузить
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <p className="text-lg font-semibold">Кнопки</p>
              <Button variant="secondary" onClick={addButton}>
                <Plus className="size-4" />
                Добавить кнопку
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedButtons.map((button) => (
                <div
                  key={button.id}
                  className="rounded-xl border border-border bg-muted/30 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.6fr]">
                    <Input
                      value={button.text}
                      onChange={(event) =>
                        updateButton(button.id, { text: event.target.value })
                      }
                      placeholder="Текст кнопки"
                    />
                    <Select
                      value={button.type}
                      onChange={(event) =>
                        updateButton(button.id, {
                          type: event.target.value as ClientPageButtonType,
                        })
                      }
                    >
                      <option value="BOOKING">Бронь</option>
                      <option value="MENU">Меню</option>
                      <option value="ORDER">Заказ</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="KASPI">Kaspi</option>
                      <option value="EXTERNAL_URL">Внешняя ссылка</option>
                    </Select>
                    <Input
                      type="color"
                      value={button.color}
                      onChange={(event) =>
                        updateButton(button.id, { color: event.target.value })
                      }
                    />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_0.6fr_0.6fr]">
                    {button.type === "EXTERNAL_URL" ? (
                      <Input
                        value={button.url ?? ""}
                        onChange={(event) =>
                          updateButton(button.id, { url: event.target.value })
                        }
                        placeholder="Внешняя ссылка (обязательно)"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground flex items-center">
                        {button.type === "BOOKING" && "Ведет на страницу бронирования"}
                        {button.type === "MENU" && "Ведет на страницу меню"}
                        {button.type === "ORDER" && "Ведет на страницу заказа"}
                        {button.type === "WHATSAPP" && "Ведет в WhatsApp"}
                        {button.type === "KASPI" && "Ведет в Kaspi"}
                      </div>
                    )}
                    <Input
                      type="number"
                      value={button.order}
                      onChange={(event) =>
                        updateButton(button.id, {
                          order: Number(event.target.value),
                        })
                      }
                      placeholder="Порядок"
                    />
                    <Select
                      value={button.enabled ? "on" : "off"}
                      onChange={(event) =>
                        updateButton(button.id, {
                          enabled: event.target.value === "on",
                        })
                      }
                    >
                      <option value="on">Показывать</option>
                      <option value="off">Скрыть</option>
                    </Select>
                  </div>
                  {button.type !== "BOOKING" && button.type !== "MENU" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeButton(button.id)}
                      className="mt-3"
                    >
                      <Trash2 className="size-4" />
                      Удалить
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={saveConfig} loading={saving}>
            <Save className="size-4" />
            Сохранить страницу
          </Button>
        </div>

        <Card className="bg-white/90">
          <CardHeader className="text-lg font-semibold">
            Предпросмотр
          </CardHeader>
          <CardContent>
            <div
              className="rounded-2xl border border-border p-6"
              style={{
                backgroundColor: theme.backgroundColor ?? "#f8fafc",
                backgroundImage: backgroundUrl
                  ? `url(${backgroundUrl})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="flex items-center gap-3 pb-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/70 text-xs text-muted-foreground">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="Логотип"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    "Лого"
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">Ресторан Vira</p>
                  <p className="text-xs text-muted-foreground">
                    Превью таплинка
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {sortedButtons
                  .filter((button) => button.enabled)
                  .map((button) => (
                    <button
                      key={button.id}
                      type="button"
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-semibold text-white",
                      )}
                      style={{ backgroundColor: button.color }}
                    >
                      {button.text}
                    </button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
