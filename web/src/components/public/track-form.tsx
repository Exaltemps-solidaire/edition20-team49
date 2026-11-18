"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function TrackForm() {
  const [code, setCode] = useState("")
  const router = useRouter()
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const n = code.trim().toUpperCase().replace(/^INC-?/, "")
        if (n) router.push(`/suivi/inc-${n}`)
      }}
    >
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="INC-1004"
        className="h-12 rounded-full bg-white px-5 font-mono text-base"
        aria-label="Numéro de suivi"
      />
      <Button type="submit" size="lg" className="h-12 rounded-full px-6">
        Suivre <ArrowRight />
      </Button>
    </form>
  )
}
