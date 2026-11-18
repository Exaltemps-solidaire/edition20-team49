"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { login } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, {})
  const [show, setShow] = useState(false)
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      {state?.error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue="direction@sportdanslaville.com" className="h-12 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="h-12 rounded-xl pr-12" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" aria-label={show ? "Masquer" : "Afficher"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-navy text-base hover:bg-navy/90">
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />} Se connecter
      </Button>
      <div className="rounded-xl bg-brand-50 p-3 text-xs text-navy">
        <span className="font-bold">Compte de démo :</span> direction@sportdanslaville.com · <span className="font-mono">sdlv2026</span>
      </div>
    </form>
  )
}
