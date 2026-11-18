import { CircleDot, Dumbbell, Fence, Goal, Grid3x3, HelpCircle, Layers, Lightbulb } from "lucide-react"
import type { Equipment } from "./types"

export const EQUIPMENT_ICONS: Record<Equipment, React.ComponentType<{ className?: string }>> = {
  but: Goal,
  panier: CircleDot,
  agres: Dumbbell,
  filet: Grid3x3,
  eclairage: Lightbulb,
  revetement: Layers,
  cloture: Fence,
  autre: HelpCircle,
}
