import { prisma } from "./client";
import { ensureSchema } from "./schema";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const formatSlug = (value: string) => slugify(value);

export const normalizeSlug = (raw?: string | null) => {
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "demo-restaurant";
};

export const buildRestaurantName = (slug?: string) =>
  normalizeSlug(slug)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildUniqueSlug = async (base: string) => {
  const normalized = slugify(base || "restaurant") || "restaurant";
  let candidate = normalized;
  let counter = 1;
  while (await prisma.restaurant.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${normalized}-${counter}`;
  }
  return candidate;
};

export async function getRestaurantBySlug(slug: string) {
  const normalized = normalizeSlug(slug);
  return prisma.restaurant.findUnique({ where: { slug: normalized } });
}

export async function ensureRestaurantForSlug(slug: string) {
  const normalized = normalizeSlug(slug);
  try {
    await ensureSchema();
    // Try to find existing restaurant first
    const existing = await prisma.restaurant.findUnique({
      where: { slug: normalized },
    });
    if (existing) {
      return existing;
    }
    // If not found, create it
    return prisma.restaurant.create({
      data: {
        slug: normalized,
        name: buildRestaurantName(normalized),
      },
    });
  } catch (error) {
    // If database connection fails, return a minimal restaurant object
    // This allows the page to render even if database is unavailable
    console.warn(
      `Database connection failed for restaurant slug "${normalized}". Using fallback restaurant object.`,
      error,
    );
    return {
      id: 0,
      slug: normalized,
      name: buildRestaurantName(normalized),
      phone: null,
      logoAssetId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getRestaurantForUser(clerkUserId: string) {
  const member = await prisma.restaurantMember.findFirst({
    where: { clerkUserId },
    include: { restaurant: true },
  });
  return member?.restaurant ?? null;
}

export async function ensureRestaurantForUser(options: {
  clerkUserId: string;
  name?: string | null;
  phone?: string | null;
  preferredSlug?: string | null;
}) {
  await ensureSchema();
  const existing = await prisma.restaurantMember.findFirst({
    where: { clerkUserId: options.clerkUserId },
    include: { restaurant: true },
  });
  if (existing?.restaurant) {
    return existing.restaurant;
  }

  let slug = options.preferredSlug
    ? normalizeSlug(options.preferredSlug)
    : "";
  if (!slug || (await prisma.restaurant.findUnique({ where: { slug } }))) {
    slug = await buildUniqueSlug(options.name || "restaurant");
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      slug,
      name: options.name?.trim() || buildRestaurantName(slug),
      phone: options.phone?.trim() || null,
    },
  });
  await prisma.restaurantMember.create({
    data: {
      restaurantId: restaurant.id,
      clerkUserId: options.clerkUserId,
      role: "OWNER",
    },
  });

  return restaurant;
}
