import { Suspense } from "react";
import { CatalogClient } from "@/components/CatalogClient";
import { HeroChart } from "@/components/HeroChart";
import { getRegistry, marketplaceStats } from "@/lib/registry";
import { toCardView } from "@/lib/views";

export default function CatalogPage() {
  const registry = getRegistry();
  const models = registry.models.map(toCardView);
  const stats = marketplaceStats(registry);
  return (
    <Suspense>
      <CatalogClient models={models} stats={stats} heroChart={<HeroChart />} />
    </Suspense>
  );
}
