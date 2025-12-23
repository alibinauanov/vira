import { z } from "zod";

export const reservationStatusSchema = z.enum([
  "new",
  "confirmed",
  "cancelled",
]);

export const createReservationSchema = z.object({
  tableLabel: z.string().min(1).optional(),
  tableSeats: z.coerce.number().int().positive().optional(),
  partySize: z.coerce.number().int().positive(),
  startAt: z.string().min(5),
  endAt: z.string().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  name: z.string().min(1),
  phone: z.string().min(3),
  comment: z.string().optional(),
  status: reservationStatusSchema.optional(),
});

export const updateReservationSchema = createReservationSchema.partial();

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});
