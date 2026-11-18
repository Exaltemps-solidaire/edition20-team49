import { Suspense } from "react"
import { readDb } from "@/lib/db"
import { IncidentBoard } from "@/components/admin/incident-board"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const db = await readDb()
  return (
    <Suspense>
      <IncidentBoard db={db} />
    </Suspense>
  )
}
