"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { formatDistanceToNowStrict } from "date-fns"
import { fr } from "date-fns/locale"
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Inbox, LayoutGrid, MapPin, Search, Timer, Wrench } from "lucide-react"
import { setStatus } from "@/lib/actions"
import { STATUSES, URGENCY, statusMeta } from "@/lib/meta"
import { EQUIPMENT_ICONS } from "@/lib/icons"
import type { Db, Incident, Status } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IncidentSheet } from "./incident-sheet"

type GroupBy = "status" | "terrain"

export function IncidentBoard({ db }: { db: Db }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, start] = useTransition()
  const [incidents, setIncidents] = useState(db.incidents)
  const [group, setGroup] = useState<GroupBy>("status")
  const [q, setQ] = useState("")
  const [city, setCity] = useState("all")
  const [minUrg, setMinUrg] = useState("1")
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)
  const openId = params.get("incident")

  useEffect(() => setIncidents(db.incidents), [db.incidents])

  const terrains = useMemo(() => Object.fromEntries(db.terrains.map((t) => [t.id, t])), [db.terrains])
  const providers = useMemo(() => Object.fromEntries(db.providers.map((p) => [p.id, p])), [db.providers])
  const cities = useMemo(() => [...new Set(db.terrains.map((t) => t.city))].sort(), [db.terrains])

  const filtered = incidents.filter((i) => {
    const t = terrains[i.terrainId]
    if (city !== "all" && t?.city !== city) return false
    if (i.urgency < Number(minUrg)) return false
    if (q) {
      const hay = `${i.code} ${i.title} ${i.description} ${t?.name} ${t?.city}`.toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  })

  const columns =
    group === "status"
      ? STATUSES.map((s) => ({ id: s.id as string, title: s.label, dot: s.dot, tint: s.column, items: filtered.filter((i) => i.status === s.id) }))
      : db.terrains
          .map((t) => ({
            id: t.id,
            title: t.name,
            sub: t.city,
            dot: "bg-primary",
            tint: "bg-brand-50/60",
            items: filtered.filter((i) => i.terrainId === t.id),
          }))
          .filter((c) => c.items.length)
          .sort((a, b) => b.items.filter((i) => i.status !== "resolu").length - a.items.filter((i) => i.status !== "resolu").length)

  const sortItems = (list: Incident[]) =>
    [...list].sort((a, b) => (a.status === "resolu" ? 0 : b.urgency - a.urgency) || b.createdAt.localeCompare(a.createdAt))

  function move(id: string, to: Status) {
    const inc = incidents.find((i) => i.id === id)
    if (!inc || inc.status === to) return
    if (to === "resolu") {
      openSheet(id)
      toast.info("Confirmez la résolution dans la fiche de l'incident.")
      return
    }
    const prev = incidents
    setIncidents((list) => list.map((i) => (i.id === id ? { ...i, status: to } : i)))
    start(async () => {
      const res = await setStatus(id, to)
      if (!res.ok) {
        setIncidents(prev)
        toast.error(res.error)
      } else {
        toast.success(`${inc.code} → ${statusMeta(to).label}`)
        router.refresh()
      }
    })
  }

  function openSheet(id: string | null) {
    const sp = new URLSearchParams(params.toString())
    if (id) sp.set("incident", id)
    else sp.delete("incident")
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false })
  }

  // KPIs
  const open = incidents.filter((i) => i.status !== "resolu")
  const resolved = incidents.filter((i) => i.status === "resolu" && i.resolvedAt)
  const avgDays = resolved.length
    ? resolved.reduce((s, i) => s + (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime()), 0) / resolved.length / 86_400_000
    : 0
  const kpis = [
    { label: "Nouveaux", value: incidents.filter((i) => i.status === "nouveau").length, icon: Inbox, tone: "bg-rose-50 text-rose-600" },
    { label: "En cours", value: open.length, icon: Wrench, tone: "bg-brand-50 text-primary" },
    { label: "Urgents (4-5)", value: open.filter((i) => i.urgency >= 4).length, icon: AlertTriangle, tone: "bg-orange-50 text-orange-600" },
    { label: "Résolus", value: resolved.length, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Délai moyen", value: `${avgDays.toFixed(1)} j`, icon: Timer, tone: "bg-lime/40 text-navy" },
  ]

  const selected = incidents.find((i) => i.id === openId) ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-navy">Incidents</h1>
          <p className="text-sm text-muted-foreground">Tous les signalements remontés du terrain, en temps réel.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-2xl border-0 py-4 shadow-sm ring-1 ring-border">
            <CardContent className="flex items-center gap-3 px-4">
              <span className={cn("grid size-11 place-items-center rounded-xl", k.tone)}>
                <k.icon className="size-5" />
              </span>
              <div>
                <div className="text-2xl font-extrabold text-navy">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-border">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un incident, un terrain…" className="h-10 rounded-xl border-0 bg-muted/60 pl-9 shadow-none" />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-10 w-44 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={minUrg} onValueChange={setMinUrg}>
          <SelectTrigger className="h-10 w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Toute urgence</SelectItem>
            <SelectItem value="3">Urgence ≥ 3</SelectItem>
            <SelectItem value="4">Urgence ≥ 4</SelectItem>
            <SelectItem value="5">Critique (5)</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={group} onValueChange={(v) => v && setGroup(v as GroupBy)} className="rounded-xl bg-muted/60 p-1">
          <ToggleGroupItem value="status" className="h-8 rounded-lg px-3 text-xs data-[state=on]:bg-white data-[state=on]:shadow-sm">
            <LayoutGrid /> Par statut
          </ToggleGroupItem>
          <ToggleGroupItem value="terrain" className="h-8 rounded-lg px-3 text-xs data-[state=on]:bg-white data-[state=on]:shadow-sm">
            <MapPin /> Par terrain
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex min-w-max gap-4">
          {columns.map((col) => (
            <section
              key={col.id}
              onDragOver={(e) => {
                if (group !== "status") return
                e.preventDefault()
                setOverCol(col.id)
              }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={(e) => {
                e.preventDefault()
                setOverCol(null)
                if (group === "status" && dragId) move(dragId, col.id as Status)
              }}
              className={cn(
                "flex w-[300px] shrink-0 flex-col rounded-3xl p-3 transition",
                col.tint,
                overCol === col.id && "ring-2 ring-primary ring-offset-2",
              )}
            >
              <header className="mb-3 flex items-center gap-2 px-1">
                <span className={cn("size-2.5 rounded-full", col.dot)} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold text-navy">{col.title}</h2>
                  {"sub" in col && <p className="text-[11px] text-muted-foreground">{col.sub as string}</p>}
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-navy shadow-sm">{col.items.length}</span>
              </header>
              <div className="flex min-h-24 flex-1 flex-col gap-2.5">
                {sortItems(col.items).map((i) => (
                  <IncidentCard
                    key={i.id}
                    incident={i}
                    terrainName={group === "status" ? terrains[i.terrainId]?.name : undefined}
                    providerName={i.providerId ? providers[i.providerId]?.name : undefined}
                    showStatus={group === "terrain"}
                    draggable={group === "status"}
                    dragging={dragId === i.id}
                    onDragStart={() => setDragId(i.id)}
                    onDragEnd={() => setDragId(null)}
                    onOpen={() => openSheet(i.id)}
                  />
                ))}
                {!col.items.length && (
                  <div className="grid flex-1 place-items-center rounded-2xl border-2 border-dashed border-navy/10 py-8 text-xs text-muted-foreground">
                    Aucun incident
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <IncidentSheet
        incident={selected}
        terrain={selected ? terrains[selected.terrainId] : undefined}
        providers={db.providers}
        onClose={() => openSheet(null)}
        onChanged={() => router.refresh()}
      />
    </div>
  )
}

function IncidentCard({
  incident: i,
  terrainName,
  providerName,
  showStatus,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
  onOpen,
}: {
  incident: Incident
  terrainName?: string
  providerName?: string
  showStatus?: boolean
  draggable: boolean
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onOpen: () => void
}) {
  const Icon = EQUIPMENT_ICONS[i.equipment]
  const u = URGENCY[i.urgency]
  const meta = statusMeta(i.status)
  const late = i.eta && i.status !== "resolu" && new Date(i.eta) < new Date(new Date().toDateString())
  return (
    <article
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      tabIndex={0}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        draggable && "active:cursor-grabbing",
        dragging && "rotate-2 opacity-50",
        i.status === "resolu" && "opacity-80",
      )}
    >
      {i.photo && <Image src={i.photo} alt="" width={300} height={120} unoptimized className="h-28 w-full object-cover" />}
      <div className="space-y-2.5 p-3.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-muted-foreground">{i.code}</span>
          {showStatus && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", meta.chip)}>{meta.label}</span>
          )}
          <span className={cn("ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", u.chip)}>
            {i.urgency >= 4 && <AlertTriangle className="size-3" />}
            {i.urgency}/5
          </span>
        </div>
        <h3 className="flex gap-2 text-sm leading-snug font-bold text-navy">
          <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
          {i.title}
        </h3>
        {terrainName && (
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" /> {terrainName}
          </p>
        )}
        {(providerName || i.eta) && i.status !== "resolu" && (
          <div className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium", late ? "bg-rose-50 text-rose-700" : "bg-muted text-navy")}>
            <CalendarClock className="size-3.5 shrink-0" />
            <span className="truncate">
              {providerName ?? "Prestataire"}
              {i.eta && ` · ${new Date(i.eta).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
              {late && " · en retard"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {i.status === "resolu" && i.resolvedAt
            ? `Résolu il y a ${formatDistanceToNowStrict(new Date(i.resolvedAt), { locale: fr })}`
            : `Signalé il y a ${formatDistanceToNowStrict(new Date(i.createdAt), { locale: fr })}`}
          {i.reporterName && <span className="ml-auto truncate">par {i.reporterName}</span>}
        </div>
      </div>
    </article>
  )
}
