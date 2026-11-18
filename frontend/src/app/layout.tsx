import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { PersonaProvider } from "./persona";
import PersonaBandeau from "./PersonaBandeau";

const fontTitres = Anton({
  variable: "--font-titres",
  weight: "400",
  subsets: ["latin"],
});

const fontCorps = Inter({
  variable: "--font-corps",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Terrains — Sport dans la Ville",
  description: "Suivi des terrains et de leurs équipements, Sport dans la Ville",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${fontTitres.variable} ${fontCorps.variable}`}>
      <body>
        <PersonaProvider>
          <PersonaBandeau />
          {children}
        </PersonaProvider>
      </body>
    </html>
  );
}
