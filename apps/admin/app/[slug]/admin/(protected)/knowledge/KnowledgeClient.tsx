"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUp, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RestaurantInfo = {
  address?: string | null;
  workSchedule?: unknown;
  about?: string | null;
};

type MenuItem = {
  id: number;
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  imageAsset?: { id: number; objectKey: string; publicUrl: string | null } | null;
  sortOrder: number;
  isAvailable: boolean;
  imageUrl?: string | null;
};

type MenuCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
};

type Props = {
  slug: string;
  initialInfo: RestaurantInfo | null;
  initialCategories: MenuCategory[];
};

const formatSchedule = (value?: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
};

export function KnowledgeClient({
  slug,
  initialInfo,
  initialCategories,
}: Props) {
  const [address, setAddress] = useState(initialInfo?.address ?? "");
  const [workSchedule, setWorkSchedule] = useState(
    formatSchedule(initialInfo?.workSchedule),
  );
  const [about, setAbout] = useState(initialInfo?.about ?? "");
  const [categories, setCategories] = useState<MenuCategory[]>(
    initialCategories.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        imageUrl:
          item.imageAsset?.publicUrl ??
          (item.imageAsset?.objectKey
            ? `/api/media/${item.imageAsset.objectKey}`
            : null),
      })),
    })),
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemDrafts, setNewItemDrafts] = useState<
    Record<number, { name: string; price: string }>
  >({});
  const [savingInfo, setSavingInfo] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshMenu = async () => {
    setLoadingMenu(true);
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/menu`, { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось загрузить меню.");
      }
      setCategories(
        (body.categories ?? []).map((category: MenuCategory) => ({
          ...category,
          items: category.items.map((item) => ({
            ...item,
            imageUrl:
              item.imageAsset?.publicUrl ??
              (item.imageAsset?.objectKey
                ? `/api/media/${item.imageAsset.objectKey}`
                : null),
          })),
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить меню.",
      );
    } finally {
      setLoadingMenu(false);
    }
  };

  const saveInfo = async () => {
    setSavingInfo(true);
    setError(null);
    setMessage(null);
    let parsedSchedule: unknown = workSchedule.trim();
    if (parsedSchedule) {
      try {
        parsedSchedule = JSON.parse(parsedSchedule as string);
      } catch {
        // keep as text fallback
      }
    } else {
      parsedSchedule = null;
    }

    try {
      const res = await fetch(`/api/${slug}/restaurant-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          workSchedule: parsedSchedule,
          about,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось сохранить информацию.");
      }
      setMessage("Информация о ресторане сохранена.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить данные.",
      );
    } finally {
      setSavingInfo(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Введите название категории.");
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/menu/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось создать категорию.");
      }
      setNewCategoryName("");
      await refreshMenu();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать категорию.",
      );
    }
  };

  const updateCategory = async (category: MenuCategory) => {
    try {
      const res = await fetch(`/api/${slug}/menu/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось обновить категорию.");
      }
      setMessage("Категория обновлена.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось обновить категорию.",
      );
    }
  };

  const deleteCategory = async (categoryId: number) => {
    const confirmed = window.confirm(
      "Удалить категорию и все блюда внутри?",
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/${slug}/menu/categories/${categoryId}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось удалить категорию.");
      }
      await refreshMenu();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить категорию.",
      );
    }
  };

  const addItem = async (categoryId: number) => {
    const draft = newItemDrafts[categoryId];
    if (!draft?.name?.trim()) {
      setError("Введите название блюда.");
      return;
    }
    const price = Number(draft.price);
    if (Number.isNaN(price) || price <= 0) {
      setError("Введите корректную цену.");
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/menu/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          name: draft.name,
          price,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось создать блюдо.");
      }
      setNewItemDrafts((prev) => ({
        ...prev,
        [categoryId]: { name: "", price: "" },
      }));
      await refreshMenu();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать блюдо.",
      );
    }
  };

  const updateItem = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/${slug}/menu/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: item.categoryId,
          name: item.name,
          description: item.description ?? null,
          price: item.price,
          imageAssetId: item.imageAsset?.id ?? null,
          sortOrder: item.sortOrder,
          isAvailable: item.isAvailable,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось обновить блюдо.");
      }
      setMessage("Блюдо сохранено.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось обновить блюдо.",
      );
    }
  };

  const deleteItem = async (itemId: number) => {
    const confirmed = window.confirm("Удалить это блюдо?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/${slug}/menu/items/${itemId}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось удалить блюдо.");
      }
      await refreshMenu();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить блюдо.",
      );
    }
  };

  const uploadItemImage = async (itemId: number, file: File) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "MENU_ITEM_IMAGE");
      const res = await fetch(`/api/${slug}/media`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось загрузить файл.");
      }

      const updatedItem = categories
        .flatMap((category) => category.items)
        .find((item) => item.id === itemId);

      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          items: category.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  imageAsset: body.asset
                    ? {
                        id: body.asset.id,
                        objectKey: body.asset.objectKey,
                        publicUrl: body.asset.publicUrl,
                      }
                    : null,
                  imageUrl: body.asset?.publicUrl ?? null,
                }
              : item,
          ),
        })),
      );

      if (updatedItem) {
        await updateItem({
          ...updatedItem,
          imageAsset: body.asset
            ? {
                id: body.asset.id,
                objectKey: body.asset.objectKey,
                publicUrl: body.asset.publicUrl,
              }
            : null,
          imageUrl: body.asset?.publicUrl ?? null,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить файл.",
      );
    }
  };

  const onDraftChange = (
    categoryId: number,
    field: "name" | "price",
    value: string,
  ) => {
    setNewItemDrafts((prev) => ({
      ...prev,
      [categoryId]: {
        name: field === "name" ? value : prev[categoryId]?.name ?? "",
        price: field === "price" ? value : prev[categoryId]?.price ?? "",
      },
    }));
  };

  useEffect(() => {
    if (!categories.length) return;
    setNewItemDrafts((prev) => {
      const next = { ...prev };
      categories.forEach((category) => {
        if (!next[category.id]) {
          next[category.id] = { name: "", price: "" };
        }
      });
      return next;
    });
  }, [categories]);

  const activeCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Информация
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Информация о ресторане и меню
        </h1>
        <p className="text-muted-foreground">
          Обновляйте график, адрес и позиции меню.
        </p>
      </div>

      <Card className="bg-white/80">
        <CardHeader className="text-lg font-semibold">
          Информация о ресторане
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Адрес</label>
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Например: пр. Абая, 12, Алматы"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">График работы</label>
            <Textarea
              value={workSchedule}
              onChange={(event) => setWorkSchedule(event.target.value)}
              rows={4}
              placeholder="Вставьте JSON или укажите график текстом."
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">О ресторане</label>
            <Textarea
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              rows={4}
              placeholder="Короткое описание для гостей."
            />
          </div>
          <Button onClick={saveInfo} loading={savingInfo}>
            <Save className="size-4" />
            Сохранить информацию
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Категории меню</p>
            <p className="text-sm text-muted-foreground">
              Настройте порядок категорий и блюд для клиентов.
            </p>
          </div>
          <Button variant="secondary" onClick={refreshMenu} loading={loadingMenu}>
            Обновить
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Название новой категории"
              className="max-w-xs"
            />
            <Button onClick={addCategory}>
              <Plus className="size-4" />
              Добавить категорию
            </Button>
          </div>

          {activeCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Категорий пока нет.
            </div>
          ) : null}

          {activeCategories.map((category) => (
            <Card key={category.id} className="bg-muted/20">
              <CardHeader className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
                  <Input
                    value={category.name}
                    onChange={(event) =>
                      setCategories((prev) =>
                        prev.map((item) =>
                          item.id === category.id
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    value={category.sortOrder}
                    onChange={(event) =>
                      setCategories((prev) =>
                        prev.map((item) =>
                          item.id === category.id
                            ? {
                                ...item,
                                sortOrder: Number(event.target.value),
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  <Select
                    value={category.isActive ? "active" : "inactive"}
                    onChange={(event) =>
                      setCategories((prev) =>
                        prev.map((item) =>
                          item.id === category.id
                            ? {
                                ...item,
                                isActive: event.target.value === "active",
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    <option value="active">Активна</option>
                    <option value="inactive">Скрыта</option>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateCategory(category)}
                  >
                    Сохранить категорию
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="size-4" />
                    Удалить
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-[1.4fr_0.6fr_auto]">
                  <Input
                    value={newItemDrafts[category.id]?.name ?? ""}
                    onChange={(event) =>
                      onDraftChange(category.id, "name", event.target.value)
                    }
                    placeholder="Название блюда"
                  />
                  <Input
                    value={newItemDrafts[category.id]?.price ?? ""}
                    onChange={(event) =>
                      onDraftChange(category.id, "price", event.target.value)
                    }
                    placeholder="Цена"
                  />
                  <Button onClick={() => addItem(category.id)}>
                    <Plus className="size-4" />
                    Добавить блюдо
                  </Button>
                </div>

                {category.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                    Блюд пока нет.
                  </div>
                ) : null}

                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-white/70 p-4"
                  >
                    <div className="grid gap-3 lg:grid-cols-[2fr_0.8fr_0.8fr]">
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold">Название</label>
                        <Input
                          value={item.name}
                          onChange={(event) =>
                            setCategories((prev) =>
                              prev.map((cat) =>
                                cat.id === category.id
                                  ? {
                                      ...cat,
                                      items: cat.items.map((it) =>
                                        it.id === item.id
                                          ? { ...it, name: event.target.value }
                                          : it,
                                      ),
                                    }
                                  : cat,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold">Цена</label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(event) =>
                            setCategories((prev) =>
                              prev.map((cat) =>
                                cat.id === category.id
                                  ? {
                                      ...cat,
                                      items: cat.items.map((it) =>
                                        it.id === item.id
                                          ? {
                                              ...it,
                                              price: Number(event.target.value),
                                            }
                                          : it,
                                      ),
                                    }
                                  : cat,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold">Порядок</label>
                        <Input
                          type="number"
                          value={item.sortOrder}
                          onChange={(event) =>
                            setCategories((prev) =>
                              prev.map((cat) =>
                                cat.id === category.id
                                  ? {
                                      ...cat,
                                      items: cat.items.map((it) =>
                                        it.id === item.id
                                          ? {
                                              ...it,
                                              sortOrder: Number(event.target.value),
                                            }
                                          : it,
                                      ),
                                    }
                                  : cat,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <label className="text-xs font-semibold">Описание</label>
                      <Textarea
                        rows={2}
                        value={item.description ?? ""}
                        onChange={(event) =>
                          setCategories((prev) =>
                            prev.map((cat) =>
                              cat.id === category.id
                                ? {
                                    ...cat,
                                    items: cat.items.map((it) =>
                                      it.id === item.id
                                        ? {
                                            ...it,
                                            description: event.target.value,
                                          }
                                        : it,
                                    ),
                                  }
                                : cat,
                            ),
                          )
                        }
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="text-xs font-semibold">Доступность</label>
                      <Select
                        value={item.isAvailable ? "yes" : "no"}
                        onChange={(event) =>
                          setCategories((prev) =>
                            prev.map((cat) =>
                              cat.id === category.id
                                ? {
                                    ...cat,
                                    items: cat.items.map((it) =>
                                      it.id === item.id
                                        ? {
                                            ...it,
                                            isAvailable: event.target.value === "yes",
                                          }
                                        : it,
                                    ),
                                  }
                                : cat,
                            ),
                          )
                        }
                      >
                        <option value="yes">Доступно</option>
                        <option value="no">Скрыто</option>
                      </Select>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex size-16 items-center justify-center rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          "Нет фото"
                        )}
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-primary">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void uploadItemImage(item.id, file);
                            }
                          }}
                        />
                        <ImageUp className="size-4" />
                        Загрузить фото
                      </label>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateItem(item)}
                      >
                        Сохранить блюдо
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
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
