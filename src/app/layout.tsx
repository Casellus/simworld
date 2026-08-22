import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";

// Heading: Chakra Petch — tech-squadrato, look sim racing / telemetria.
const chakraPetch = Chakra_Petch({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});
// Body: Inter — pulito e leggibile.
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SimUniverse — Hub italiano del Sim Racing",
  description:
    "Tornei, team, assetti e guide per ACC, iRacing, LMU, Assetto Corsa, AC EVO e F1 25. La community italiana del sim racing.",
  keywords: ["sim racing", "ACC", "iRacing", "LMU", "F1 25", "assetto corsa", "tornei", "esports"],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  // Le schermate auth sono fullscreen (foto + card): niente header/footer,
  // che altrimenti coprirebbero il pulsante Indietro su mobile.
  const standalone = pathname === "/coming-soon" || pathname.startsWith("/auth/");

  return (
    <html lang="it" className={`${chakraPetch.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {!standalone && <Header />}
        <main className={`flex-1${!standalone ? " pt-[72px] md:pt-[80px]" : ""}`}>{children}</main>
        {!standalone && <Footer />}
        {!standalone && <CookieBanner />}
      </body>
    </html>
  );
}
