"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Video, Images, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import { PROVIDERS } from "@/lib/services/providers"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { Provider } from "@/lib/types"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Generate", href: "/generate", icon: Video },
  { name: "Gallery", href: "/gallery", icon: Images },
  { name: "API Keys", href: "/api-keys", icon: Key },
]

export function MainSidebar() {
  const pathname = usePathname()
  const { hasKey } = useApiKeysStore()

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Video className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">BYOK</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold text-muted-foreground">Provider Status</p>
            <div className="mt-3 space-y-2">
              {Object.entries(PROVIDERS).map(([id, provider]) => (
                <div key={id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{provider.name}</span>
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    hasKey(id as Provider) ? "bg-emerald-500" : "bg-muted-foreground/40"
                  )} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
