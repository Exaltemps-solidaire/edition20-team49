"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { CalendarClock, CheckCircle2, ExternalLink, Loader2, MapPin, MessageSquarePlus, Phone, User, Wrench } from "lucide-react"
import { addNote, assignProvider, setStatus } from "@/lib/actions"
import { STATUSES, URGENCY, equipmentLabel, statusIndex, statusMeta, ROLES } from "@/lib/meta"
import { EQUIPMENT_ICONS } from "@/lib/icons"
import type { Incident, Provider, Status, Terrain } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const fmt = (d: string) => new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
const today = () => new Date().toISOString().slice(0, 10)

export function IncidentSheet({
  incident,
  terrain,
  providers,
  onClose,
  onChanged,
}: {
  incident: Incident | null
  terrain?: Terrain
  providers: Provider[]
  onClose: () => void
  onChanged: () => void
}) {
  const [pending, start] = useTransition()
  const [providerId, setProviderId] = useState("")
  const [eta, setEta] = useState("")
  const [note, setNote] = useState("")
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolution, setResolution] = useState("")

  useEffect(() => {
    setProviderId(incident?.providerId ?? "")
    setEta(incident?.eta ?? "")
    setNote("")
    setResolution("")
  }, [incident?.id, incident?.providerId, incident?.eta])

  if (!incident) return <Sheet open={false} />

  const i = incident
  const Icon = EQUIPMENT_ICONS[i.equipment]
  const meta = statusMeta(i.status)
  const provider = providers.find((p) => p.id === i.providerId)
  const role = ROLES.find((r) => r.id === i.reporterRole)?.label

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string, after?: () => void) =>
    start(async () => {
      const res = await fn()
      if (!res.ok) { toast.error(res.error ?? "Erreur"); return }
      toast.success(success)
      after?.()
      onChanged()
    })

  const changeStatus = (s: Status) => {
    if (s === "resolu") return setResolveOpen(true)
    run(() => setStatus(i.id, s), `Statut : ${statusMeta(s).label}`)
  }

  const next = STATUSES[statusIndex(i.status) + 1]

  return (
    <>
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
          {i.photo ? (
            <Image src={i.photo} alt="Photo de l'incident" width={640} height={300} unoptimized className="h-56 w-full object-cover" />
          ) : (
            <div className="bg-court grid h-32 place-items-center bg-navy">
              <Icon className="size-12 text-white/70" />
            </div>
          )}
          <SheetHeader className="gap-3 px-6 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-navy px-2.5 py-0.5 font-mono text-xs font-bold text-lime">{i.code}</span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", meta.chip)}>
                <span className={cn("size-1.5 rounded-full", meta.dot)} /> {meta.label}
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", URGENCY[i.urgency].chip)}>
                Urgence {i.urgency}/5 · {URGENCY[i.urgency].label}
              </span>
            </div>
            <SheetTitle className="text-2xl font-extrabold text-navy">{i.title}</SheetTitle>
            <SheetDescription className="text-sm">{i.description}</SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 px-6 pt-4 text-sm">
            <Info icon={MapPin} label="Terrain" value={terrain ? `${terrain.name}` : "—"} sub={terrain?.city} />
            <Info icon={Icon} label="Équipement" value={equipmentLabel(i.equipment)} />
            <Info icon={User} label="Déclarant" value={i.reporterName || "Anonyme"} sub={role} />
            <Info icon={Phone} label="Contact" value={i.reporterContact || "—"} />
          </div>

          <div className="px-6 pt-5">
            <div className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Avancement</div>
            <div className="flex gap-1.5">
              {STATUSES.map((s, idx) => (
                <button
                  key={s.id}
                  disabled={pending}
                  onClick={() => changeStatus(s.id)}
                  title={s.label}
                  className={cn(
                    "h-2 flex-1 rounded-full transition hover:opacity-80",
                    idx <= statusIndex(i.status) ? s.dot : "bg-muted",
                  )}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {next && (
                <Button disabled={pending} onClick={() => changeStatus(next.id)} className={cn("rounded-full", next.id === "resolu" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-navy hover:bg-navy/90")}>
                  {pending ? <Loader2 className="animate-spin" /> : next.id === "resolu" ? <CheckCircle2 /> : <Wrench />}
                  {next.id === "resolu" ? "Confirmer la résolution" : `Passer à « ${next.label} »`}
                </Button>
              )}
              <Select value={i.status} onValueChange={(v) => changeStatus(v as Status)}>
                <SelectTrigger className="w-48 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild variant="ghost" className="rounded-full">
                <Link href={`/suivi/${i.id}`} target="_blank">
                  <ExternalLink /> Page de suivi
                </Link>
              </Button>
            </div>
          </div>

          <Separator className="my-5" />

          <Tabs defaultValue="assign" className="px-6 pb-8">
            <TabsList className="w-full rounded-xl">
              <TabsTrigger value="assign" className="rounded-lg">Prestataire</TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg">Historique ({i.history.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="assign" className="space-y-4 pt-3">
              {provider && (
                <div className="flex items-center gap-3 rounded-2xl bg-violet-50 p-3 text-sm">
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-violet-600">
                    <Wrench className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-navy">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {provider.specialty} · {provider.phone}
                    </div>
                  </div>
                  {i.eta && (
                    <div className="text-right text-xs">
                      <div className="text-muted-foreground">ETA</div>
                      <div className="font-bold text-navy">{new Date(i.eta).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
                <div className="space-y-1.5">
                  <Label>Prestataire</Label>
                  <Select value={providerId} onValueChange={setProviderId}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Choisir…" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} <span className="text-muted-foreground">· {p.specialty}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="eta">Date estimée</Label>
                  <Input id="eta" type="date" min={today()} value={eta} onChange={(e) => setEta(e.target.value)} className="h-11 rounded-xl" />
                </div>
              </div>
              <Button
                disabled={pending || !providerId || !eta}
                onClick={() => run(() => assignProvider(i.id, providerId, eta), provider ? "Affectation mise à jour" : "Prestataire affecté")}
                className="w-full rounded-xl"
              >
                <CalendarClock /> {provider ? "Mettre à jour l'affectation" : "Affecter et planifier"}
              </Button>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pt-3">
              <div className="flex gap-2">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note interne…" className="h-10 rounded-xl" />
                <Button disabled={pending || !note.trim()} variant="secondary" onClick={() => run(() => addNote(i.id, note), "Note ajoutée", () => setNote(""))} className="rounded-xl">
                  <MessageSquarePlus />
                </Button>
              </div>
              <ol className="relative space-y-4 border-l-2 border-border pl-5">
                {[...i.history].reverse().map((h, idx) => {
                  const m = statusMeta(h.status)
                  return (
                    <li key={idx} className="relative">
                      <span className={cn("absolute top-1 -left-[27px] size-3 rounded-full ring-4 ring-white", m.dot)} />
                      <div className="text-xs text-muted-foreground">
                        {fmt(h.at)} · <span className="font-semibold text-navy">{h.by}</span>
                      </div>
                      <div className="text-sm">{h.note ?? m.label}</div>
                    </li>
                  )
                })}
              </ol>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy">
              <CheckCircle2 className="text-emerald-600" /> Confirmer la résolution
            </DialogTitle>
            <DialogDescription>
              Le déclarant verra l&apos;incident comme résolu sur sa page de suivi. Décrivez brièvement l&apos;intervention.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} placeholder="Ex. Filet remplacé et fixé, terrain de nouveau utilisable." className="rounded-xl" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResolveOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={pending}
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => run(() => setStatus(i.id, "resolu", resolution), "Réparation confirmée 🎉", () => setResolveOpen(false))}
            >
              {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Info({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-muted/60 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="truncate font-semibold text-navy">{value}</div>
        {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}
