import {
  createReservation,
  listReservations,
} from "@vira/shared";

const slug = "smoke-test";

async function main() {
  const startAt = new Date();
  startAt.setMinutes(0, 0, 0);
  const startIso = startAt.toISOString();

  const reservation = await createReservation(slug, {
    tableLabel: "A1",
    tableSeats: 2,
    partySize: 2,
    startAt: startIso,
    durationMinutes: 90,
    name: "Smoke Test",
    phone: "+70000000000",
  });

  const reservations = await listReservations(slug);

  const exists = reservations.some((r) => r.id === reservation.id);
  if (!exists) {
    throw new Error("Created reservation not found in list");
  }

  console.log(
    `Smoke test passed: created reservation ${reservation.id} for slug "${slug}"`,
  );
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
