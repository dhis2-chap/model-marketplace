import { z } from "zod";

/**
 * Zod encoding of the registry format (schema_version 1) documented in
 * models/README.md. The site's build and `pnpm validate` both fail when a
 * file violates it, so a model PR gets a machine check before the three
 * maintainer reviews.
 */

export const VERSION_STATUSES = [
  "verified",
  "unstable",
  "deprecated",
  "yanked",
] as const;

const versionSchema = z.object({
  version: z.string().min(1),
  commit: z
    .string()
    .regex(/^[0-9a-f]{40}$/, "commit must be a full 40-char git sha"),
  status: z.enum(VERSION_STATUSES),
  verified_by: z.array(z.string()).default([]),
  changelog: z.string().nullable().default(null),
  notes: z.string().optional(),
});

const configurationSchema = z.object({
  description: z.string(),
  user_option_values: z.record(z.string(), z.unknown()),
  additional_continuous_covariates: z.array(z.string()).optional(),
});

export const modelSchema = z
  .object({
    schema_version: z.literal(1),
    id: z.string().regex(/^[a-z0-9_]+$/),
    display_name: z.string().min(1),
    maturity: z.enum(["stable", "experimental"]),
    summary: z.string().min(1),
    source: z.object({
      repository: z.string().url(),
      mlproject_name: z.string().optional(),
    }),
    maintainers: z.array(z.string()).default([]),
    compatibility: z.object({
      period_types: z.array(z.string()).min(1),
      max_prediction_length: z.number().int().positive().optional(),
    }),
    covariates: z.object({
      required: z.array(z.string()),
      additional_continuous: z.array(z.string()),
    }),
    channels: z.object({
      stable: z.string().min(1),
      latest: z.string().min(1),
    }),
    versions: z.array(versionSchema).min(1),
    configurations: z.record(z.string(), configurationSchema).default({}),
  })
  .superRefine((model, ctx) => {
    const byTag = new Map(model.versions.map((v) => [v.version, v]));
    for (const channel of ["stable", "latest"] as const) {
      if (!byTag.has(model.channels[channel])) {
        ctx.addIssue({
          code: "custom",
          path: ["channels", channel],
          message: `channels.${channel} points at "${model.channels[channel]}", which is not in versions`,
        });
      }
    }
    const stable = byTag.get(model.channels.stable);
    if (stable && stable.status !== "verified") {
      ctx.addIssue({
        code: "custom",
        path: ["channels", "stable"],
        message: `channels.stable must point at a verified version (got status "${stable.status}")`,
      });
    }
    const seen = new Set<string>();
    for (const v of model.versions) {
      if (seen.has(v.version)) {
        ctx.addIssue({
          code: "custom",
          path: ["versions"],
          message: `duplicate version tag "${v.version}"`,
        });
      }
      seen.add(v.version);
    }
    const allowed = new Set(model.covariates.additional_continuous);
    const required = new Set(model.covariates.required);
    for (const [name, config] of Object.entries(model.configurations)) {
      for (const cov of config.additional_continuous_covariates ?? []) {
        if (required.has(cov)) {
          ctx.addIssue({
            code: "custom",
            path: ["configurations", name],
            message: `"${cov}" is a required covariate (auto-supplied by chap) and must not be repeated in configurations`,
          });
        } else if (!allowed.has(cov)) {
          ctx.addIssue({
            code: "custom",
            path: ["configurations", name],
            message: `"${cov}" is not declared under covariates.additional_continuous`,
          });
        }
      }
    }
  });

export const registrySchema = z.object({
  schema_version: z.literal(1),
  marketplace: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    documentation: z.record(z.string(), z.string().url()),
  }),
  review_policy: z.object({
    required_approvals: z.number().int().positive(),
    note: z.string().optional(),
  }),
  models: z.array(z.string().regex(/^models\/[a-z0-9_]+\.yaml$/)).min(1),
});

export type ModelVersion = z.infer<typeof versionSchema>;
export type ModelConfiguration = z.infer<typeof configurationSchema>;
export type Model = z.infer<typeof modelSchema>;
export type RegistryIndex = z.infer<typeof registrySchema>;
