import { getIntegrations } from "@vira/shared/db/integrations";
import { requireRestaurantContext } from "@/lib/tenant";
import { IntegrationsClient } from "./IntegrationsClient";

const toConfig = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurantContext(
    slug,
    `/${slug}/admin/integrations`,
  );
  const integrations = await getIntegrations(restaurant.id);
  const safeIntegrations = integrations.map((integration) => ({
    id: integration.id,
    type: integration.type,
    status: integration.status,
    config: toConfig(integration.config),
  }));

  return (
    <IntegrationsClient
      slug={restaurant.slug}
      initialIntegrations={safeIntegrations}
    />
  );
}
