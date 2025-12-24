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
    include: { tables: true },
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
    include: { tables: true },
  });
}

export async function saveFloorPlan(
  restaurantId: number,
  payload: FloorPlanPayload,
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

  const plan = await prisma.floorPlan.findFirst({
    where: { restaurantId, isActive: true },
  });
  const activePlan = plan
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
    include: { tables: true },
  });
}
