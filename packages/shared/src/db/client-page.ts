import { prisma } from "./client";
import { ensureSchema } from "./schema";

export type ClientPageButtonType =
  | "BOOKING"
  | "MENU"
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
    id: "menu",
    text: "Меню",
    color: "#0ea5e9",
    type: "MENU",
    order: 2,
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
  // Parse JSON fields - Prisma returns them as JsonValue
  // Handle both string (if stored as text) and object (if stored as JSONB) formats
  let theme: ClientPageTheme;
  if (config.theme === null || config.theme === undefined) {
    theme = defaultClientTheme();
  } else if (typeof config.theme === "string") {
    try {
      theme = JSON.parse(config.theme) as ClientPageTheme;
    } catch {
      theme = defaultClientTheme();
    }
  } else {
    theme = config.theme as ClientPageTheme;
  }

  let buttons: ClientPageButton[];
  if (config.buttons === null || config.buttons === undefined) {
    buttons = defaultClientButtons();
  } else if (typeof config.buttons === "string") {
    try {
      const parsed = JSON.parse(config.buttons) as ClientPageButton[];
      buttons = Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultClientButtons();
    } catch {
      buttons = defaultClientButtons();
    }
  } else if (Array.isArray(config.buttons)) {
    buttons = config.buttons.length > 0 ? (config.buttons as ClientPageButton[]) : defaultClientButtons();
  } else {
    buttons = defaultClientButtons();
  }
  
  return {
    restaurantId: config.restaurantId,
    version: config.version,
    theme,
    buttons,
    updatedAt: config.updatedAt,
  };
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
