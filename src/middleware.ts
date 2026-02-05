import { auth } from "@/lib/auth/nextauth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/admin", "/admin/**", "/api/auth/**"]
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith("/**")) {
      const baseRoute = route.slice(0, -2)
      return nextUrl.pathname.startsWith(baseRoute)
    }
    return nextUrl.pathname === route
  })

  // If the route is not public and user is not authenticated, redirect to login
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access login page, redirect to home
  if (isAuthenticated && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}