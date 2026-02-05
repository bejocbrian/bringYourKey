"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Video, Key, Images, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Generate", href: "/generate", icon: Video },
  { name: "Gallery", href: "/gallery", icon: Images },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Video className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">BYOK Video</span>
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
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium">BYOK - Bring Your Own Key</p>
            <p className="mt-1">
              Add your API keys from different providers to generate videos.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
