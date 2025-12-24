import { ensureActiveFloorPlan } from "@vira/shared/db/floor-plans";
import { requireRestaurantContext } from "@/lib/tenant";
import { SeatingMapClient } from "./SeatingMapClient";

type FloorPlan = Awaited<ReturnType<typeof ensureActiveFloorPlan>>;
type Table = NonNullable<FloorPlan>["tables"][number];

export default async function TablesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurantContext(
    slug,
    `/${slug}/admin/tables`,
  );
  const plan = await ensureActiveFloorPlan(restaurant.id);

  return (
    <SeatingMapClient
      slug={restaurant.slug}
      initialPlan={{
        id: plan.id,
        name: plan.name,
        canvasWidth: plan.canvasWidth ?? 800,
        canvasHeight: plan.canvasHeight ?? 480,
        tables: plan.tables.map((table: Table) => ({
          id: table.id,
          number: table.number,
          label: table.label,
          seats: table.seats,
          x: table.x,
          y: table.y,
          width: table.width,
          height: table.height,
          rotation: table.rotation,
        })),
      }}
    />
  );
}
