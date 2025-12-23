import { IntegrationStatus, IntegrationType } from "@prisma/client";

import { prisma } from "./client";
import { ensureSchema } from "./schema";

export type IntegrationConfig = Record<string, unknown>;

export async function getIntegrations(restaurantId: number) {
  await ensureSchema();
  return prisma.integration.findMany({ where: { restaurantId } });
}

export async function getIntegration(
  restaurantId: number,
  type: IntegrationType,
) {
  await ensureSchema();
  return prisma.integration.findUnique({
    where: { restaurantId_type: { restaurantId, type } },
  });
}

const resolveStatus = (config?: IntegrationConfig | null) => {
  if (!config || Object.keys(config).length === 0) {
    return IntegrationStatus.DISCONNECTED;
  }
  return IntegrationStatus.CONFIGURED;
};

export async function upsertIntegration(
  restaurantId: number,
  type: IntegrationType,
  config: IntegrationConfig,
) {
  await ensureSchema();
  const status = resolveStatus(config);
  return prisma.integration.upsert({
    where: { restaurantId_type: { restaurantId, type } },
    create: {
      restaurantId,
      type,
      status,
      config,
    },
    update: {
      status,
      config,
    },
  });
}
