import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarClock, MapPin, RefreshCw } from "lucide-react"
import { readDb } from "@/lib/db"
import { equipmentLabel, statusMeta, URGENCY } from "@/lib/meta"
import { EQUIPMENT_ICONS } from "@/lib/icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stepper } from "@/components/stepper"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function SuiviPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await readDb()
  const incident = db.incidents.find((i) => i.id === id.toLowerCase())
  if (!incident) notFound()
  const terrain = db.terrains.find((t) => t.id === incident.terrainId)
  const provider = db.providers.find((p) => p.id === incident.providerId)
  const meta = statusMeta(incident.status)
  const Icon = EQUIPMENT_ICONS[incident.equipment]

  return (
    <div className="bg-court">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Suivi de réparation · {incident.code}</p>
            <h1 className="font-display mt-1 text-4xl text-navy">{incident.title}</h1>
          </div>
          <span className={cn("inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1", meta.chip)}>
            <span className={cn("size-2 rounded-full", meta.dot)} /> {meta.label}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-border">
            <CardContent>
              <Stepper incident={incident} providerName={provider?.name} />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-sm ring-1 ring-border">
              {incident.photo ? (
                <Image src={incident.photo} alt="Photo de l'incident" width={600} height={360} unoptimized className="h-48 w-full object-cover" />
              ) : (
                <div className="grid h-36 place-items-center bg-brand-50">
                  <Icon className="size-12 text-primary/60" />
                </div>
              )}
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <Icon className="size-4 text-primary" /> {equipmentLabel(incident.equipment)}
                  <span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-xs", URGENCY[incident.urgency].chip)}>
                    Urgence {incident.urgency}/5
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{incident.description}</p>
                {terrain && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="font-semibold text-navy">{terrain.name}</span>
                      <br />
                      <span className="text-muted-foreground">{terrain.address}</span>
                    </span>
                  </div>
                )}
                {incident.eta && incident.status !== "resolu" && (
                  <div className="flex items-center gap-2 rounded-xl bg-lime/40 px-3 py-2 text-sm font-semibold text-navy">
                    <CalendarClock className="size-4" /> Réparation prévue le{" "}
                    {new Date(incident.eta).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 rounded-full">
                <Link href={`/suivi/${incident.id}`}>
                  <RefreshCw /> Actualiser
                </Link>
              </Button>
              <Button asChild className="flex-1 rounded-full bg-navy hover:bg-navy/90">
                <Link href="/signaler">Nouveau signalement</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
