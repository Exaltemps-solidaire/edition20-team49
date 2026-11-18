"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { EQUIPMENT_ICONS } from "@/lib/icons"
import {
  Camera,
  Loader2,
  MapPin,
  Send,
  X,
} from "lucide-react"
import { declareIncident } from "@/lib/actions"
import { EQUIPMENTS, ROLES, URGENCY } from "@/lib/meta"
import type { Equipment, Incident, Terrain } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"


async function compress(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new window.Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.8)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function DeclareForm({ terrains, initialTerrain }: { terrains: Terrain[]; initialTerrain?: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const [terrainId, setTerrainId] = useState(terrains.some((t) => t.id === initialTerrain) ? initialTerrain! : "")
  const [equipment, setEquipment] = useState<Equipment | "">("")
  const [urgency, setUrgency] = useState(3)
  const [photo, setPhoto] = useState<string | null>(null)
  const [role, setRole] = useState<Incident["reporterRole"]>("rst")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const byRegion = useMemo(() => {
    const m = new Map<string, Terrain[]>()
    for (const t of [...terrains].sort((a, b) => a.city.localeCompare(b.city))) {
      m.set(t.region || "Autres", [...(m.get(t.region || "Autres") ?? []), t])
    }
    return [...m.entries()]
  }, [terrains])

  const terrain = terrains.find((t) => t.id === terrainId)

  async function onFile(f?: File) {
    if (!f) return
    if (!f.type.startsWith("image/")) return toast.error("Choisissez une image.")
    try {
      setPhoto(await compress(f))
    } catch {
      toast.error("Impossible de lire cette image.")
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const errs: Record<string, string> = {}
    const title = String(f.get("title") ?? "").trim()
    const description = String(f.get("description") ?? "").trim()
    if (title.length < 4) errs.title = "Un titre court, par exemple « Filet du but arraché »."
    if (!terrainId) errs.terrain = "Choisissez le terrain concerné."
    if (!equipment) errs.equipment = "Quel équipement est touché ?"
    if (description.length < 10) errs.description = "Quelques mots de plus pour aider la réparation."
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error("Il manque quelques informations.")
      return
    }
    start(async () => {
      const res = await declareIncident({
        title,
        description,
        terrainId,
        equipment: equipment as Equipment,
        urgency,
        photo,
        reporterName: String(f.get("name") ?? ""),
        reporterContact: String(f.get("contact") ?? ""),
        reporterRole: role,
      })
      if (!res.ok) { toast.error(res.error); return }
      router.push(`/merci/${res.data!.id}`)
    })
  }

  const u = URGENCY[urgency]

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* 1. Where */}
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-border">
        <CardContent className="space-y-5">
          <StepTitle n={1} title="Où ?" sub="Le terrain où se trouve l'équipement" />
          <div className="space-y-2">
            <Label htmlFor="terrain">Terrain *</Label>
            <Select value={terrainId} onValueChange={setTerrainId}>
              <SelectTrigger id="terrain" className="h-12 w-full rounded-xl" aria-invalid={!!errors.terrain}>
                <SelectValue placeholder="Choisir un terrain…" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {byRegion.map(([region, list]) => (
                  <SelectGroup key={region}>
                    <SelectLabel>{region}</SelectLabel>
                    {list.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} <span className="text-muted-foreground">· {t.city}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={errors.terrain} />
            {terrain && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {terrain.address}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. What */}
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-border">
        <CardContent className="space-y-5">
          <StepTitle n={2} title="Quoi ?" sub="L'équipement et ce qui ne va pas" />
          <div className="space-y-2">
            <Label>Équipement *</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EQUIPMENTS.map((e) => {
                const Icon = EQUIPMENT_ICONS[e.id]
                const active = equipment === e.id
                return (
                  <button
                    type="button"
                    key={e.id}
                    onClick={() => setEquipment(e.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center text-xs font-semibold transition",
                      active ? "border-primary bg-brand-50 text-navy" : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className={cn("size-6", active ? "text-primary" : "")} />
                    {e.label}
                  </button>
                )
              })}
            </div>
            <FieldError msg={errors.equipment} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input id="title" name="title" placeholder="Ex. Filet du but côté nord arraché" className="h-12 rounded-xl" aria-invalid={!!errors.title} maxLength={80} />
            <FieldError msg={errors.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Que se passe-t-il ? Depuis quand ? Est-ce dangereux ?"
              className="rounded-xl"
              aria-invalid={!!errors.description}
              maxLength={1000}
            />
            <FieldError msg={errors.description} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Urgency + photo */}
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-border">
        <CardContent className="space-y-6">
          <StepTitle n={3} title="Gravité & photo" sub="Pour prioriser la réparation" />
          <div className="space-y-3">
            <Label>Niveau d&apos;urgence *</Label>
            <div className="grid grid-cols-5 gap-2" role="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={urgency === n}
                  onClick={() => setUrgency(n)}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center rounded-2xl border-2 text-lg font-bold transition",
                    urgency === n ? cn("border-transparent text-white", URGENCY[n].bar) : "border-border bg-white text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className={cn("flex items-center justify-between rounded-xl px-4 py-2.5 text-sm", u.chip)}>
              <span className="font-bold">{u.label}</span>
              <span>{u.hint}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo (recommandée)</Label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {photo ? (
              <div className="relative overflow-hidden rounded-2xl ring-1 ring-border">
                <Image src={photo} alt="Aperçu" width={800} height={500} unoptimized className="max-h-72 w-full object-cover" />
                <Button type="button" size="icon" variant="secondary" className="absolute top-3 right-3 rounded-full bg-white/90" onClick={() => setPhoto(null)} aria-label="Retirer la photo">
                  <X />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  onFile(e.dataTransfer.files?.[0])
                }}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-brand-50/60 px-4 py-8 text-sm text-muted-foreground transition hover:border-primary hover:bg-brand-50"
              >
                <span className="grid size-12 place-items-center rounded-full bg-white text-primary shadow-sm">
                  <Camera className="size-6" />
                </span>
                <span className="font-semibold text-navy">Prendre ou choisir une photo</span>
                <span className="text-xs">JPG ou PNG, compressée automatiquement</span>
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Who */}
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-border">
        <CardContent className="space-y-5">
          <StepTitle n={4} title="Vous" sub="Facultatif, pour vous recontacter si besoin" />
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  role === r.id ? "border-navy bg-navy text-white" : "bg-white text-muted-foreground hover:border-navy/40",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Prénom</Label>
              <Input id="name" name="name" placeholder="Karim" className="h-12 rounded-xl" maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Téléphone ou email</Label>
              <Input id="contact" name="contact" placeholder="06 12 34 56 78" className="h-12 rounded-xl" maxLength={80} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-3 z-10">
        <Button type="submit" disabled={pending} size="lg" className="h-14 w-full rounded-full bg-navy text-base font-bold shadow-xl shadow-navy/20 hover:bg-navy/90">
          {pending ? <Loader2 className="animate-spin" /> : <Send />}
          {pending ? "Envoi en cours…" : "Envoyer le signalement"}
        </Button>
      </div>
    </form>
  )
}

function StepTitle({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-display grid size-10 place-items-center rounded-xl bg-lime text-lg text-navy">{n}</span>
      <div>
        <div className="text-lg font-bold text-navy">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs font-medium text-destructive">{msg}</p> : null
}
