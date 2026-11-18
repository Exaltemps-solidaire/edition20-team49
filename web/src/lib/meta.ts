import type { Equipment, Status } from "./types"

export const STATUSES: { id: Status; label: string; short: string; dot: string; chip: string; column: string }[] = [
  { id: "nouveau", label: "Nouveau", short: "Signalé", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 ring-rose-200", column: "bg-rose-50/60" },
  { id: "pris_en_charge", label: "Pris en charge", short: "Pris en charge", dot: "bg-primary", chip: "bg-brand-50 text-brand-700 ring-brand-100", column: "bg-brand-50/70" },
  { id: "affecte", label: "Prestataire affecté", short: "Prestataire affecté", dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700 ring-violet-200", column: "bg-violet-50/60" },
  { id: "en_reparation", label: "En réparation", short: "En réparation", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-800 ring-amber-200", column: "bg-amber-50/60" },
  { id: "resolu", label: "Résolu", short: "Résolu", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", column: "bg-emerald-50/60" },
]

export const statusMeta = (s: Status) => STATUSES.find((x) => x.id === s)!
export const statusIndex = (s: Status) => STATUSES.findIndex((x) => x.id === s)

export const EQUIPMENTS: { id: Equipment; label: string }[] = [
  { id: "but", label: "But de football" },
  { id: "panier", label: "Panier de basket" },
  { id: "agres", label: "Agrès / street workout" },
  { id: "filet", label: "Filet / pare-ballons" },
  { id: "eclairage", label: "Éclairage" },
  { id: "revetement", label: "Sol / revêtement" },
  { id: "cloture", label: "Clôture / portail" },
  { id: "autre", label: "Autre" },
]
export const equipmentLabel = (e: Equipment) => EQUIPMENTS.find((x) => x.id === e)?.label ?? e

export const URGENCY: Record<number, { label: string; hint: string; chip: string; bar: string }> = {
  1: { label: "Très faible", hint: "Gêne esthétique, aucun risque", chip: "bg-slate-100 text-slate-700", bar: "bg-slate-400" },
  2: { label: "Faible", hint: "Usage possible, à surveiller", chip: "bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  3: { label: "Moyenne", hint: "Usage dégradé", chip: "bg-amber-50 text-amber-800", bar: "bg-amber-500" },
  4: { label: "Élevée", hint: "Équipement inutilisable", chip: "bg-orange-50 text-orange-700", bar: "bg-orange-500" },
  5: { label: "Critique", hint: "Danger pour les jeunes", chip: "bg-rose-50 text-rose-700", bar: "bg-rose-600" },
}

export const ROLES = [
  { id: "rst", label: "Responsable de site (RST)" },
  { id: "educateur", label: "Éducateur·rice" },
  { id: "usager", label: "Usager·ère / jeune" },
  { id: "autre", label: "Autre" },
] as const
