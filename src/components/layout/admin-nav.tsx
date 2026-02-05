"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  ToggleRight, 
  Server,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Providers", href: "/admin/providers", icon: Server },
  { name: "Feature Flags", href: "/admin/features", icon: ToggleRight },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r h-full overflow-y-auto hidden md:block">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between group px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto p-4 border-t">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-md transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to App
        </Link>
      </div>
    </aside>
  )
}
