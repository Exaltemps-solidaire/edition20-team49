"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Bell, BellRing, ExternalLink, KanbanSquare, LogOut, Map, MapPinned, Menu, RotateCcw } from "lucide-react"
import { logout, resetDemo } from "@/lib/actions"
import { URGENCY } from "@/lib/meta"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface NotifItem {
  id: string
  code: string
  title: string
  urgency: number
  createdAt: string
  terrain: string
}

const NAV = [
  { href: "/admin", label: "Incidents", icon: KanbanSquare },
  { href: "/admin/carte", label: "Carte", icon: Map },
  { href: "/admin/terrains", label: "Terrains", icon: MapPinned },
]

export function AdminShell({
  user,
  recent,
  newCount,
  children,
}: {
  user: { name: string; role: string; email: string }
  recent: NotifItem[]
  newCount: number
  children: React.ReactNode
}) {
  const router = useRouter()
  const [items, setItems] = useState<NotifItem[]>(recent)
  const [unread, setUnread] = useState(0)
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default")
  const since = useRef(new Date().toISOString())

  useEffect(() => {
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission)
  }, [])

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/incidents?since=${encodeURIComponent(since.current)}`, { cache: "no-store" })
      if (!res.ok) return
      const data: { now: string; incidents: NotifItem[] } = await res.json()
      since.current = data.now
      if (!data.incidents.length) return
      setItems((prev) => [...data.incidents, ...prev].slice(0, 20))
      setUnread((n) => n + data.incidents.length)
      for (const i of data.incidents) {
        toast.info(`Nouvel incident · ${i.code}`, {
          description: `${i.title} — ${i.terrain}`,
          action: { label: "Voir", onClick: () => router.push(`/admin?incident=${i.id}`) },
          duration: 8000,
        })
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          const n = new Notification(`Nouvel incident ${i.code} · urgence ${i.urgency}/5`, {
            body: `${i.title}\n${i.terrain}`,
            icon: "/logo-sdlv.svg",
            tag: i.id,
          })
          n.onclick = () => {
            window.focus()
            router.push(`/admin?incident=${i.id}`)
          }
        }
      }
      router.refresh()
    } catch {
      /* offline: try again next tick */
    }
  }, [router])

  useEffect(() => {
    const t = setInterval(poll, 6000)
    return () => clearInterval(t)
  }, [poll])

  async function enableBrowserNotifs() {
    if (typeof Notification === "undefined") return toast.error("Ce navigateur ne gère pas les notifications.")
    const p = await Notification.requestPermission()
    setPerm(p)
    if (p === "granted") {
      toast.success("Notifications navigateur activées")
      new Notification("Notifications activées", { body: "Vous serez prévenu·e à chaque nouvelle déclaration.", icon: "/logo-sdlv.svg" })
    } else toast.warning("Notifications refusées par le navigateur (sur http, seules les notifications in-app fonctionnent).")
  }

  const nav = <SideNav newCount={newCount} />

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-navy p-5 text-white lg:flex">{nav}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white/85 px-4 backdrop-blur sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-navy p-5 text-white">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {nav}
            </SheetContent>
          </Sheet>
          <div className="flex-1" />

          <Button variant="outline" size="sm" className="hidden rounded-full sm:inline-flex" asChild>
            <Link href="/signaler" target="_blank">
              <ExternalLink /> Formulaire public
            </Link>
          </Button>

          <Popover onOpenChange={(o) => o && setUnread(0)}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
                {unread ? <BellRing className="text-primary" /> : <Bell />}
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 rounded-2xl p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="font-bold text-navy">Notifications</div>
                {perm !== "granted" && perm !== "unsupported" && (
                  <Button size="sm" variant="secondary" className="h-7 rounded-full text-xs" onClick={enableBrowserNotifs}>
                    Activer sur le navigateur
                  </Button>
                )}
                {perm === "granted" && <span className="text-xs font-medium text-emerald-600">Navigateur activé</span>}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {items.map((i) => (
                  <Link key={i.id + i.createdAt} href={`/admin?incident=${i.id}`} className="flex gap-3 border-b px-4 py-3 last:border-0 hover:bg-muted/60">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", URGENCY[i.urgency].bar)} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-navy">{i.title}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {i.code} · {i.terrain}
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(i.createdAt), { locale: fr, addSuffix: false })}
                    </span>
                  </Link>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-muted">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-lime text-xs font-bold text-navy">
                    {user.name.split(" ").map((p) => p[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold text-navy">{user.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{user.role}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={enableBrowserNotifs}>
                <BellRing /> Notifications navigateur
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await resetDemo()
                  toast.success("Données de démo réinitialisées")
                  router.refresh()
                }}
              >
                <RotateCcw /> Réinitialiser la démo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                <LogOut /> Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

function SideNav({ newCount }: { newCount: number }) {
  const path = usePathname()
  return (
    <div className="flex h-full flex-col">
      <Logo white href="/admin" />
      <nav className="mt-10 space-y-1">
        {NAV.map((n) => {
          const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href)
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active ? "bg-white text-navy" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <n.icon className={cn("size-5", active && "text-primary")} />
              {n.label}
              {n.href === "/admin" && newCount > 0 && (
                <span className="ml-auto rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-navy">{newCount}</span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-white/5 p-4 text-xs text-white/70">
        <div className="font-display mb-1 text-base text-lime">Astuce</div>
        Glissez une carte d&apos;une colonne à l&apos;autre pour changer son statut.
      </div>
    </div>
  )
}
