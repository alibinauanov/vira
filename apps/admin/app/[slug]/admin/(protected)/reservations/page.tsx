import { listReservations } from "@vira/shared/db/reservations";
import { ReservationsClient } from "./ReservationsClient";

export const dynamic = "force-dynamic";

export default async function ReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const initialDate = sp.date ?? "";

  const reservations = await listReservations(slug, {
    date: initialDate || undefined,
    includeCancelled: true,
  });

  return (
    <ReservationsClient
      slug={slug}
      initialDate={initialDate}
      initialReservations={reservations}
    />
  );
}
