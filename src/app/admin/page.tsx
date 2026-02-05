"use client"

import { 
  Users, 
  Video, 
  Key, 
  Zap, 
  Activity,
  ArrowUpRight,
  Plus
} from "lucide-react"
import { StatsCard } from "@/components/admin/stats-card"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAdminStore } from "@/lib/store/admin-store"

export default function AdminDashboard() {
  const { analytics, users } = useAdminStore()

  const hasData = analytics.generations.length > 0 || analytics.providerUsage.length > 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your application performance and usage.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            New Feature
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={users.length.toString()} 
          icon={Users} 
          color="blue"
        />
        <StatsCard 
          title="Generations" 
          value={analytics.generations.reduce((sum, g) => sum + g.count, 0).toString()} 
          icon={Video} 
          color="emerald"
        />
        <StatsCard 
          title="Active Providers" 
          value={analytics.providerUsage.length.toString()} 
          icon={Key} 
          color="amber"
        />
        <StatsCard 
          title="Avg. Cost" 
          value="—" 
          icon={Zap} 
          description="per generation"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <AnalyticsChart 
            type="line"
            title="Generations Over Time"
            description="Daily count of video generations across all providers"
            data={analytics.generations}
            categoryKey="date"
            dataKey="count"
          />
        </div>

        {/* Provider Usage */}
        <div className="lg:col-span-1">
          <AnalyticsChart 
            type="pie"
            title="Provider Distribution"
            description="Usage split by video provider"
            data={analytics.providerUsage}
            categoryKey="provider"
            dataKey="count"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No activity yet</p>
                <p className="text-xs text-slate-400 mt-1">Recent generations will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">User_{i * 123} generated a video</p>
                        <p className="text-xs text-slate-500">Google Veo • 2 minutes ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Prompt Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPrompts.words.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No data yet</p>
                <p className="text-xs text-slate-400 mt-1">Popular prompt keywords will appear here</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {analytics.topPrompts.words.map((word) => (
                    <span 
                      key={word} 
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-900">{analytics.topPrompts.count}</span> unique prompt combinations analyzed this week.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
