import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800"],
});
const openSans = Open_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
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
  const standalone = pathname === "/coming-soon";

  return (
    <html lang="it" className={`${montserrat.variable} ${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {!standalone && <Header />}
        <main className="flex-1">{children}</main>
        {!standalone && <Footer />}
        {!standalone && <CookieBanner />}
      </body>
    </html>
  );
}
