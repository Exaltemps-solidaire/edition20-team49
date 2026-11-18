import { ShieldCheck, Timer, Smartphone } from "lucide-react"
import { readDb } from "@/lib/db"
import { DeclareForm } from "@/components/public/declare-form"

export const dynamic = "force-dynamic"

export default async function SignalerPage({ searchParams }: { searchParams: Promise<{ terrain?: string }> }) {
  const [{ terrain }, db] = await Promise.all([searchParams, readDb()])
  return (
    <div className="bg-court">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Déclaration d&apos;incident</p>
          <h1 className="font-display mt-2 text-4xl text-navy sm:text-5xl">Signaler un équipement abîmé</h1>
          <p className="mt-3 mb-8 text-muted-foreground">Les champs marqués d&apos;un * sont obligatoires. Ça prend moins d&apos;une minute.</p>
          <DeclareForm terrains={db.terrains} initialTerrain={terrain} />
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3 rounded-3xl bg-navy p-6 text-white">
            <h2 className="font-display text-2xl text-lime">Bon à savoir</h2>
            {[
              { icon: Timer, t: "Traitement rapide", d: "La direction est notifiée dès l'envoi." },
              { icon: Smartphone, t: "Pensé pour le terrain", d: "Prenez la photo directement avec votre téléphone." },
              { icon: ShieldCheck, t: "Danger immédiat ?", d: "Mettez l'urgence à 5 et éloignez les jeunes de l'équipement." },
            ].map((x) => (
              <div key={x.t} className="flex gap-3 rounded-2xl bg-white/5 p-4">
                <x.icon className="size-5 shrink-0 text-lime" />
                <div>
                  <div className="text-sm font-bold">{x.t}</div>
                  <div className="text-xs text-white/70">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
