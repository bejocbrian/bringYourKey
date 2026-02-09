"use client"

import { useAdminStore } from "@/lib/store/admin-store"
import { FeatureToggle } from "@/components/admin/feature-toggle"
import { Shield, Sparkles, Beaker, Loader2 } from "lucide-react"

export default function FeaturesPage() {
  const { features, isLoadingFeatures } = useAdminStore()

  const categories = [
    { id: 'core', name: 'Core Features', icon: Shield },
    { id: 'provider', name: 'Provider Features', icon: Sparkles },
    { id: 'experimental', name: 'Experimental', icon: Beaker },
  ] as const

  if (isLoadingFeatures && features.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Feature Flags</h1>
        <p className="text-slate-500 mt-1">Control application features and roll out new functionality safely.</p>
      </div>

      {categories.map((category) => {
        const categoryFeatures = features.filter(f => f.category === category.id)

        // Show category if it has features OR if we're done loading (so empty section is visible if intended)
        if (categoryFeatures.length === 0 && category.id !== 'experimental' && !isLoadingFeatures) return null

        return (
          <section key={category.id} className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <category.icon className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-800">{category.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryFeatures.map((feature) => (
                <FeatureToggle key={feature.id} feature={feature} />
              ))}
              {categoryFeatures.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500">No features in this category yet.</p>
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
