import { Check } from "lucide-react"
import { STATUSES, statusIndex } from "@/lib/meta"
import type { Incident } from "@/lib/types"
import { cn } from "@/lib/utils"

const fmt = (d: string) =>
  new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

const DESCRIPTIONS: Record<string, string> = {
  nouveau: "Votre signalement est bien arrivé.",
  pris_en_charge: "La direction a examiné l'incident.",
  affecte: "Un prestataire est chargé de la réparation.",
  en_reparation: "L'intervention est en cours sur le terrain.",
  resolu: "L'équipement est réparé et de nouveau utilisable.",
}

export function Stepper({ incident, providerName }: { incident: Incident; providerName?: string }) {
  const current = statusIndex(incident.status)
  return (
    <ol className="relative space-y-0">
      {STATUSES.map((s, i) => {
        const done = i < current || incident.status === "resolu"
        const active = i === current && incident.status !== "resolu"
        const entry = [...incident.history].reverse().find((h) => h.status === s.id)
        return (
          <li key={s.id} className="relative flex gap-4 pb-8 last:pb-0">
            {i < STATUSES.length - 1 && (
              <span className={cn("absolute top-10 left-[19px] h-[calc(100%-2.5rem)] w-0.5", i < current ? "bg-primary" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition",
                done && "border-primary bg-primary text-white",
                active && "border-primary bg-white text-primary ring-4 ring-primary/15",
                !done && !active && "border-border bg-white text-muted-foreground",
              )}
            >
              {done ? <Check className="size-5" /> : i + 1}
              {active && <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />}
            </span>
            <div className="pt-1.5">
              <div className={cn("font-bold", done || active ? "text-navy" : "text-muted-foreground")}>{s.short}</div>
              <div className="text-sm text-muted-foreground">
                {s.id === "affecte" && providerName && (done || active)
                  ? `${providerName}${incident.eta ? ` · intervention prévue le ${new Date(incident.eta).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : ""}`
                  : s.id === "resolu" && incident.resolutionNote && done
                    ? incident.resolutionNote
                    : DESCRIPTIONS[s.id]}
              </div>
              {entry && (done || active) && <div className="mt-0.5 text-xs text-muted-foreground/80">{fmt(entry.at)}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
