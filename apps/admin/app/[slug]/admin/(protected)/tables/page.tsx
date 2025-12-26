import { listFloorPlans, ensureActiveFloorPlan } from "@vira/shared/db/floor-plans";
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
  
  const [allFloors, activePlan] = await Promise.all([
    listFloorPlans(restaurant.id),
    ensureActiveFloorPlan(restaurant.id),
  ]);

  const floors = allFloors.map((floor) => ({
    id: floor.id,
    name: floor.name,
    isActive: floor.isActive,
    canvasWidth: floor.canvasWidth ?? 800,
    canvasHeight: floor.canvasHeight ?? 480,
    tableCount: floor.tables.length,
  }));

  return (
    <SeatingMapClient
      slug={restaurant.slug}
      initialFloors={floors}
      initialPlan={{
        id: activePlan.id,
        name: activePlan.name,
        canvasWidth: activePlan.canvasWidth ?? 800,
        canvasHeight: activePlan.canvasHeight ?? 480,
        tables: activePlan.tables.map((table: Table) => ({
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
