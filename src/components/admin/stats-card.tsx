import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isUp: boolean
  }
  description?: string
  color?: string
}

export function StatsCard({ title, value, icon: Icon, trend, description, color = "indigo" }: StatsCardProps) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    rose: "text-rose-600 bg-rose-50",
    blue: "text-blue-600 bg-blue-50",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-xl", colorMap[color] || colorMap.indigo)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {(trend || description) && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md",
                trend.isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}>
                {trend.isUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {trend.value}%
              </span>
            )}
            <span className="text-xs text-slate-500">
              {trend ? trend.label : description}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
