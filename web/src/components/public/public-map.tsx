"use client"

import { TerrainsMap, type MapPoint } from "@/components/map"

export function PublicMap({ points }: { points: MapPoint[] }) {
  return <TerrainsMap points={points.map((p) => ({ ...p, href: `/signaler?terrain=${p.id}`, hrefLabel: "Signaler un incident ici →" }))} />
}
