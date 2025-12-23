import { prisma } from "@vira/shared/db/client";
import { ensureSchema } from "@vira/shared/db/schema";
import { ensureRestaurantForSlug } from "@vira/shared/db/restaurants";

async function run() {
  await ensureSchema();
  const missing = await prisma.reservation.findMany({
    where: { restaurantId: null },
    select: { id: true, businessSlug: true },
  });

  const slugs = Array.from(
    new Set(
      missing
        .map((res) => res.businessSlug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  );

  for (const slug of slugs) {
    const restaurant = await ensureRestaurantForSlug(slug);
    await prisma.reservation.updateMany({
      where: { businessSlug: slug, restaurantId: null },
      data: { restaurantId: restaurant.id },
    });
  }

  console.log(
    `Backfilled ${missing.length} reservations across ${slugs.length} slugs.`,
  );
}

run()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
