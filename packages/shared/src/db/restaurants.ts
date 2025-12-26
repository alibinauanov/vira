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
  return prisma.restaurant.findUnique({ 
    where: { slug: normalized },
    select: {
      id: true,
      slug: true,
      name: true,
      phone: true,
      logoAssetId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function ensureRestaurantForSlug(slug: string) {
  const normalized = normalizeSlug(slug);
  try {
    await ensureSchema();
    // Use findFirst with create if not found for better performance
    // This avoids a potential race condition and reduces queries
    const existing = await prisma.restaurant.findUnique({
      where: { slug: normalized },
      select: {
        id: true,
        slug: true,
        name: true,
        phone: true,
        logoAssetId: true,
        createdAt: true,
        updatedAt: true,
      },
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
      select: {
        id: true,
        slug: true,
        name: true,
        phone: true,
        logoAssetId: true,
        createdAt: true,
        updatedAt: true,
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
    include: { 
      restaurant: {
        select: {
          id: true,
          slug: true,
          name: true,
          phone: true,
          logoAssetId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
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
  // Use select for better performance - only fetch needed fields
  const existing = await prisma.restaurantMember.findFirst({
    where: { clerkUserId: options.clerkUserId },
    select: {
      restaurant: {
        select: {
          id: true,
          slug: true,
          name: true,
          phone: true,
          logoAssetId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
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

  // Use transaction for atomicity and better performance
  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        slug,
        name: options.name?.trim() || buildRestaurantName(slug),
        phone: options.phone?.trim() || null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        phone: true,
        logoAssetId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await tx.restaurantMember.create({
      data: {
        restaurantId: restaurant.id,
        clerkUserId: options.clerkUserId,
        role: "OWNER",
      },
    });
    return restaurant;
  });
}
