import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimWorld — Hub italiano del Sim Racing",
  description:
    "Tornei, team, assetti e guide per ACC, iRacing, LMU, Assetto Corsa, AC EVO e F1 25. La community italiana del sim racing.",
  keywords: ["sim racing", "ACC", "iRacing", "LMU", "F1 25", "assetto corsa", "tornei", "esports"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
