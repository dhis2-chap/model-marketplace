import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBenchmarks } from "@/lib/benchmarks";
import { BENCHMARKS_LIVE } from "@/lib/flags";
import "./globals.css";

/* The DHIS2 design system's typeface (theme.fonts). */
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Chap Model Marketplace",
    template: "%s · Chap Model Marketplace",
  },
  description:
    "Curated, verified forecasting models for Chap, the Climate & Health Analytics Platform. Every listed model and every version pin is reviewed by three Chap maintainers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-paper font-body text-ink antialiased">
        <Header benchmarksLive={BENCHMARKS_LIVE && getBenchmarks().length > 0} />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
