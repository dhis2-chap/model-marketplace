import type { Metadata } from "next";
import { Lato, Roboto_Mono, Rubik } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBenchmarks } from "@/lib/benchmarks";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto-mono",
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
      className={`${rubik.variable} ${lato.variable} ${robotoMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-surface font-body text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <Header leaderboardLive={getBenchmarks().length > 0} />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
