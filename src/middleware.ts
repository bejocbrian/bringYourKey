import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const { nextUrl } = request
  const isAuthenticated = !!user
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isAdminLoginRoute = nextUrl.pathname === "/admin/login"

  // Allow access to static files and API routes
  if (
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.startsWith('/api') ||
    nextUrl.pathname.includes('.') // static files
  ) {
    return supabaseResponse
  }

  if (isAdminRoute) {
    if (!isAdminLoginRoute) {
      if (!user) {
        const loginUrl = new URL('/admin/login', nextUrl.origin)
        loginUrl.searchParams.set('redirect', nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const role = profile?.role

      if (error || !role || (role !== "admin" && role !== "superadmin")) {
        return NextResponse.redirect(new URL("/admin/login", nextUrl.origin))
      }
    } else if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile && (profile.role === "admin" || profile.role === "superadmin")) {
        return NextResponse.redirect(new URL("/admin", nextUrl.origin))
      }
    }

    return supabaseResponse
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/verify"]

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)

  // If the route is not public and user is not authenticated, redirect to login
  if (!isPublicRoute && !user) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('redirect', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access login/signup page, redirect to home
  if (isAuthenticated && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", nextUrl.origin))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
