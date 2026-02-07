"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Shield, LogOut, Bell, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/lib/types"

export function AdminHeader() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        if (data) {
          setProfile(data as Profile)
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-600" />
          <Link href="/admin" className="text-xl font-bold text-slate-900">
            BYOK <span className="text-indigo-600">Admin</span>
          </Link>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </header>
    )
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
            <span className="text-sm font-medium text-slate-700">{profile?.full_name || profile?.email || 'Admin'}</span>
            <span className="text-xs text-slate-500 capitalize">{profile?.role || 'Administrator'}</span>
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
