import Link from "next/link"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Megaphone, ShieldCheck } from "lucide-react"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/admin">
                <ShieldCheck /> Espace direction
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-navy hover:bg-navy/90">
              <Link href="/signaler">
                <Megaphone /> Signaler
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-16 bg-navy text-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Logo white />
          <p className="max-w-md text-sm">
            Des terrains en bon état pour que chaque jeune puisse jouer en sécurité, au pied de chez lui.
          </p>
          <p className="text-xs text-white/50">Prototype · données de démonstration</p>
        </div>
      </footer>
    </div>
  )
}
