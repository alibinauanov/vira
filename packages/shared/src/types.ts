export type ReservationStatus = "new" | "confirmed" | "cancelled";

export const RESERVATION_STATUSES: ReservationStatus[] = [
  "new",
  "confirmed",
  "cancelled",
];

export const DEFAULT_RESERVATION_DURATION_MINUTES = 120;

export type ReservationDTO = {
  id: number;
  businessSlug: string;
  tableLabel?: string | null;
  tableSeats?: number | null;
  startAt: string;
  endAt: string;
  partySize: number;
  name: string;
  phone: string;
  comment?: string | null;
  status: ReservationStatus;
  createdAt: string;
};

export type CreateReservationPayload = {
  tableLabel?: string;
  tableSeats?: number;
  partySize: number;
  startAt: string;
  endAt?: string;
  durationMinutes?: number;
  name: string;
  phone: string;
  comment?: string;
  status?: ReservationStatus;
};

export type UpdateReservationPayload = {
  tableLabel?: string | null;
  tableSeats?: number | null;
  partySize?: number;
  startAt?: string;
  endAt?: string;
  durationMinutes?: number;
  name?: string;
  phone?: string;
  comment?: string | null;
  status?: ReservationStatus;
};
