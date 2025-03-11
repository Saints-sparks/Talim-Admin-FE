import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/talimadminlogin']

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    // If user is already logged in, redirect to dashboard
    if (accessToken) {
      return NextResponse.redirect(new URL('/talimadmindashboard', request.url))
    }
    return NextResponse.next()
  }

  // Check if user is authenticated for protected routes
  if (!accessToken) {
    const loginUrl = new URL('/talimadminlogin', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/talimadmindashboard/:path*',
    '/talimregister/:path*',
    '/talimannouncement/:path*',
    '/SchoolProfile/:path*',
    '/talimadminlogin'
  ]
} 