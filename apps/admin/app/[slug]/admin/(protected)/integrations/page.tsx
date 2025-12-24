import type { IntegrationStatus, IntegrationType } from "@vira/shared/db/integrations";
import { getIntegrations } from "@vira/shared/db/integrations";
import { requireRestaurantContext } from "@/lib/tenant";
import { IntegrationsClient } from "./IntegrationsClient";

type IntegrationRow = {
  id: number;
  type: IntegrationType;
  status: IntegrationStatus;
  config: unknown;
};

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
  const integrations = (await getIntegrations(restaurant.id)) as IntegrationRow[];
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
