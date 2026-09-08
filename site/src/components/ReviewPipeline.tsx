"use client";

import { useEffect, useState } from "react";

type Tone = "brand" | "neutral" | "verified" | "exp";

const AUTO_ADVANCE_MS = 4000;

const TONE: Record<Tone, string> = {
  brand: "var(--mp-brand)",
  neutral: "var(--mp-text-3)",
  verified: "var(--mp-verified)",
  exp: "var(--mp-exp)",
};

const ACTIVE_STYLE: Record<Tone, string> = {
  brand: "border-brand bg-brand-tint shadow-mp",
  neutral: "border-line-strong bg-surface-2 shadow-mp",
  verified: "border-verified bg-verified-tint shadow-mp",
  exp: "border-exp bg-exp-tint shadow-mp",
};

const STEPS: {
  title: string;
  body: string;
  tag: string;
  tone: Tone;
}[] = [
  {
    title: "Open a pull request",
    body: "Add one model YAML file pinning a commit and the image tag built from it. No account, no upload form.",
    tag: "you",
    tone: "brand",
  },
  {
    title: "Automated checks",
    body: "CI validates the YAML against the registry schema: the channel pointers resolve, the commit and image tag agree, and every configuration fits the declared bounds.",
    tag: "ci",
    tone: "neutral",
  },
  {
    title: "Three maintainer reviews",
    body: "Maintainers check the pinned revision, the declared service contract, and that the service registers and completes a run. Three approvals required.",
    tag: "review gate",
    tone: "verified",
  },
  {
    title: "Merged = listed",
    body: "The merge commit is the listing. Your model appears with its first verified pin, at the assessed status you declared.",
    tag: "verified pin",
    tone: "verified",
  },
  {
    title: "Your own status, your own call",
    body: "Raising your assessed status as validation work lands is a PR against your service. The gate verifies pins; it never grades forecasts.",
    tag: "authors",
    tone: "exp",
  },
];

export function ReviewPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const timer = window.setTimeout(() => {
      setActiveStep((current) => (current + 1) % STEPS.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [activeStep, cycle]);

  const selectStep = (index: number) => {
    setActiveStep(index);
    setCycle((current) => current + 1);
  };

  const nextStep = () => selectStep((activeStep + 1) % STEPS.length);

  return (
    <div
      className="grid gap-3 md:grid-cols-5"
      aria-label="Review pipeline steps. The highlighted step advances automatically."
    >
      {STEPS.map((step, i) => {
        const isActive = i === activeStep;
        const tone = TONE[step.tone];

        return (
          <button
            key={step.title}
            type="button"
            aria-current={isActive ? "step" : undefined}
            onClick={() => selectStep(i)}
            className={`group relative min-h-[222px] cursor-pointer flex-col overflow-hidden rounded-lg border p-[18px] text-left transition-[background-color,border-color,box-shadow,opacity,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isActive
                ? `flex -translate-y-0.5 opacity-100 ${ACTIVE_STYLE[step.tone]}`
                : "hidden border-line bg-surface opacity-60 hover:opacity-85 md:flex"
            }`}
          >
            <span className="mb-3.5 flex w-full items-center justify-between">
              <span
                className={`font-mono text-[11px] transition-colors duration-300 ${
                  isActive ? "text-ink-2" : "text-ink-3"
                }`}
              >
                step {i + 1}
              </span>
              <span
                className={`block h-2 w-2 rounded-full transition-transform duration-300 ${
                  isActive ? "scale-125" : "scale-100"
                }`}
                style={{ background: tone }}
              />
            </span>
            <span
              className={`mb-2 font-brand text-[15px] font-medium leading-[1.3] transition-colors duration-300 ${
                isActive ? "text-ink" : "text-ink-2"
              }`}
            >
              {step.title}
            </span>
            <span className="mb-3 text-[12.5px] leading-relaxed text-ink-2">
              {step.body}
            </span>
            <span
              className="mt-auto self-start rounded-[3px] border px-1.5 py-[2px] font-mono text-[10.5px]"
              style={{ color: tone, borderColor: tone }}
            >
              {step.tag}
            </span>
            {isActive ? (
              <span
                key={`${activeStep}-${cycle}`}
                aria-hidden="true"
                className="review-pipeline-progress absolute inset-x-0 bottom-0 h-0.5 origin-left"
                style={{
                  background: tone,
                  animationDuration: `${AUTO_ADVANCE_MS}ms`,
                }}
              />
            ) : null}
          </button>
        );
      })}
      <div className="flex items-center justify-center gap-4 pt-1 md:hidden">
        <div className="flex items-center gap-2" aria-label="Choose a pipeline step">
          {STEPS.map((step, i) => (
            <button
              key={step.title}
              type="button"
              aria-label={`Show step ${i + 1}: ${step.title}`}
              aria-current={i === activeStep ? "step" : undefined}
              onClick={() => selectStep(i)}
              className={`h-2 cursor-pointer rounded-full transition-[background-color,width] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                i === activeStep ? "w-5 bg-ink" : "w-2 bg-line-strong"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={nextStep}
          className="cursor-pointer font-brand text-[12px] font-medium text-ink-2 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
