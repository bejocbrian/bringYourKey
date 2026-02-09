"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminNav } from "@/components/layout/admin-nav"
import { createClient } from "@/lib/supabase/client"
import { useAdminStore } from "@/lib/store/admin-store"


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Create Supabase client
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

      try {
        // Check Supabase session and admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error("Auth error:", authError)
          setIsAuthorized(false)
          setIsLoading(false)
          router.push("/admin/login")
          return
        }

        // Check admin role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || !profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
          console.error("Profile error or unauthorized:", profileError, profile)
          setIsAuthorized(false)
          setIsLoading(false)
          await supabase.auth.signOut()
          router.push("/admin/login")
          return
        }

        setIsAuthorized(true)
        setIsLoading(false)

        // Initialize admin data
        useAdminStore.getState().init().catch(console.error)
      } catch (err) {
        console.error("Unexpected auth check error:", err)
        setIsAuthorized(false)
        setIsLoading(false)
        router.push("/admin/login")
      }
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
  }, [mounted, pathname, router])

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
