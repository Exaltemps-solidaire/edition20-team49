"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, MapPin, Plus, Search } from "lucide-react"
import { createTerrain } from "@/lib/actions"
import type { Db } from "@/lib/types"
import { TerrainsMap, type MapPoint } from "@/components/map"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Île-de-France",
  "Hauts-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Grand Est",
  "Pays de la Loire",
  "Occitanie",
  "Nouvelle-Aquitaine",
  "Bretagne",
  "Normandie",
]

export function TerrainsManager({ db, points }: { db: Db; points: MapPoint[] }) {
  const [q, setQ] = useState("")
  const byId = Object.fromEntries(points.map((p) => [p.id, p]))
  const list = db.terrains.filter((t) => `${t.name} ${t.city} ${t.region}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-navy">Terrains</h1>
          <p className="text-sm text-muted-foreground">{db.terrains.length} implantations proposées dans le formulaire public.</p>
        </div>
        <NewTerrainDialog points={points} />
      </div>

      <Card className="gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-sm ring-1 ring-border">
        <div className="border-b p-3">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un terrain…" className="h-10 rounded-xl border-0 bg-muted/60 pl-9 shadow-none" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Terrain</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead className="hidden md:table-cell">Sports</TableHead>
              <TableHead className="pr-5 text-right">Incidents ouverts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((t) => {
              const p = byId[t.id]
              return (
                <TableRow key={t.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-primary">
                        <MapPin className="size-4" />
                      </span>
                      <div>
                        <div className="font-semibold text-navy">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.address}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{t.city}</div>
                    <div className="text-xs text-muted-foreground">{t.region}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {t.sports.map((s) => (
                        <Badge key={s} variant="secondary" className="rounded-full bg-muted text-navy">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {p?.open ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.critical ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>
                        {p.open} ouvert{p.open > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">RAS</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function NewTerrainDialog({ points }: { points: MapPoint[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null)
  const [region, setRegion] = useState(REGIONS[0])

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    start(async () => {
      const res = await createTerrain({
        name: String(f.get("name") ?? ""),
        city: String(f.get("city") ?? ""),
        address: String(f.get("address") ?? ""),
        region,
        sports: String(f.get("sports") ?? ""),
        lat: picked?.lat ?? NaN,
        lng: picked?.lng ?? NaN,
      })
      if (!res.ok) { toast.error(res.error); return }
      toast.success("Terrain ajouté — il apparaît déjà dans le formulaire public.")
      setOpen(false)
      setPicked(null)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-navy hover:bg-navy/90">
          <Plus /> Ajouter un terrain
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-navy">Nouveau terrain</DialogTitle>
          <DialogDescription>Cliquez sur la carte pour placer le terrain, puis complétez les informations.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
          <div className="h-72 overflow-hidden rounded-2xl ring-1 ring-border md:h-full md:min-h-80">
            <TerrainsMap points={points} onPick={(lat, lng) => setPicked({ lat, lng })} picked={picked} />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Nom du terrain *</Label>
              <Input id="t-name" name="name" required placeholder="City stade des Minguettes" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="t-city">Ville *</Label>
                <Input id="t-city" name="city" required placeholder="Vénissieux" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-region">Région</Label>
                <select
                  id="t-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-xs"
                >
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-address">Adresse</Label>
              <Input id="t-address" name="address" placeholder="Rue …, 69200 Vénissieux" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-sports">Sports (séparés par des virgules)</Label>
              <Input id="t-sports" name="sports" defaultValue="Football, Basket" className="rounded-xl" />
            </div>
            <div className="rounded-xl bg-muted/70 p-3 text-xs">
              {picked ? (
                <span className="font-semibold text-navy">
                  📍 {picked.lat}, {picked.lng}
                </span>
              ) : (
                <span className="text-muted-foreground">Aucune position : cliquez sur la carte.</span>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending} className="w-full rounded-xl">
                {pending ? <Loader2 className="animate-spin" /> : <Plus />} Ajouter le terrain
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
