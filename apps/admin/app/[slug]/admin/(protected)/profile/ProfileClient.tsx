"use client";

import { useState } from "react";
import { Check, ImageUp, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  slug: string;
  initialRestaurant: {
    id: number;
    slug: string;
    name: string;
    phone?: string | null;
    logoUrl?: string | null;
    logoAssetId?: number | null;
  };
  accountEmail?: string | null;
};

export function ProfileClient({
  slug,
  initialRestaurant,
  accountEmail,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialRestaurant.name);
  const [phone, setPhone] = useState(initialRestaurant.phone ?? "");
  const [restaurantSlug, setRestaurantSlug] = useState(slug);
  const [slugInput, setSlugInput] = useState(initialRestaurant.slug);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialRestaurant.logoUrl ?? null,
  );
  const [logoAssetId, setLogoAssetId] = useState<number | null>(
    initialRestaurant.logoAssetId ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadLogo = async (file: File) => {
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "LOGO");
      const res = await fetch(`/api/${restaurantSlug}/media`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось загрузить логотип.");
      }
      setLogoUrl(body.asset?.publicUrl ?? null);
      setLogoAssetId(body.asset?.id ?? null);
      setMessage("Логотип загружен.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить файл.",
      );
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const nextSlug = slugInput.trim();
    if (!nextSlug) {
      setError("Slug обязателен.");
      setSaving(false);
      return;
    }
    const previousSlug = restaurantSlug;
    try {
      const trimmedPhone = phone.trim();
      const res = await fetch(`/api/${restaurantSlug}/restaurant`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: nextSlug,
          logoAssetId,
          phone: trimmedPhone.length > 0 ? trimmedPhone : null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось обновить профиль.");
      }
      const updatedSlug =
        (body.restaurant?.slug as string | undefined) ?? nextSlug;
      setRestaurantSlug(updatedSlug);
      setSlugInput(updatedSlug);
      if (updatedSlug !== previousSlug) {
        router.replace(`/${updatedSlug}/admin/profile`);
      }
      setMessage("Профиль сохранен.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить профиль.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Профиль
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Профиль ресторана
        </h1>
        <p className="text-muted-foreground">
          Обновите название и фирменные материалы.
        </p>
      </div>

      <Card className="bg-white/80">
        <CardHeader className="text-lg font-semibold">
          Данные ресторана
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Название ресторана</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Например, Vira Центр"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Slug (таплинк)</label>
            <Input
              value={slugInput}
              onChange={(event) => setSlugInput(event.target.value)}
              placeholder="vira-center"
            />
            <p className="text-xs text-muted-foreground">
              Ссылка будет доступна по адресу /{slugInput || "slug"}.
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Электронная почта</label>
            <Input
              value={accountEmail ?? "Не указан"}
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Данные для входа управляются в Clerk.
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Контактный телефон</label>
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 (___) ___-__-__"
            />
            <p className="text-xs text-muted-foreground">
              Телефон, который увидят гости на клиентской странице.
            </p>
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium">Логотип</label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-muted/40 text-xs text-muted-foreground">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Логотип ресторана"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  "Нет логотипа"
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadLogo(file);
                      }
                    }}
                  />
                  <ImageUp className="size-4" />
                  {uploading ? "Загрузка..." : "Загрузить логотип"}
                </label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG или WebP. До 5 МБ.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={saveProfile} loading={saving}>
            <Save className="size-4" />
            Сохранить профиль
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader className="text-lg font-semibold">
          Безопасность аккаунта
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Пароли и настройки безопасности управляются в Clerk.
          </p>
          <Button href="/user-profile" variant="secondary">
            <Check className="size-4" />
            Открыть настройки безопасности
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
