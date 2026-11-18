import type { Metadata } from "next";
import { Anton, Inter, Geist } from "next/font/google";
import "./globals.css";
import { PersonaProvider } from "./persona";
import PersonaBandeau from "./PersonaBandeau";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="fr" className={cn(fontTitres.variable, fontCorps.variable, "font-sans", geist.variable)}>
      <body>
        <PersonaProvider>
          <PersonaBandeau />
          {children}
        </PersonaProvider>
      </body>
    </html>
  );
}
