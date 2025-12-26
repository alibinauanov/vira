import { prisma } from "./client";
import { ensureSchema } from "./schema";

export type FloorPlanPayload = {
  name?: string;
  canvasWidth?: number | null;
  canvasHeight?: number | null;
  tables: Array<{
    id?: number;
    number: string;
    label?: string | null;
    seats: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number | null;
  }>;
};

export async function getActiveFloorPlan(restaurantId: number) {
  await ensureSchema();
  return prisma.floorPlan.findFirst({
    where: { restaurantId, isActive: true },
    include: { 
      tables: {
        orderBy: [{ number: "asc" }],
      },
    },
  });
}

export async function ensureActiveFloorPlan(restaurantId: number) {
  await ensureSchema();
  const existing = await getActiveFloorPlan(restaurantId);
  if (existing) return existing;
  return prisma.floorPlan.create({
    data: {
      restaurantId,
      name: "Основной",
      isActive: true,
      canvasWidth: 800,
      canvasHeight: 480,
    },
    include: { 
      tables: {
        orderBy: [{ number: "asc" }],
      },
    },
  });
}

export async function listFloorPlans(restaurantId: number) {
  await ensureSchema();
  return prisma.floorPlan.findMany({
    where: { restaurantId },
    include: {
      tables: {
        orderBy: [{ number: "asc" }],
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });
}

export async function getFloorPlanById(restaurantId: number, floorPlanId: number) {
  await ensureSchema();
  return prisma.floorPlan.findFirst({
    where: { id: floorPlanId, restaurantId },
    include: {
      tables: {
        orderBy: [{ number: "asc" }],
      },
    },
  });
}

export async function createFloorPlan(
  restaurantId: number,
  payload: { name: string; canvasWidth?: number; canvasHeight?: number },
) {
  await ensureSchema();
  return prisma.floorPlan.create({
    data: {
      restaurantId,
      name: payload.name.trim(),
      isActive: false,
      canvasWidth: payload.canvasWidth ?? 800,
      canvasHeight: payload.canvasHeight ?? 480,
    },
    include: {
      tables: {
        orderBy: [{ number: "asc" }],
      },
    },
  });
}

export async function updateFloorPlan(
  restaurantId: number,
  floorPlanId: number,
  payload: { name?: string; canvasWidth?: number; canvasHeight?: number },
) {
  await ensureSchema();
  const existing = await prisma.floorPlan.findFirst({
    where: { id: floorPlanId, restaurantId },
  });
  if (!existing) {
    throw new Error("План этажа не найден.");
  }
  return prisma.floorPlan.update({
    where: { id: floorPlanId },
    data: {
      name: payload.name?.trim(),
      canvasWidth: payload.canvasWidth,
      canvasHeight: payload.canvasHeight,
    },
    include: {
      tables: {
        orderBy: [{ number: "asc" }],
      },
    },
  });
}

export async function deleteFloorPlan(restaurantId: number, floorPlanId: number) {
  await ensureSchema();
  const existing = await prisma.floorPlan.findFirst({
    where: { id: floorPlanId, restaurantId },
  });
  if (!existing) {
    throw new Error("План этажа не найден.");
  }
  return prisma.$transaction(async (tx) => {
    await tx.table.deleteMany({ where: { floorPlanId, restaurantId } });
    return tx.floorPlan.delete({ where: { id: floorPlanId } });
  });
}

export async function setActiveFloorPlan(restaurantId: number, floorPlanId: number) {
  await ensureSchema();
  const existing = await prisma.floorPlan.findFirst({
    where: { id: floorPlanId, restaurantId },
  });
  if (!existing) {
    throw new Error("План этажа не найден.");
  }
  return prisma.$transaction(async (tx) => {
    await tx.floorPlan.updateMany({
      where: { restaurantId },
      data: { isActive: false },
    });
    return tx.floorPlan.update({
      where: { id: floorPlanId },
      data: { isActive: true },
      include: {
        tables: {
          orderBy: [{ number: "asc" }],
        },
      },
    });
  });
}

export async function saveFloorPlan(
  restaurantId: number,
  payload: FloorPlanPayload & { floorPlanId?: number },
) {
  await ensureSchema();

  type TableInput = FloorPlanPayload["tables"][number];
  const normalizedTables = payload.tables.map((table: TableInput) => ({
    ...table,
    number: table.number.trim(),
  }));
  type NormalizedTable = (typeof normalizedTables)[number];
  const numbers = normalizedTables.map((table: NormalizedTable) => table.number);
  const unique = new Set(numbers);
  if (unique.size !== numbers.length) {
    throw new Error("Нельзя использовать одинаковые номера столов.");
  }

  let activePlan;
  if (payload.floorPlanId) {
    const existing = await prisma.floorPlan.findFirst({
      where: { id: payload.floorPlanId, restaurantId },
    });
    if (!existing) {
      throw new Error("План этажа не найден.");
    }
    activePlan = await prisma.floorPlan.update({
      where: { id: payload.floorPlanId },
      data: {
        name: payload.name?.trim() || existing.name,
        canvasWidth: payload.canvasWidth ?? existing.canvasWidth,
        canvasHeight: payload.canvasHeight ?? existing.canvasHeight,
      },
    });
  } else {
    const plan = await prisma.floorPlan.findFirst({
      where: { restaurantId, isActive: true },
    });
    activePlan = plan
      ? await prisma.floorPlan.update({
          where: { id: plan.id },
          data: {
            name: payload.name?.trim() || plan.name,
            canvasWidth: payload.canvasWidth ?? plan.canvasWidth,
            canvasHeight: payload.canvasHeight ?? plan.canvasHeight,
          },
        })
      : await prisma.floorPlan.create({
          data: {
            restaurantId,
            name: payload.name?.trim() || "Основной",
            isActive: true,
            canvasWidth: payload.canvasWidth ?? 800,
            canvasHeight: payload.canvasHeight ?? 480,
          },
        });
  }

  const existingTables = await prisma.table.findMany({
    where: { floorPlanId: activePlan.id, restaurantId },
  });
  type ExistingTable = (typeof existingTables)[number];
  const incomingIds = normalizedTables
    .map((table: NormalizedTable) => table.id)
    .filter((id): id is number => typeof id === "number");
  const toDelete = existingTables
    .filter((table: ExistingTable) => !incomingIds.includes(table.id))
    .map((table: ExistingTable) => table.id);
  if (toDelete.length > 0) {
    await prisma.table.deleteMany({ where: { id: { in: toDelete } } });
  }

  for (const table of normalizedTables) {
    if (table.id) {
      await prisma.table.update({
        where: { id: table.id },
        data: {
          number: table.number,
          label: table.label?.trim() || null,
          seats: table.seats,
          x: table.x,
          y: table.y,
          width: table.width,
          height: table.height,
          rotation: table.rotation ?? null,
        },
      });
    } else {
      await prisma.table.create({
        data: {
          restaurantId,
          floorPlanId: activePlan.id,
          number: table.number,
          label: table.label?.trim() || null,
          seats: table.seats,
          x: table.x,
          y: table.y,
          width: table.width,
          height: table.height,
          rotation: table.rotation ?? null,
        },
      });
    }
  }

  return prisma.floorPlan.findUnique({
    where: { id: activePlan.id },
    include: { 
      tables: {
        orderBy: [{ number: "asc" }],
      },
    },
  });
}
