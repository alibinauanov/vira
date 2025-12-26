import { Prisma } from "@prisma/client";

import { prisma } from "./client";
import { ensureSchema } from "./schema";

const serializeMenuItem = (item: {
  id: number;
  restaurantId: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: Prisma.Decimal;
  imageAssetId: number | null;
  sortOrder: number;
  isAvailable: boolean;
  imageAsset?: {
    id: number;
    objectKey: string;
    publicUrl: string | null;
  } | null;
}) => ({
  ...item,
  price: Number(item.price),
  imageAsset: item.imageAsset ?? null,
});

export async function listMenuCategories(restaurantId: number) {
  await ensureSchema();
  const categories = await prisma.menuCategory.findMany({
    where: { 
      restaurantId,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      items: {
        where: {
          isAvailable: true,
        },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        include: {
          imageAsset: {
            select: { id: true, objectKey: true, publicUrl: true },
          },
        },
      },
    },
  });

  // Filter out categories with no active items
  return categories
    .filter((category) => category.items.length > 0)
    .map((category) => ({
      ...category,
      items: category.items.map(serializeMenuItem),
    }));
}

export async function listAllMenuCategoriesForAdmin(restaurantId: number) {
  await ensureSchema();
  const categories = await prisma.menuCategory.findMany({
    where: { 
      restaurantId,
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        include: {
          imageAsset: {
            select: { id: true, objectKey: true, publicUrl: true },
          },
        },
      },
    },
  });

  return categories.map((category) => ({
    ...category,
    items: category.items.map(serializeMenuItem),
  }));
}

export async function createMenuCategory(
  restaurantId: number,
  payload: { name: string; sortOrder?: number; isActive?: boolean },
) {
  await ensureSchema();
  return prisma.menuCategory.create({
    data: {
      restaurantId,
      name: payload.name.trim(),
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
    },
  });
}

export async function updateMenuCategory(
  restaurantId: number,
  id: number,
  payload: { name?: string; sortOrder?: number; isActive?: boolean },
) {
  await ensureSchema();
  return prisma.menuCategory.update({
    where: { id },
    data: {
      name: payload.name?.trim(),
      sortOrder: payload.sortOrder,
      isActive: payload.isActive,
    },
  });
}

export async function deleteMenuCategory(restaurantId: number, id: number) {
  await ensureSchema();
  return prisma.$transaction(async (tx) => {
    await tx.menuItem.deleteMany({ where: { categoryId: id, restaurantId } });
    return tx.menuCategory.delete({ where: { id } });
  });
}

export async function createMenuItem(
  restaurantId: number,
  payload: {
    categoryId: number;
    name: string;
    description?: string | null;
    price: number;
    imageAssetId?: number | null;
    sortOrder?: number;
    isAvailable?: boolean;
  },
) {
  await ensureSchema();
  return prisma.menuItem.create({
    data: {
      restaurantId,
      categoryId: payload.categoryId,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      price: new Prisma.Decimal(payload.price),
      imageAssetId: payload.imageAssetId ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isAvailable: payload.isAvailable ?? true,
    },
  });
}

export async function updateMenuItem(
  restaurantId: number,
  id: number,
  payload: {
    categoryId?: number;
    name?: string;
    description?: string | null;
    price?: number;
    imageAssetId?: number | null;
    sortOrder?: number;
    isAvailable?: boolean;
  },
) {
  await ensureSchema();
  return prisma.menuItem.update({
    where: { id },
    data: {
      categoryId: payload.categoryId,
      name: payload.name?.trim(),
      description:
        payload.description === undefined
          ? undefined
          : payload.description?.trim() || null,
      price:
        payload.price === undefined
          ? undefined
          : new Prisma.Decimal(payload.price),
      imageAssetId:
        payload.imageAssetId === undefined ? undefined : payload.imageAssetId,
      sortOrder: payload.sortOrder,
      isAvailable: payload.isAvailable,
    },
  });
}

export async function deleteMenuItem(restaurantId: number, id: number) {
  await ensureSchema();
  return prisma.menuItem.delete({ where: { id } });
}
