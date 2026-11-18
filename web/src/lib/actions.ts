"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { mutateDb, resetDb } from "./db"
import { SESSION_COOKIE, checkCredentials, encodeSession, getSession } from "./auth"
import type { Equipment, Incident, Status, Terrain } from "./types"
import { EQUIPMENTS, statusMeta } from "./meta"

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

/* ---------- Public ---------- */

export interface DeclareInput {
  title: string
  terrainId: string
  equipment: Equipment
  description: string
  urgency: number
  photo?: string | null
  reporterName?: string
  reporterRole?: Incident["reporterRole"]
  reporterContact?: string
}

export async function declareIncident(input: DeclareInput): Promise<Result<{ id: string; code: string }>> {
  const title = input.title?.trim()
  const description = input.description?.trim()
  if (!title || title.length < 4) return { ok: false, error: "Donnez un titre d'au moins 4 caractères." }
  if (!description || description.length < 10) return { ok: false, error: "Décrivez le problème en quelques mots (10 caractères minimum)." }
  if (!EQUIPMENTS.some((e) => e.id === input.equipment)) return { ok: false, error: "Choisissez un type d'équipement." }
  const urgency = Math.min(5, Math.max(1, Math.round(Number(input.urgency) || 3))) as Incident["urgency"]
  if (input.photo && (!input.photo.startsWith("data:image/") || input.photo.length > 3_000_000))
    return { ok: false, error: "La photo n'est pas valide ou trop lourde." }

  const created = await mutateDb((db) => {
    if (!db.terrains.some((t) => t.id === input.terrainId)) return null
    db.seq += 1
    const now = new Date().toISOString()
    const id = `inc-${db.seq}`
    const incident: Incident = {
      id,
      code: `INC-${db.seq}`,
      title,
      terrainId: input.terrainId,
      equipment: input.equipment,
      description,
      urgency,
      photo: input.photo ?? null,
      reporterName: input.reporterName?.trim() || undefined,
      reporterRole: input.reporterRole,
      reporterContact: input.reporterContact?.trim() || undefined,
      status: "nouveau",
      createdAt: now,
      updatedAt: now,
      history: [{ at: now, status: "nouveau", by: input.reporterName?.trim() || "Déclarant", note: "Incident déclaré depuis le formulaire public." }],
    }
    db.incidents.unshift(incident)
    return { id, code: incident.code }
  })
  if (!created) return { ok: false, error: "Ce terrain n'existe pas." }
  revalidatePath("/admin")
  return { ok: true, data: created }
}

/* ---------- Auth ---------- */

export async function login(_: unknown, form: FormData): Promise<{ error?: string }> {
  const email = String(form.get("email") ?? "")
  const password = String(form.get("password") ?? "")
  const acc = checkCredentials(email, password)
  if (!acc) return { error: "Email ou mot de passe incorrect." }
  ;(await cookies()).set(SESSION_COOKIE, encodeSession({ email: acc.email, name: acc.name, role: acc.role }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIE !== "1",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
  const next = String(form.get("next") ?? "/admin")
  redirect(next.startsWith("/admin") ? next : "/admin")
}

export async function logout() {
  ;(await cookies()).delete(SESSION_COOKIE)
  redirect("/admin/login")
}

async function requireAdmin() {
  const s = await getSession()
  if (!s) throw new Error("Non autorisé")
  return s
}

/* ---------- Admin: incidents ---------- */

export async function setStatus(id: string, status: Status, note?: string): Promise<Result> {
  const s = await requireAdmin()
  const ok = await mutateDb((db) => {
    const i = db.incidents.find((x) => x.id === id)
    if (!i || i.status === status) return !!i
    const now = new Date().toISOString()
    i.status = status
    i.updatedAt = now
    if (status === "resolu") {
      i.resolvedAt = now
      i.resolutionNote = note?.trim() || i.resolutionNote || "Réparation confirmée."
    } else {
      i.resolvedAt = null
    }
    i.history.push({ at: now, status, by: s.name, note: note?.trim() || `Statut passé à « ${statusMeta(status).label} ».` })
    return true
  })
  if (!ok) return { ok: false, error: "Incident introuvable." }
  revalidatePath("/admin")
  revalidatePath(`/suivi/${id}`)
  return { ok: true }
}

export async function assignProvider(id: string, providerId: string, eta: string, note?: string): Promise<Result> {
  const s = await requireAdmin()
  if (!providerId) return { ok: false, error: "Choisissez un prestataire." }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eta)) return { ok: false, error: "Indiquez une date d'intervention estimée." }
  const ok = await mutateDb((db) => {
    const i = db.incidents.find((x) => x.id === id)
    const p = db.providers.find((x) => x.id === providerId)
    if (!i || !p) return false
    const now = new Date().toISOString()
    i.providerId = providerId
    i.eta = eta
    i.updatedAt = now
    const move = i.status === "nouveau" || i.status === "pris_en_charge"
    if (move) i.status = "affecte"
    i.history.push({
      at: now,
      status: i.status,
      by: s.name,
      note: note?.trim() || `${p.name} affecté, intervention prévue le ${new Date(eta).toLocaleDateString("fr-FR")}.`,
    })
    return true
  })
  if (!ok) return { ok: false, error: "Incident ou prestataire introuvable." }
  revalidatePath("/admin")
  revalidatePath(`/suivi/${id}`)
  return { ok: true }
}

export async function addNote(id: string, note: string): Promise<Result> {
  const s = await requireAdmin()
  if (!note.trim()) return { ok: false, error: "La note est vide." }
  await mutateDb((db) => {
    const i = db.incidents.find((x) => x.id === id)
    if (!i) return
    const now = new Date().toISOString()
    i.history.push({ at: now, status: i.status, by: s.name, note: note.trim() })
    i.updatedAt = now
  })
  revalidatePath("/admin")
  return { ok: true }
}

/* ---------- Admin: terrains ---------- */

export async function createTerrain(input: Omit<Terrain, "id" | "createdAt" | "sports"> & { sports: string }): Promise<Result<{ id: string }>> {
  await requireAdmin()
  const name = input.name?.trim()
  const city = input.city?.trim()
  if (!name || !city) return { ok: false, error: "Le nom et la ville sont obligatoires." }
  const lat = Number(input.lat)
  const lng = Number(input.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 41 || lat > 51.5 || lng < -5.5 || lng > 9.8)
    return { ok: false, error: "Placez le terrain sur la carte (coordonnées en France métropolitaine)." }
  const slug = `${city}-${name}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  const id = await mutateDb((db) => {
    let id = slug
    let n = 2
    while (db.terrains.some((t) => t.id === id)) id = `${slug}-${n++}`
    db.terrains.push({
      id,
      name,
      city,
      region: input.region?.trim() || "",
      address: input.address?.trim() || "",
      lat,
      lng,
      sports: input.sports.split(",").map((s) => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    })
    return id
  })
  revalidatePath("/admin/terrains")
  revalidatePath("/signaler")
  return { ok: true, data: { id } }
}

export async function resetDemo(): Promise<Result> {
  await requireAdmin()
  await resetDb()
  revalidatePath("/", "layout")
  return { ok: true }
}
