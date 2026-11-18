import Link from "next/link"
import { ArrowRight, Camera, CheckCircle2, MapPin, Search, Wrench } from "lucide-react"
import { readDb } from "@/lib/db"
import { toPoints } from "@/lib/points"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicMap } from "@/components/public/public-map"
import { TrackForm } from "@/components/public/track-form"

export const dynamic = "force-dynamic"

export default async function Home() {
  const db = await readDb()
  const open = db.incidents.filter((i) => i.status !== "resolu").length
  const resolved = db.incidents.filter((i) => i.status === "resolu").length
  const cities = new Set(db.terrains.map((t) => t.city.replace(/ \d+e$/, ""))).size

  return (
    <>
      <section className="bg-court relative overflow-hidden bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div className="flex flex-col justify-center gap-6">
            <Badge className="w-fit rounded-full bg-lime px-3 py-1 text-navy hover:bg-lime">Faire du sport · au pied de chez soi</Badge>
            <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl">
              Un but cassé&nbsp;?
              <br />
              <span className="text-lime">Signalez-le</span> en 1&nbsp;minute.
            </h1>
            <p className="max-w-lg text-lg text-white/80">
              Buts, paniers, agrès, éclairage… Dites-nous ce qui ne va pas sur votre terrain. La direction s&apos;en occupe et
              vous suivez la réparation étape par étape.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-lime px-6 text-base font-bold text-navy hover:bg-lime-strong">
                <Link href="/signaler">
                  Signaler un incident <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/30 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white">
                <a href="#suivre">
                  <Search /> Suivre mon signalement
                </a>
              </Button>
            </div>
          </div>

          <Card className="gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-2xl shadow-black/30">
            <div className="h-[340px]">
              <PublicMap points={toPoints(db)} />
            </div>
            <CardContent className="grid grid-cols-3 divide-x bg-white p-0 text-navy">
              {[
                { v: db.terrains.length, l: "terrains suivis" },
                { v: cities, l: "villes" },
                { v: resolved, l: "réparations" },
              ].map((s) => (
                <div key={s.l} className="px-4 py-4 text-center">
                  <div className="font-display text-3xl text-primary">{s.v}</div>
                  <div className="text-xs font-medium text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Comment ça marche</p>
          <h2 className="font-display mt-2 text-4xl text-navy">Trois étapes, zéro paperasse</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Camera, t: "Je signale", d: "Choisissez le terrain, décrivez le problème, ajoutez une photo depuis votre téléphone.", c: "bg-brand-100 text-primary" },
            { icon: Wrench, t: "La direction agit", d: "L'incident arrive en direct sur le tableau de bord. Un prestataire est affecté avec une date.", c: "bg-lime/50 text-navy" },
            { icon: CheckCircle2, t: "Je suis la réparation", d: "Votre lien de suivi montre chaque étape jusqu'à la confirmation de la réparation.", c: "bg-emerald-100 text-emerald-700" },
          ].map((s, i) => (
            <Card key={s.t} className="rounded-3xl border-0 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`grid size-12 place-items-center rounded-2xl ${s.c}`}>
                    <s.icon className="size-6" />
                  </div>
                  <span className="font-display text-4xl text-brand-100">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-navy">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="suivre" className="mx-auto max-w-6xl scroll-mt-20 px-4">
        <Card className="rounded-3xl border-0 bg-brand-50 shadow-none">
          <CardContent className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div>
              <h2 className="font-display text-3xl text-navy">Suivre un signalement</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Entrez le numéro reçu après votre déclaration (ex.&nbsp;<span className="font-mono font-semibold">INC-1004</span>).
                {open > 0 && <> {open} incidents sont en cours de traitement en ce moment.</>}
              </p>
            </div>
            <TrackForm />
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Nos implantations</p>
            <h2 className="font-display mt-2 text-4xl text-navy">Partout en France</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.terrains.map((t) => (
            <div key={t.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-border">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="truncate font-semibold text-navy">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t.city} · {t.sports.join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
