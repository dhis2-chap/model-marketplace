import { Suspense } from "react";
import { CatalogClient } from "@/components/CatalogClient";
import { HeroChart } from "@/components/HeroChart";
import { getProposals } from "@/lib/proposals";
import { getRegistry, marketplaceStats } from "@/lib/registry";
import { fetchedAtLabel, toCardView, toInReviewViews } from "@/lib/views";

export default async function CatalogPage() {
  const registry = getRegistry();
  const proposals = await getProposals(registry);
  const models = registry.models.map(toCardView);
  const stats = marketplaceStats(registry);
  return (
    <Suspense>
      <CatalogClient
        models={models}
        stats={stats}
        heroChart={<HeroChart />}
        inReview={toInReviewViews(
          proposals,
          registry.index.review_policy.required_approvals,
        )}
        inReviewAsOf={fetchedAtLabel(proposals.fetchedAt)}
      />
    </Suspense>
  );
}
