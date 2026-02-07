"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAdminStore } from "@/lib/store/admin-store"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminNav } from "@/components/layout/admin-nav"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/lib/types"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAdminStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      if (!mounted) return

      // Skip auth check for login page
      if (pathname === "/admin/login") {
        setIsLoading(false)
        return
      }

      // Check Supabase session and admin role
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAuthorized(false)
        setIsLoading(false)
        router.push("/admin/login")
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
        setIsAuthorized(false)
        setIsLoading(false)
        await supabase.auth.signOut()
        router.push("/admin/login")
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setIsAuthorized(false)
        if (pathname !== "/admin/login") {
          router.push("/admin/login")
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [mounted, pathname, router, supabase])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader />
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
        <AdminNav />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
