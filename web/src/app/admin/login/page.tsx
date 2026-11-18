import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/admin/login-form"
import { Logo } from "@/components/brand"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin")
  const { next } = await searchParams
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-between p-6 sm:p-10">
        <Logo />
        <div className="mx-auto w-full max-w-sm py-10">
          <h1 className="font-display text-4xl text-navy">Espace direction</h1>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">Connectez-vous pour piloter les incidents remontés du terrain.</p>
          <LoginForm next={next} />
        </div>
        <p className="text-xs text-muted-foreground">© Sport dans la Ville · prototype</p>
      </div>
      <div className="bg-court relative hidden overflow-hidden bg-navy lg:block">
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <div className="font-display text-6xl leading-[0.95]">
            Des terrains <span className="text-lime">en forme</span>,<br />des jeunes en jeu.
          </div>
          <p className="mt-4 max-w-md text-white/70">
            Chaque signalement arrive ici en direct. Affectez un prestataire, fixez une date, confirmez la réparation.
          </p>
        </div>
        <svg className="absolute -top-20 -right-20 size-[480px] text-white/5" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="10" y="10" width="180" height="180" rx="8" />
          <line x1="100" y1="10" x2="100" y2="190" />
          <circle cx="100" cy="100" r="30" />
          <rect x="10" y="60" width="35" height="80" />
          <rect x="155" y="60" width="35" height="80" />
        </svg>
      </div>
    </div>
  )
}
