import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { ArrowRight, PartyPopper } from "lucide-react"
import { readDb } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CopyLink } from "@/components/public/copy-link"

export const dynamic = "force-dynamic"

export default async function MerciPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await readDb()
  const incident = db.incidents.find((i) => i.id === id)
  if (!incident) notFound()
  const terrain = db.terrains.find((t) => t.id === incident.terrainId)
  const h = await headers()
  const origin = process.env.PUBLIC_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`
  const link = `${origin}/suivi/${incident.id}`

  return (
    <div className="bg-court">
      <div className="mx-auto max-w-xl px-4 py-14 text-center">
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-lime text-navy shadow-lg shadow-lime/40">
          <PartyPopper className="size-9" />
        </div>
        <h1 className="font-display text-5xl text-navy">Merci&nbsp;!</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Votre signalement <span className="font-semibold text-navy">« {incident.title} »</span> sur {terrain?.name} a bien été transmis à la direction.
        </p>

        <Card className="mt-8 rounded-3xl border-0 text-left shadow-sm ring-1 ring-border">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Numéro de suivi</span>
              <span className="rounded-full bg-navy px-3 py-1 font-mono text-sm font-bold text-lime">{incident.code}</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-navy">Votre lien de suivi</div>
              <CopyLink link={link} />
              <p className="text-xs text-muted-foreground">Gardez ce lien : il montre chaque étape jusqu&apos;à la réparation.</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-full bg-navy hover:bg-navy/90">
            <Link href={`/suivi/${incident.id}`}>
              Suivre la réparation <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full">
            <Link href="/signaler">Signaler autre chose</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
