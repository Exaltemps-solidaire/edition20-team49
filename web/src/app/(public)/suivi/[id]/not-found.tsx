import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrackForm } from "@/components/public/track-form"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-4xl text-navy">Numéro introuvable</h1>
      <p className="mt-3 mb-6 text-muted-foreground">Vérifiez le numéro reçu après votre déclaration.</p>
      <TrackForm />
      <Button asChild variant="link" className="mt-4">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  )
}
