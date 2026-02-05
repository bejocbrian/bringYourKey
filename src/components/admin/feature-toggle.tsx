"use client"

import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminStore } from "@/lib/store/admin-store"
import { FeatureFlag } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FeatureToggleProps {
  feature: FeatureFlag
}

export function FeatureToggle({ feature }: FeatureToggleProps) {
  const { toggleFeature } = useAdminStore()

  const categoryColors = {
    core: "bg-blue-100 text-blue-700 border-blue-200",
    experimental: "bg-amber-100 text-amber-700 border-amber-200",
    provider: "bg-purple-100 text-purple-700 border-purple-200",
  }

  return (
    <Card className={cn("transition-all duration-200", feature.enabled ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{feature.name}</h3>
              <Badge variant="outline" className={cn("text-[10px] uppercase px-1.5 py-0", categoryColors[feature.category])}>
                {feature.category}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2">
              {feature.description}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              Last updated: {new Date(feature.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Switch 
            checked={feature.enabled} 
            onCheckedChange={() => toggleFeature(feature.id)} 
          />
        </div>
      </CardContent>
    </Card>
  )
}
