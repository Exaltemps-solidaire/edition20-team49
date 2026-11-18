"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react"
import { TerrainsMap, type MapPoint } from "@/components/map"
import type { Db } from "@/lib/types"
import { statusMeta } from "@/lib/meta"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AdminMap({ points, db }: { points: MapPoint[]; db: Db }) {
  const [selected, setSelected] = useState<string | null>(null)
  const sorted = [...points].sort((a, b) => b.critical - a.critical || b.open - a.open)
  const sel = db.terrains.find((t) => t.id === selected)
  const incidents = db.incidents.filter((i) => i.terrainId === selected)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">Carte des implantations</h1>
        <p className="text-sm text-muted-foreground">
          {points.length} terrains · <span className="font-semibold text-rose-600">rouge</span> = incident urgent,{" "}
          <span className="font-semibold text-amber-600">orange</span> = incident ouvert, <span className="font-semibold text-primary">bleu</span> = RAS.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="h-[70vh] min-h-[420px] overflow-hidden rounded-3xl border-0 p-0 shadow-sm ring-1 ring-border">
          <TerrainsMap points={points} selectedId={selected} onSelect={setSelected} />
        </Card>
        <Card className="h-[70vh] min-h-[420px] gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-sm ring-1 ring-border">
          {sel ? (
            <div className="flex h-full flex-col">
              <div className="bg-court bg-navy p-5 text-white">
                <button onClick={() => setSelected(null)} className="mb-2 text-xs text-white/70 hover:text-white">
                  ← Tous les terrains
                </button>
                <div className="text-lg font-bold">{sel.name}</div>
                <div className="text-xs text-white/70">{sel.address}</div>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2 p-4">
                  {incidents.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucun incident sur ce terrain.</p>}
                  {incidents.map((i) => {
                    const m = statusMeta(i.status)
                    return (
                      <Link key={i.id} href={`/admin?incident=${i.id}`} className="block rounded-2xl bg-muted/60 p-3 hover:bg-muted">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-muted-foreground">{i.code}</span>
                          <span className={cn("ml-auto rounded-full px-2 py-0.5 font-semibold ring-1", m.chip)}>{m.label}</span>
                        </div>
                        <div className="mt-1 text-sm font-semibold text-navy">{i.title}</div>
                      </Link>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-1 p-3">
                {sorted.map((p) => (
                  <button key={p.id} onClick={() => setSelected(p.id)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-muted/70">
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl",
                        p.critical ? "bg-rose-50 text-rose-600" : p.open ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-primary",
                      )}
                    >
                      {p.critical ? <AlertTriangle className="size-4" /> : p.open ? <MapPin className="size-4" /> : <CheckCircle2 className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">{p.city}</span>
                    </span>
                    {p.open > 0 && <span className="rounded-full bg-navy px-2 py-0.5 text-xs font-bold text-white">{p.open}</span>}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </div>
  )
}
