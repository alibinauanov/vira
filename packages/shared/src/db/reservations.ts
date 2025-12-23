import {
  ReservationStatus as PrismaReservationStatus,
} from "@prisma/client";
import {
  addDays,
  addMinutes,
  differenceInMinutes,
  startOfDay,
} from "date-fns";

import {
  CreateReservationPayload,
  DEFAULT_RESERVATION_DURATION_MINUTES,
  ReservationDTO,
  ReservationStatus,
  UpdateReservationPayload,
} from "../types";
import { prisma } from "./client";
import { ensureBusinessSeed } from "./seed";
import { normalizeSlug, ensureRestaurantForSlug } from "./restaurants";

const statusToDto = (
  status: PrismaReservationStatus,
): ReservationStatus => {
  switch (status) {
    case PrismaReservationStatus.CONFIRMED:
      return "confirmed";
    case PrismaReservationStatus.CANCELLED:
      return "cancelled";
    default:
      return "new";
  }
};

const statusFromDto = (
  status?: ReservationStatus,
): PrismaReservationStatus => {
  switch (status) {
    case "confirmed":
      return PrismaReservationStatus.CONFIRMED;
    case "cancelled":
      return PrismaReservationStatus.CANCELLED;
    default:
      return PrismaReservationStatus.NEW;
  }
};

const serializeReservation = (
  reservation: {
    id: number;
    restaurantId: number | null;
    businessSlug: string;
    tableLabel: string | null;
    tableSeats: number | null;
    startAt: Date;
    endAt: Date;
    partySize: number;
    name: string;
    phone: string;
    comment: string | null;
    status: PrismaReservationStatus;
    createdAt: Date;
  },
): ReservationDTO => ({
  id: reservation.id,
  businessSlug: reservation.businessSlug,
  tableLabel: reservation.tableLabel,
  tableSeats: reservation.tableSeats,
  startAt: reservation.startAt.toISOString(),
  endAt: reservation.endAt.toISOString(),
  partySize: reservation.partySize,
  name: reservation.name,
  phone: reservation.phone,
  comment: reservation.comment,
  status: statusToDto(reservation.status),
  createdAt: reservation.createdAt.toISOString(),
});

const buildReservationWhere = (
  restaurantId: number,
  date?: string,
  includeCancelled?: boolean,
) => {
  const where: {
    restaurantId: number;
    startAt?: { gte: Date; lt: Date };
    status?: { not: PrismaReservationStatus };
  } = {
    restaurantId,
  };

  if (date) {
    const start = startOfDay(new Date(`${date}T00:00:00`));
    const end = addDays(start, 1);
    where.startAt = { gte: start, lt: end };
  }

  if (!includeCancelled) {
    where.status = { not: PrismaReservationStatus.CANCELLED };
  }

  return where;
};

const ensureTableAvailability = async (options: {
  restaurantId: number;
  tableLabel: string;
  startAt: Date;
  endAt: Date;
  reservationIdToSkip?: number;
}) => {
  const overlapping = await prisma.reservation.findFirst({
    where: {
      restaurantId: options.restaurantId,
      tableLabel: options.tableLabel,
      status: { not: PrismaReservationStatus.CANCELLED },
      id: options.reservationIdToSkip
        ? { not: options.reservationIdToSkip }
        : undefined,
      NOT: [
        { endAt: { lte: options.startAt } },
        { startAt: { gte: options.endAt } },
      ],
    },
  });

  if (overlapping) {
    throw new Error("Стол уже занят на выбранное время.");
  }
};

export async function listReservations(
  slug: string,
  options: {
    date?: string;
    includeCancelled?: boolean;
  } = {},
): Promise<ReservationDTO[]> {
  const normalizedSlug = ensureValidSlug(slug);
  await ensureBusinessSeed(normalizedSlug);
  const restaurant = await ensureRestaurantForSlug(normalizedSlug);

  const reservations = await prisma.reservation.findMany({
    where: buildReservationWhere(
      restaurant.id,
      options.date,
      options.includeCancelled,
    ),
    orderBy: [{ startAt: "asc" }, { id: "asc" }],
  });

  return reservations.map(serializeReservation);
}

export async function createReservation(
  slug: string,
  payload: CreateReservationPayload,
): Promise<ReservationDTO> {
  const normalizedSlug = ensureValidSlug(slug);
  await ensureBusinessSeed(normalizedSlug);
  const restaurant = await ensureRestaurantForSlug(normalizedSlug);

  const startAt = new Date(payload.startAt);
  const duration =
    payload.durationMinutes ?? DEFAULT_RESERVATION_DURATION_MINUTES;
  const endAt = payload.endAt
    ? new Date(payload.endAt)
    : addMinutes(startAt, duration);

  if (
    payload.tableSeats !== undefined &&
    payload.partySize > payload.tableSeats
  ) {
    throw new Error("Количество гостей превышает вместимость стола.");
  }

  if (payload.tableLabel) {
    await ensureTableAvailability({
      restaurantId: restaurant.id,
      tableLabel: payload.tableLabel,
      startAt,
      endAt,
    });
  }

  const reservation = await prisma.reservation.create({
    data: {
      businessSlug: normalizedSlug,
      restaurantId: restaurant.id,
      tableLabel: payload.tableLabel ?? null,
      tableSeats: payload.tableSeats ?? null,
      startAt,
      endAt,
      partySize: payload.partySize,
      name: payload.name,
      phone: payload.phone,
      comment: payload.comment,
      status: statusFromDto(payload.status),
    },
  });

  return serializeReservation(reservation);
}

export async function updateReservation(
  slug: string,
  id: number,
  payload: UpdateReservationPayload,
): Promise<ReservationDTO> {
  const normalizedSlug = ensureValidSlug(slug);
  await ensureBusinessSeed(normalizedSlug);
  const restaurant = await ensureRestaurantForSlug(normalizedSlug);

  const existing = await prisma.reservation.findFirst({
    where: { id, restaurantId: restaurant.id },
  });

  if (!existing) {
    throw new Error("Бронь не найдена.");
  }

  const startAt = payload.startAt
    ? new Date(payload.startAt)
    : existing.startAt;
  const duration = payload.durationMinutes
    ? payload.durationMinutes
    : differenceInMinutes(existing.endAt, existing.startAt);
  const endAt = payload.endAt
    ? new Date(payload.endAt)
    : addMinutes(startAt, duration);

  const nextTableSeats = payload.tableSeats ?? existing.tableSeats;
  const nextPartySize = payload.partySize ?? existing.partySize;
  if (nextTableSeats && nextPartySize > nextTableSeats) {
    throw new Error("Количество гостей превышает вместимость стола.");
  }

  const tableLabel = payload.tableLabel ?? existing.tableLabel;
  if (tableLabel) {
    await ensureTableAvailability({
      restaurantId: restaurant.id,
      tableLabel,
      startAt,
      endAt,
      reservationIdToSkip: existing.id,
    });
  }

  const reservation = await prisma.reservation.update({
    where: { id: existing.id },
    data: {
      restaurantId: restaurant.id,
      startAt,
      endAt,
      tableLabel: payload.tableLabel ?? existing.tableLabel,
      tableSeats: payload.tableSeats ?? existing.tableSeats,
      partySize: payload.partySize ?? existing.partySize,
      name: payload.name ?? existing.name,
      phone: payload.phone ?? existing.phone,
      comment:
        payload.comment === undefined ? existing.comment : payload.comment,
      status: payload.status
        ? statusFromDto(payload.status)
        : existing.status,
    },
  });

  return serializeReservation(reservation);
}

export async function deleteReservation(slug: string, id: number) {
  const normalizedSlug = ensureValidSlug(slug);
  await ensureBusinessSeed(normalizedSlug);
  const restaurant = await ensureRestaurantForSlug(normalizedSlug);

  const existing = await prisma.reservation.findFirst({
    where: { id, restaurantId: restaurant.id },
  });

  if (!existing) {
    throw new Error("Бронь не найдена.");
  }

  await prisma.reservation.delete({ where: { id } });

  return { success: true };
}

export async function getReservationById(
  slug: string,
  id: number,
): Promise<ReservationDTO | null> {
  const normalizedSlug = ensureValidSlug(slug);
  await ensureBusinessSeed(normalizedSlug);
  const restaurant = await ensureRestaurantForSlug(normalizedSlug);

  const reservation = await prisma.reservation.findFirst({
    where: { id, restaurantId: restaurant.id },
  });

  if (!reservation) return null;
  return serializeReservation(reservation);
}

const ensureValidSlug = (raw?: string) => normalizeSlug(raw);
