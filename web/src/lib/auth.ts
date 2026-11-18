import "server-only"
import { createHmac, randomBytes, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "sdlv_session"
const SECRET = process.env.AUTH_SECRET ?? randomBytes(32).toString("hex")

// Demo accounts. Set ADMIN_EMAIL / ADMIN_PASSWORD to override the first one.
const ACCOUNTS = [
  {
    email: (process.env.ADMIN_EMAIL ?? "direction@sportdanslaville.com").toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? "sdlv2026",
    name: "Camille Durand",
    role: "Directrice des opérations",
  },
]

export interface Session {
  email: string
  name: string
  role: string
  exp: number
}

const sign = (payload: string) => createHmac("sha256", SECRET).update(payload).digest("base64url")

export function checkCredentials(email: string, password: string) {
  const acc = ACCOUNTS.find((a) => a.email === email.trim().toLowerCase())
  if (!acc) return null
  const a = Buffer.from(acc.password)
  const b = Buffer.from(password)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return acc
}

export function encodeSession(s: Omit<Session, "exp">) {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value
  if (!raw) return null
  const [payload, sig] = raw.split(".")
  if (!payload || !sig) return null
  const expected = sign(payload)
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session
    return s.exp > Date.now() ? s : null
  } catch {
    return null
  }
}
