"use client"

import { Plus, RefreshCcw, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProvidersTable } from "@/components/admin/providers-table"

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Providers</h1>
          <p className="text-slate-500 mt-1">Manage and configure video AI providers.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Sync Status
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Video Providers</CardTitle>
                <CardDescription>Configure rate limits, costs, and default settings for each provider.</CardDescription>
              </div>
              <HelpCircle className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <ProvidersTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
