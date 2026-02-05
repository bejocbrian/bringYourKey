"use client"

import { useState } from "react"
import { Calendar, Download, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { useAdminStore } from "@/lib/store/admin-store"

export default function AnalyticsPage() {
  const { analytics, refreshAnalytics } = useAdminStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      refreshAnalytics()
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-slate-500 mt-1">Detailed usage and performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AnalyticsChart 
          type="line"
          title="Generations Volume"
          description="Total number of video generations per day"
          data={analytics.generations}
          categoryKey="date"
          dataKey="count"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnalyticsChart 
            type="bar"
            title="Success vs Failed"
            description="Generation status breakdown"
            data={[
              { name: 'Success', value: 942 },
              { name: 'Failed', value: 23 },
            ]}
            categoryKey="name"
            dataKey="value"
            colors={['#10b981', '#ef4444']}
          />
          <AnalyticsChart 
            type="pie"
            title="Provider Usage"
            description="Distribution of generations by provider"
            data={analytics.providerUsage}
            categoryKey="provider"
            dataKey="count"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Prompts Analysis</CardTitle>
                <CardDescription>Most frequent keywords used in generation prompts</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View Full Report</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analytics.topPrompts.words.map((word, i) => (
                <div key={word} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{word}</span>
                    <span className="text-slate-500">{100 - i * 15}% frequency</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
