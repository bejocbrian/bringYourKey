"use client"

import Link from "next/link"
import { Shield, LogOut, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/lib/store/admin-store"
import { useRouter } from "next/navigation"

export function AdminHeader() {
  const { logout, adminUser } = useAdminStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-indigo-600" />
        <Link href="/admin" className="text-xl font-bold text-slate-900">
          BYOK <span className="text-indigo-600">Admin</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-slate-500" />
        </Button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700">{adminUser?.username || 'Admin'}</span>
            <span className="text-xs text-slate-500 capitalize">{adminUser?.role || 'Administrator'}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
      </div>
    </header>
  )
}
