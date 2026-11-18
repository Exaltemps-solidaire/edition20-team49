import { NextResponse } from "next/server"
import { readDb } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

// Polled by the admin shell for in-app + browser notifications.
export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const since = new URL(req.url).searchParams.get("since")
  const db = await readDb()
  const list = db.incidents
    .filter((i) => !since || i.createdAt > since)
    .map((i) => ({
      id: i.id,
      code: i.code,
      title: i.title,
      urgency: i.urgency,
      createdAt: i.createdAt,
      terrain: db.terrains.find((t) => t.id === i.terrainId)?.name ?? "",
    }))
  return NextResponse.json({ now: new Date().toISOString(), incidents: list })
}
