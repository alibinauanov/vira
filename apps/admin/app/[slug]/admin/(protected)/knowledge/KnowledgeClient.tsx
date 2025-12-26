"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUp, Plus, Save, Trash2, Edit2, X, Check, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());

  const refreshMenu = async () => {
    setLoadingMenu(true);
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/menu`, { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось загрузить меню.");
      }
      const updatedCategories = (body.categories ?? []).map((category: MenuCategory) => ({
        ...category,
        items: category.items.map((item: MenuItem) => ({
          ...item,
          imageUrl:
            item.imageAsset?.publicUrl ??
            (item.imageAsset?.objectKey
              ? `/api/media/${item.imageAsset.objectKey}`
              : null),
        })),
      }));
      setCategories(updatedCategories);
      // Keep expanded state for existing categories
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        updatedCategories.forEach((cat: MenuCategory) => {
          if (prev.has(cat.id)) {
            next.add(cat.id);
          }
        });
        return next;
      });
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
      setTimeout(() => setMessage(null), 3000);
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
      setMessage("Категория создана.");
      setTimeout(() => setMessage(null), 3000);
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
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось обновить категорию.",
      );
    }
  };

  const deleteCategory = async (categoryId: number) => {
    const confirmed = window.confirm(
      "Удалить категорию и все блюда внутри? Это действие нельзя отменить.",
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
      setMessage("Категория удалена.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить категорию.",
      );
    }
  };

  const addItem = async (categoryId: number, itemData: { name: string; price: string; description?: string }) => {
    if (!itemData.name?.trim()) {
      setError("Введите название блюда.");
      return;
    }
    const price = Number(itemData.price);
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
          name: itemData.name,
          price,
          description: itemData.description?.trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось создать блюдо.");
      }
      await refreshMenu();
      setMessage("Блюдо создано.");
      setTimeout(() => setMessage(null), 3000);
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
      setEditingItem(null);
      setMessage("Блюдо сохранено.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось обновить блюдо.",
      );
    }
  };

  const deleteItem = async (itemId: number) => {
    const confirmed = window.confirm("Удалить это блюдо? Это действие нельзя отменить.");
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
      setMessage("Блюдо удалено.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить блюдо.",
      );
    }
  };

  const uploadItemImage = async (itemId: number, file: File) => {
    setUploadingImages((prev) => new Set(prev).add(itemId));
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

      if (updatedItem) {
        const itemWithNewImage = {
          ...updatedItem,
          imageAsset: body.asset
            ? {
                id: body.asset.id,
                objectKey: body.asset.objectKey,
                publicUrl: body.asset.publicUrl,
              }
            : null,
          imageUrl: body.asset?.publicUrl ?? null,
        };
        
        setCategories((prev) =>
          prev.map((category) => ({
            ...category,
            items: category.items.map((item) =>
              item.id === itemId ? itemWithNewImage : item,
            ),
          })),
        );

        await updateItem(itemWithNewImage);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить файл.",
      );
    } finally {
      setUploadingImages((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          База знаний
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Информация о ресторане и меню
        </h1>
        <p className="text-muted-foreground mt-2">
          Управляйте информацией о ресторане и меню для использования в ответах гостям.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}
      {message && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 text-sm text-emerald-700">
            {message}
          </CardContent>
        </Card>
      )}

      {/* Restaurant Information */}
      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>Информация о ресторане</CardTitle>
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
              placeholder='Вставьте JSON или укажите график текстом. Например: {"пн-пт": "09:00-22:00", "сб-вс": "10:00-23:00"}'
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
          <Button onClick={saveInfo} loading={savingInfo} className="w-full sm:w-auto">
            <Save className="size-4 mr-2" />
            Сохранить информацию
          </Button>
        </CardContent>
      </Card>

      {/* Menu Management */}
      <Card className="bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Меню</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Управляйте категориями и блюдами
            </p>
          </div>
          <Button variant="outline" onClick={refreshMenu} loading={loadingMenu} size="sm">
            Обновить
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Category */}
          <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
            <Input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Название новой категории"
              className="flex-1 min-w-[200px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addCategory();
                }
              }}
            />
            <Button onClick={addCategory}>
              <Plus className="size-4 mr-2" />
              Добавить категорию
            </Button>
          </div>

          {/* Categories List */}
          {sortedCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <p className="text-sm">Категорий пока нет. Создайте первую категорию.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                const sortedItems = [...category.items].sort((a, b) => a.sortOrder - b.sortOrder);
                
                return (
                  <Card key={category.id} className={cn(
                    "overflow-hidden transition-all",
                    !category.isActive && "opacity-60"
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategory(category.id)}
                            className="shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </Button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
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
                                className="font-semibold"
                                placeholder="Название категории"
                              />
                              {!category.isActive && (
                                <Badge tone="neutral">Скрыта</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
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
                            className="w-20"
                            placeholder="Порядок"
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
                            className="w-32"
                          >
                            <option value="active">Активна</option>
                            <option value="inactive">Скрыта</option>
                          </Select>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateCategory(category)}
                          >
                            <Save className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="space-y-4 pt-0">
                        {/* Add Item Form */}
                        <ItemForm
                          categoryId={category.id}
                          onAdd={(itemData) => {
                            void addItem(category.id, itemData);
                          }}
                        />

                        {/* Items List */}
                        {sortedItems.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                            Блюд пока нет. Добавьте первое блюдо.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sortedItems.map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                categoryId={category.id}
                                isEditing={editingItem === item.id}
                                onEdit={() => setEditingItem(item.id)}
                                onCancel={() => setEditingItem(null)}
                                onSave={() => {
                                  void updateItem(item);
                                }}
                                onDelete={() => {
                                  void deleteItem(item.id);
                                }}
                                onImageUpload={(file) => {
                                  void uploadItemImage(item.id, file);
                                }}
                                isUploading={uploadingImages.has(item.id)}
                                onChange={(updates) => {
                                  setCategories((prev) =>
                                    prev.map((cat) =>
                                      cat.id === category.id
                                        ? {
                                            ...cat,
                                            items: cat.items.map((it) =>
                                              it.id === item.id ? { ...it, ...updates } : it,
                                            ),
                                          }
                                        : cat,
                                    ),
                                  );
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ItemForm({
  categoryId,
  onAdd,
}: {
  categoryId: number;
  onAdd: (data: { name: string; price: string; description?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !price.trim()) return;
    onAdd({ name, price, description });
    setName("");
    setPrice("");
    setDescription("");
  };

  return (
    <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Plus className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Добавить блюдо</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название блюда"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Цена"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Добавить
        </Button>
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (необязательно)"
        rows={2}
      />
    </div>
  );
}

function ItemCard({
  item,
  categoryId,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onImageUpload,
  isUploading,
  onChange,
}: {
  item: MenuItem;
  categoryId: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
  onChange: (updates: Partial<MenuItem>) => void;
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-white/70 p-4 space-y-3 transition-all",
      !item.isAvailable && "opacity-60"
    )}>
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="shrink-0">
          <div className="relative size-20 rounded-lg border border-border bg-muted/40 overflow-hidden">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Нет фото
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-xs">Загрузка...</div>
              </div>
            )}
          </div>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onImageUpload(file);
                }
              }}
              disabled={isUploading}
            />
            <ImageUp className="size-3" />
            {item.imageUrl ? "Изменить" : "Добавить"}
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {isEditing ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Название</label>
                  <Input
                    value={item.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Цена</label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => onChange({ price: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Описание</label>
                <Textarea
                  value={item.description ?? ""}
                  onChange={(e) => onChange({ description: e.target.value })}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto]">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Порядок</label>
                  <Input
                    type="number"
                    value={item.sortOrder}
                    onChange={(e) => onChange({ sortOrder: Number(e.target.value) })}
                    className="mt-1 w-20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Статус</label>
                  <Select
                    value={item.isAvailable ? "yes" : "no"}
                    onChange={(e) => onChange({ isAvailable: e.target.value === "yes" })}
                    className="mt-1"
                  >
                    <option value="yes">Доступно</option>
                    <option value="no">Скрыто</option>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button size="sm" variant="ghost" onClick={onCancel}>
                    <X className="size-4" />
                  </Button>
                  <Button size="sm" onClick={onSave}>
                    <Check className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold text-lg">{item.price} ₸</span>
                    {!item.isAvailable && (
                      <Badge tone="neutral" className="text-xs">Скрыто</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={onEdit}>
                    <Edit2 className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onDelete}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
