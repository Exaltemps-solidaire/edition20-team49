"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted p-1.5 pl-3">
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-navy">{link}</span>
      <Button
        size="sm"
        className="rounded-lg"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link)
          } catch {
            /* clipboard blocked on http: still show the link */
          }
          setCopied(true)
          toast.success("Lien copié")
          setTimeout(() => setCopied(false), 2000)
        }}
      >
        {copied ? <Check /> : <Copy />} {copied ? "Copié" : "Copier"}
      </Button>
    </div>
  )
}
