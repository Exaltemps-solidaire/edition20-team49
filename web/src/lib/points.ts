import type { Db } from "./types"
import type { MapPoint } from "@/components/map/terrains-map"

export function toPoints(db: Db, href?: (id: string) => string, hrefLabel?: string): MapPoint[] {
  return db.terrains.map((t) => {
    const open = db.incidents.filter((i) => i.terrainId === t.id && i.status !== "resolu")
    return {
      id: t.id,
      name: t.name,
      city: t.city,
      lat: t.lat,
      lng: t.lng,
      open: open.length,
      critical: open.filter((i) => i.urgency >= 4).length,
      href: href?.(t.id),
      hrefLabel,
    }
  })
}
