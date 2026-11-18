"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export type { MapPoint } from "./terrains-map"

export const TerrainsMap = dynamic(() => import("./terrains-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[280px] w-full rounded-[inherit]" />,
})
