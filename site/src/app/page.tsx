import { Suspense } from "react";
import { CatalogClient } from "@/components/CatalogClient";
import { getProposals } from "@/lib/proposals";
import { getRegistry } from "@/lib/registry";
import { toCardView, toInReviewViews } from "@/lib/views";

export default async function CatalogPage() {
  const registry = getRegistry();
  const proposals = await getProposals(registry);
  return (
    <Suspense>
      <CatalogClient
        models={registry.models.map(toCardView)}
        inReview={toInReviewViews(
          proposals,
          registry.index.review_policy.required_approvals,
        )}
      />
    </Suspense>
  );
}
