import type { Metadata } from "next"
import { Anton, Montserrat } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" })

export const metadata: Metadata = {
  title: "Terrains en forme · Sport dans la Ville",
  description: "Signalez un équipement sportif abîmé et suivez sa réparation.",
  icons: { icon: "/logo-sdlv.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} ${anton.variable} font-sans`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
