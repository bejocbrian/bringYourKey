"use client"

import {
  CheckCircle2,
  Settings2,
  Clock,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAdminStore } from "@/lib/store/admin-store"
import { Provider } from "@/lib/types"

export function ProvidersTable() {
  const { providerConfigs, toggleProvider } = useAdminStore()

  return (
    <div className="relative overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Provider</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Default</th>
            <th className="px-6 py-4 font-semibold">Rate Limit</th>
            <th className="px-6 py-4 font-semibold">Cost</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(Object.keys(providerConfigs) as Provider[]).map((id) => {
            const config = providerConfigs[id]
            return (
              <tr key={id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center font-bold text-[10px] uppercase">
                      {id.split('-')[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 capitalize">{id.replace('-', ' ')}</div>
                      <div className="text-xs text-slate-500">v1.2.0</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={config.enabled} 
                      onCheckedChange={() => toggleProvider(id)}
                    />
                    <span className={config.enabled ? "text-emerald-600 font-medium" : "text-slate-400"}>
                      {config.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {config.isDefault ? (
                    <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Default
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {config.rateLimit.requestsPerMinute} RPM
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-slate-700">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                    {config.costEstimate.perGeneration} {config.costEstimate.currency}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    Configure
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
