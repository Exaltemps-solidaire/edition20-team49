"use client"

import { useEffect } from "react"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"

export interface MapPoint {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  open: number
  critical: number
  href?: string
  hrefLabel?: string
}

function pin(p: MapPoint, selected: boolean) {
  const color = p.critical > 0 ? "#e11d48" : p.open > 0 ? "#f59e0b" : "#6294c2"
  const size = selected ? 44 : 36
  const label = p.open > 0 ? String(p.open) : ""
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 6],
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" style="filter:drop-shadow(0 4px 6px rgb(31 51 70 / .35))">
        <path fill="${color}" stroke="white" stroke-width="1.5" d="M12 1.5c-4.4 0-8 3.4-8 7.8 0 5.6 6.6 12.2 7.4 13a.9.9 0 0 0 1.2 0c.8-.8 7.4-7.4 7.4-13 0-4.4-3.6-7.8-8-7.8z"/>
      </svg>
      <span style="position:absolute;top:${size * 0.2}px;left:0;width:100%;text-align:center;color:white;font:700 ${size * 0.32}px/1.2 Montserrat,sans-serif">${label || "●"}</span>
    </div>`,
  })
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 12 })
  }, [map, points])
  return null
}

function ClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))) })
  return null
}

export default function TerrainsMap({
  points,
  selectedId,
  onSelect,
  onPick,
  picked,
  fit = true,
}: {
  points: MapPoint[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  onPick?: (lat: number, lng: number) => void
  picked?: { lat: number; lng: number } | null
  fit?: boolean
}) {
  return (
    <MapContainer center={[46.6, 2.5]} zoom={6} scrollWheelZoom className="h-full w-full" style={{ minHeight: 280 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {fit && <FitBounds points={points} />}
      {onPick && <ClickPicker onPick={onPick} />}
      {points.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={pin(p, p.id === selectedId)}
          eventHandlers={{ click: () => onSelect?.(p.id) }}
        >
          <Popup>
            <div className="min-w-44 space-y-1">
              <div className="text-sm font-bold text-navy">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.city}</div>
              <div className="pt-1 text-xs">
                {p.open > 0 ? (
                  <span className="font-semibold text-amber-700">
                    {p.open} incident{p.open > 1 ? "s" : ""} ouvert{p.open > 1 ? "s" : ""}
                    {p.critical > 0 && <span className="text-rose-600"> · {p.critical} urgent{p.critical > 1 ? "s" : ""}</span>}
                  </span>
                ) : (
                  <span className="font-semibold text-emerald-700">Aucun incident ouvert</span>
                )}
              </div>
              {p.href && (
                <a href={p.href} className="mt-1 inline-block text-xs font-semibold !text-primary underline">
                  {p.hrefLabel ?? "Voir"}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      {picked && (
        <Marker
          position={[picked.lat, picked.lng]}
          icon={pin({ id: "new", name: "", city: "", lat: 0, lng: 0, open: 0, critical: 0 }, true)}
        />
      )}
    </MapContainer>
  )
}
