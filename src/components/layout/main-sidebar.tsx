"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, Video, Images, Key, Lock, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PROVIDERS } from "@/lib/services/providers"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { useAdminStore } from "@/lib/store/admin-store"
import { Provider } from "@/lib/types"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Generate", href: "/generate", icon: Video },
  { name: "Gallery", href: "/gallery", icon: Images },
  { name: "API Keys", href: "/api-keys", icon: Key },
]

export function MainSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { hasKey } = useApiKeysStore()
  const { currentUserId, isProviderAllowedForUser } = useAdminStore()

  const getProviderStatus = (providerId: Provider) => {
    const hasApiKey = hasKey(providerId)
    const hasAccess = isProviderAllowedForUser(currentUserId, providerId)
    
    if (!hasAccess) return 'locked'
    if (hasApiKey) return 'ready'
    return 'no-key'
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

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

        {session && (
          <>
            <Separator />
            <div className="p-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 w-8 p-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator />
        
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold text-muted-foreground">Provider Status</p>
            <div className="mt-3 space-y-2">
              {Object.entries(PROVIDERS).map(([id, provider]) => {
                const status = getProviderStatus(id as Provider)
                return (
                  <div key={id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{provider.name}</span>
                    <div className="flex items-center gap-1">
                      {status === 'locked' && (
                        <span title="Access denied">
                          <Lock className="h-3 w-3 text-rose-500" />
                        </span>
                      )}
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        status === 'ready' ? "bg-emerald-500" : 
                        status === 'locked' ? "bg-rose-500" : "bg-muted-foreground/40"
                      )} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
