import { readDb } from "@/lib/db"
import { toPoints } from "@/lib/points"
import { AdminMap } from "@/components/admin/admin-map"

export const dynamic = "force-dynamic"

export default async function CartePage() {
  const db = await readDb()
  return <AdminMap points={toPoints(db, (id) => `/admin/terrains?terrain=${id}`, "Voir la fiche terrain →")} db={db} />
}
