import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { readDb } from "@/lib/db"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  const db = await readDb()
  const recent = db.incidents
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map((i) => ({
      id: i.id,
      code: i.code,
      title: i.title,
      urgency: i.urgency,
      createdAt: i.createdAt,
      terrain: db.terrains.find((t) => t.id === i.terrainId)?.name ?? "",
    }))
  return (
    <AdminShell user={{ name: session.name, role: session.role, email: session.email }} recent={recent} newCount={db.incidents.filter((i) => i.status === "nouveau").length}>
      {children}
    </AdminShell>
  )
}
