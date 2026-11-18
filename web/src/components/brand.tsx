import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ white, className, href = "/" }: { white?: boolean; className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <Image src={white ? "/logo-sdlv-white.svg" : "/logo-sdlv.svg"} alt="Sport dans la Ville" width={34} height={46} priority />
      <span className="leading-none">
        <span className={cn("font-display block text-lg", white ? "text-white" : "text-navy")}>Terrains en forme</span>
        <span className={cn("block text-[11px] font-semibold uppercase tracking-[0.14em]", white ? "text-white/70" : "text-primary")}>
          Sport dans la Ville
        </span>
      </span>
    </Link>
  )
}
