/**
 * Benchmarks wait on the CHAP benchmarking backend. Until it lands, the
 * benchmarks page, the per-model Benchmarks tab and the header nav all render
 * a "coming soon" state — flip this when the backend is live.
 *
 * Kept in its own module with no node imports so client components
 * (ModelDetailTabs) can read it without pulling in the fs-based loaders.
 */
export const BENCHMARKS_LIVE: boolean = false;
