/**
 * No benchmarks have been run yet, and how they will be run is still being
 * decided. Until results exist, the benchmarks page, the per-model Benchmarks
 * tab and the header nav all render a "coming soon" state — flip this when
 * real results land.
 *
 * Kept in its own module with no node imports so client components
 * (ModelDetailTabs) can read it without pulling in the fs-based loaders.
 */
export const BENCHMARKS_LIVE: boolean = false;
