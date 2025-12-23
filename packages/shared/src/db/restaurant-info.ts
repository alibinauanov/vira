import { Prisma } from "@prisma/client";

import { prisma } from "./client";
import { ensureSchema } from "./schema";

export async function getRestaurantInfo(restaurantId: number) {
  await ensureSchema();
  return prisma.restaurantInfo.findUnique({
    where: { restaurantId },
  });
}

export async function upsertRestaurantInfo(
  restaurantId: number,
  payload: {
    address?: string | null;
    workSchedule?: Prisma.InputJsonValue | null;
    about?: string | null;
  },
) {
  await ensureSchema();
  const workSchedule = payload.workSchedule ?? Prisma.DbNull;
  return prisma.restaurantInfo.upsert({
    where: { restaurantId },
    create: {
      restaurantId,
      address: payload.address?.trim() || null,
      workSchedule,
      about: payload.about?.trim() || null,
    },
    update: {
      address: payload.address?.trim() || null,
      workSchedule,
      about: payload.about?.trim() || null,
    },
  });
}
