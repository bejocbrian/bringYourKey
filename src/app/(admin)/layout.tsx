"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAdminStore } from "@/lib/store/admin-store"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminNav } from "@/components/layout/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAdminStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [mounted, isAuthenticated, pathname, router])

  if (!mounted) return null

  if (!isAuthenticated && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
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
