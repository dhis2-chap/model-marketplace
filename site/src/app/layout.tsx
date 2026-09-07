import type { Metadata } from "next";
import {
  Schibsted_Grotesk,
  Source_Serif_4,
  Spline_Sans_Mono,
} from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBenchmarks } from "@/lib/benchmarks";
import { BENCHMARKS_LIVE } from "@/lib/flags";
import "./globals.css";

/* Schibsted Grotesk: display + UI. A Norwegian grotesque for an Oslo-built
   platform — HISP Centre, University of Oslo. */
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

/* Source Serif 4: the prose voice — ledes, summaries, documentation. */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

/* Spline Sans Mono: pins, SHAs, numerals, run records. */
const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
});

export const metadata: Metadata = {
  title: {
    default: "CHAP Model Marketplace",
    template: "%s · CHAP Model Marketplace",
  },
  description:
    "Curated, verified forecasting models for CHAP, the Climate & Health Analytics Platform. Every listed model and every version pin is reviewed by three CHAP maintainers.",
};

const THEME_INIT = `try{if(localStorage.getItem("chap-mp-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${schibsted.variable} ${sourceSerif.variable} ${splineMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-paper font-body text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <Header benchmarksLive={BENCHMARKS_LIVE && getBenchmarks().length > 0} />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
