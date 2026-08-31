import { parse } from "yaml";
import type { Registry } from "./registry";
import type { Model } from "./schema";

/**
 * Open-PR ingestion: at build time the site asks GitHub for open pull
 * requests against the marketplace repo (registry.marketplace.repository)
 * that touch models/*.yaml, so an in-review model or version pin can appear
 * on the site with its running approval count before it merges.
 *
 * The registry stays the only hard gate — if GitHub is unreachable or rate
 * limits the build, ingestion degrades to "no in-review pins" with a warning
 * instead of failing. Set MARKETPLACE_SKIP_PR_INGEST=1 to skip it outright;
 * GITHUB_TOKEN is used when present.
 */

/** A new version pin (or a whole new model) proposed by an open PR. */
export interface ProposedPin {
  modelId: string;
  displayName: string;
  /** True when the PR adds a model file main does not have. */
  isNewModel: boolean;
  /** Null when the head file could not be read or parsed. */
  versionTag: string | null;
  commit: string | null;
}

export interface Proposal {
  number: number;
  title: string;
  url: string;
  author: string;
  updatedAt: string;
  /** Reviewers whose latest state-changing review approves. */
  approvedBy: string[];
  pins: ProposedPin[];
}

export interface Proposals {
  /** ISO timestamp of the fetch (= the site build); null when ingestion was skipped or unavailable. */
  fetchedAt: string | null;
  proposals: Proposal[];
}

/* ---------- pure transforms (unit-tested, no network) ---------- */

export interface ReviewInput {
  user: string;
  state: string;
  submittedAt: string;
}

/**
 * Unique reviewers whose review currently counts as an approval. A COMMENTED
 * review does not dismiss an earlier approval (GitHub semantics); APPROVED,
 * CHANGES_REQUESTED and DISMISSED each replace the reviewer's prior state.
 */
export function approvingReviewers(
  reviews: ReviewInput[],
  prAuthor: string,
): string[] {
  const lastState = new Map<string, string>();
  for (const review of [...reviews].sort((a, b) =>
    a.submittedAt.localeCompare(b.submittedAt),
  )) {
    if (review.user === prAuthor) continue;
    if (["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(review.state)) {
      lastState.set(review.user, review.state);
    }
  }
  return [...lastState.entries()]
    .filter(([, state]) => state === "APPROVED")
    .map(([user]) => user);
}

/**
 * Diff a model file at the PR head against what main already lists. The head
 * file is work in progress and may not satisfy the schema yet, so it is
 * parsed leniently — an unreadable file still yields one pin with nulls.
 */
export function proposedPinsInFile(
  filePath: string,
  headYaml: string | null,
  existing: Model | undefined,
): ProposedPin[] {
  const fallbackId = filePath.replace(/^models\//, "").replace(/\.yaml$/, "");
  let head: Record<string, unknown> = {};
  try {
    const parsed = headYaml === null ? null : parse(headYaml);
    if (parsed && typeof parsed === "object") {
      head = parsed as Record<string, unknown>;
    }
  } catch {
    // keep the empty head: the PR is still listed, without pin detail
  }

  const modelId = typeof head.id === "string" ? head.id : fallbackId;
  const displayName =
    typeof head.display_name === "string"
      ? head.display_name
      : (existing?.display_name ?? modelId);
  const isNewModel = existing === undefined;

  const headVersions = (Array.isArray(head.versions) ? head.versions : [])
    .filter((v): v is Record<string, unknown> => Boolean(v) && typeof v === "object")
    .map((v) => ({
      versionTag: typeof v.version === "string" ? v.version : null,
      commit: typeof v.commit === "string" ? v.commit : null,
    }))
    .filter((v) => v.versionTag !== null);

  const knownPins = new Map(
    (existing?.versions ?? []).map((v) => [v.version, v.commit]),
  );
  const proposed = headVersions.filter(
    (v) => knownPins.get(v.versionTag!) !== v.commit,
  );

  if (proposed.length === 0 && !isNewModel) return [];
  if (proposed.length === 0) {
    // A new model whose versions could not be parsed: list the model itself.
    return [{ modelId, displayName, isNewModel, versionTag: null, commit: null }];
  }
  return proposed.map((v) => ({
    modelId,
    displayName,
    isNewModel,
    versionTag: v.versionTag,
    commit: v.commit,
  }));
}

/* ---------- GitHub fetch layer ---------- */

const GITHUB_API = "https://api.github.com";
const MODEL_FILE = /^models\/[a-z0-9_]+\.yaml$/;

interface FetchOptions {
  token?: string;
  timeoutMs?: number;
}

function ghHeaders(token?: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function ghJson(url: string, opts: FetchOptions): Promise<unknown> {
  const res = await fetch(url, {
    headers: ghHeaders(opts.token),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 8000),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}`);
  return res.json();
}

/** File content at a ref, or null when it cannot be read (deleted fork, 404). */
async function ghFileContent(
  repoFullName: string,
  ref: string,
  filePath: string,
  opts: FetchOptions,
): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${repoFullName}/contents/${filePath}?ref=${ref}`,
      {
        headers: { ...ghHeaders(opts.token), Accept: "application/vnd.github.raw+json" },
        signal: AbortSignal.timeout(opts.timeoutMs ?? 8000),
      },
    );
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

interface GhPull {
  number: number;
  title: string;
  html_url: string;
  draft: boolean;
  updated_at: string;
  user: { login: string } | null;
  head: { sha: string; repo: { full_name: string } | null };
}

export async function fetchOpenProposals(
  repoSlug: string,
  registry: Registry,
  opts: FetchOptions = {},
): Promise<Proposal[]> {
  const byId = new Map(registry.models.map((m) => [m.id, m]));
  const pulls = (await ghJson(
    `${GITHUB_API}/repos/${repoSlug}/pulls?state=open&per_page=50`,
    opts,
  )) as GhPull[];

  const proposals: Proposal[] = [];
  for (const pr of pulls) {
    if (pr.draft) continue;
    const files = (await ghJson(
      `${GITHUB_API}/repos/${repoSlug}/pulls/${pr.number}/files?per_page=100`,
      opts,
    )) as { filename: string; status: string }[];
    const modelFiles = files.filter(
      (f) => MODEL_FILE.test(f.filename) && f.status !== "removed",
    );
    if (modelFiles.length === 0) continue;

    const reviews = (await ghJson(
      `${GITHUB_API}/repos/${repoSlug}/pulls/${pr.number}/reviews?per_page=100`,
      opts,
    )) as { user: { login: string } | null; state: string; submitted_at: string }[];

    const author = pr.user?.login ?? "unknown";
    const headRepo = pr.head.repo?.full_name ?? repoSlug;
    const pins: ProposedPin[] = [];
    for (const file of modelFiles) {
      const headYaml = await ghFileContent(headRepo, pr.head.sha, file.filename, opts);
      const existing = byId.get(
        file.filename.replace(/^models\//, "").replace(/\.yaml$/, ""),
      );
      pins.push(...proposedPinsInFile(file.filename, headYaml, existing));
    }
    if (pins.length === 0) continue; // touches model files but proposes no new pin

    proposals.push({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      author,
      updatedAt: pr.updated_at,
      approvedBy: approvingReviewers(
        reviews
          .filter((r) => r.user !== null)
          .map((r) => ({
            user: r.user!.login,
            state: r.state,
            submittedAt: r.submitted_at ?? "",
          })),
        author,
      ),
      pins,
    });
  }
  return proposals;
}

/* ---------- build-time entry ---------- */

let cached: Proposals | null = null;

export async function getProposals(registry: Registry): Promise<Proposals> {
  if (cached) return cached;
  const repoUrl = registry.index.marketplace.repository;
  if (!repoUrl || process.env.MARKETPLACE_SKIP_PR_INGEST === "1") {
    cached = { fetchedAt: null, proposals: [] };
    return cached;
  }
  const repoSlug = repoUrl
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\/+$/, "");
  try {
    const proposals = await fetchOpenProposals(repoSlug, registry, {
      token: process.env.GITHUB_TOKEN,
    });
    cached = { fetchedAt: new Date().toISOString(), proposals };
  } catch (error) {
    console.warn(
      `[marketplace] open-PR ingestion unavailable (${error instanceof Error ? error.message : error}) — building without in-review pins`,
    );
    cached = { fetchedAt: null, proposals: [] };
  }
  return cached;
}
