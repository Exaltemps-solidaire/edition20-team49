import { readDb } from "@/lib/db"
import { toPoints } from "@/lib/points"
import { TerrainsManager } from "@/components/admin/terrains-manager"

export const dynamic = "force-dynamic"

export default async function TerrainsPage() {
  const db = await readDb()
  return <TerrainsManager db={db} points={toPoints(db)} />
}
