import { listAllMenuCategoriesForAdmin } from "@vira/shared/db/menu";
import { getRestaurantInfo } from "@vira/shared/db/restaurant-info";
import { requireRestaurantContext } from "@/lib/tenant";
import { KnowledgeClient } from "./KnowledgeClient";

type MenuCategory = Awaited<ReturnType<typeof listAllMenuCategoriesForAdmin>>[number];
type MenuItem = MenuCategory["items"][number];

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurantContext(
    slug,
    `/${slug}/admin/knowledge`,
  );

  const [info, categories] = await Promise.all([
    getRestaurantInfo(restaurant.id),
    listAllMenuCategoriesForAdmin(restaurant.id),
  ]);
  const safeInfo = info
    ? {
        address: info.address ?? null,
        workSchedule: info.workSchedule ?? null,
        about: info.about ?? null,
      }
    : null;
  const safeCategories = categories.map((category: MenuCategory) => ({
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    items: category.items.map((item: MenuItem) => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageAsset: item.imageAsset
        ? {
            id: item.imageAsset.id,
            objectKey: item.imageAsset.objectKey,
            publicUrl: item.imageAsset.publicUrl,
          }
        : null,
      sortOrder: item.sortOrder,
      isAvailable: item.isAvailable,
    })),
  }));

  return (
    <KnowledgeClient
      slug={restaurant.slug}
      initialInfo={safeInfo}
      initialCategories={safeCategories}
    />
  );
}
