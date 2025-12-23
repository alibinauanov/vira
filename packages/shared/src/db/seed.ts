import { ReservationStatus } from "@prisma/client";
import { addHours, set } from "date-fns";

import { prisma } from "./client";
import { ensureSchema } from "./schema";
import {
  ensureRestaurantForSlug,
  normalizeSlug,
} from "./restaurants";

const seededSlugs = new Set<string>();

export async function ensureBusinessSeed(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  if (seededSlugs.has(normalizedSlug)) return;

  await ensureSchema();

  const restaurant = await ensureRestaurantForSlug(normalizedSlug);
  await prisma.reservation.updateMany({
    where: { businessSlug: normalizedSlug, restaurantId: null },
    data: { restaurantId: restaurant.id },
  });

  const reservationCount = await prisma.reservation.count({
    where: { restaurantId: restaurant.id },
  });

  if (reservationCount === 0) {
    const todayAt19 = set(new Date(), {
      hours: 19,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const todayAt21 = addHours(todayAt19, 2);
    await prisma.reservation.create({
      data: {
        businessSlug: normalizedSlug,
        restaurantId: restaurant.id,
        tableLabel: "A1",
        tableSeats: 2,
        startAt: todayAt19,
        endAt: todayAt21,
        partySize: 2,
        name: "Гость",
        phone: "+77001112233",
        comment: "Пример бронирования",
        status: ReservationStatus.CONFIRMED,
      },
    });
  }

  seededSlugs.add(normalizedSlug);
}
