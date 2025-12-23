import { prisma } from "./client";
import { ensureSchema } from "./schema";

export type ClientPageButtonType =
  | "BOOKING"
  | "ORDER"
  | "WHATSAPP"
  | "KASPI"
  | "EXTERNAL_URL";

export type ClientPageButton = {
  id: string;
  text: string;
  color: string;
  type: ClientPageButtonType;
  url?: string | null;
  order: number;
  enabled: boolean;
};

export type ClientPageTheme = {
  backgroundColor?: string | null;
  backgroundAssetId?: number | null;
  logoOverrideAssetId?: number | null;
};

export type ClientPageConfigPayload = {
  theme?: ClientPageTheme | null;
  buttons?: ClientPageButton[] | null;
};

export const defaultClientButtons = (): ClientPageButton[] => [
  {
    id: "booking",
    text: "Забронировать стол",
    color: "#0f172a",
    type: "BOOKING",
    order: 1,
    enabled: true,
  },
  {
    id: "order",
    text: "Сделать предзаказ",
    color: "#0ea5e9",
    type: "ORDER",
    order: 2,
    enabled: true,
  },
  {
    id: "whatsapp",
    text: "Написать в WhatsApp",
    color: "#16a34a",
    type: "WHATSAPP",
    order: 3,
    enabled: true,
  },
];

export const defaultClientTheme = (): ClientPageTheme => ({
  backgroundColor: "#f8fafc",
  backgroundAssetId: null,
  logoOverrideAssetId: null,
});

export async function getClientPageConfig(restaurantId: number) {
  await ensureSchema();
  const config = await prisma.clientPageConfig.findUnique({
    where: { restaurantId },
  });
  if (!config) {
    return {
      restaurantId,
      version: 1,
      theme: defaultClientTheme(),
      buttons: defaultClientButtons(),
      updatedAt: new Date(),
    };
  }
  return config;
}

export async function upsertClientPageConfig(
  restaurantId: number,
  payload: ClientPageConfigPayload,
) {
  await ensureSchema();
  return prisma.clientPageConfig.upsert({
    where: { restaurantId },
    create: {
      restaurantId,
      theme: payload.theme ?? defaultClientTheme(),
      buttons: payload.buttons ?? defaultClientButtons(),
    },
    update: {
      theme: payload.theme ?? undefined,
      buttons: payload.buttons ?? undefined,
    },
  });
}
