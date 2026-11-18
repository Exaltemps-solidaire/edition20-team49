export type Status = "nouveau" | "pris_en_charge" | "affecte" | "en_reparation" | "resolu"

export type Equipment =
  | "but"
  | "panier"
  | "agres"
  | "filet"
  | "eclairage"
  | "revetement"
  | "cloture"
  | "autre"

export interface Terrain {
  id: string
  name: string
  city: string
  region: string
  address: string
  lat: number
  lng: number
  sports: string[]
  createdAt: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  phone: string
}

export interface HistoryEntry {
  at: string
  status: Status
  note?: string
  by: string
}

export interface Incident {
  id: string
  code: string
  title: string
  terrainId: string
  equipment: Equipment
  description: string
  urgency: 1 | 2 | 3 | 4 | 5
  photo?: string | null
  reporterName?: string
  reporterRole?: "rst" | "usager" | "educateur" | "autre"
  reporterContact?: string
  status: Status
  providerId?: string | null
  eta?: string | null
  resolutionNote?: string | null
  resolvedAt?: string | null
  createdAt: string
  updatedAt: string
  history: HistoryEntry[]
}

export interface Db {
  terrains: Terrain[]
  providers: Provider[]
  incidents: Incident[]
  seq: number
}
