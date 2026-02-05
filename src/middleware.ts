import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const { user, emailVerified, supabaseResponse } = await updateSession(req)

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/verify', '/admin']
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/admin') {
      return nextUrl.pathname.startsWith('/admin')
    }
    return nextUrl.pathname === route
  })

  // Allow access to static files and API routes
  if (
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.startsWith('/api') ||
    nextUrl.pathname.includes('.') // static files
  ) {
    return supabaseResponse
  }

  // If the route is not public and user is not authenticated, redirect to login
  if (!isPublicRoute && !user) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('redirect', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated but email is not verified, redirect to verify page
  // (except if already on verify page or logging out)
  if (user && !emailVerified && !isPublicRoute && nextUrl.pathname !== '/verify') {
    const verifyUrl = new URL('/verify', nextUrl.origin)
    return NextResponse.redirect(verifyUrl)
  }

  // If user is authenticated and verified and trying to access auth pages, redirect to home
  if (user && emailVerified && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', nextUrl.origin))
  }

  // If user is authenticated but not verified and trying to access login/signup, redirect to verify
  if (user && !emailVerified && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/verify', nextUrl.origin))
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
