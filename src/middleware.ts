import { NextRequest, NextResponse } from 'next/server'

// Routes that only super_admin can access at the API level
const SUPER_ADMIN_ONLY_API_ROUTES = [
  '/api/admin/users',
  '/api/admin/settings',
]

// Routes that only super_admin and admin_lppm can access at the API level
const ADMIN_LPPM_API_ROUTES = [
  '/api/admin/researchers',
  '/api/admin/faculties',
  '/api/admin/study-programs',
  '/api/admin/reviewers',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin pages — require auth cookie
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('lppm_auth')
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based page protection for admin routes
    const roleCookie = request.cookies.get('lppm_role')
    const userRole = roleCookie?.value || ''

    // Only super_admin can access /admin/users and /admin/settings
    if (
      pathname.startsWith('/admin/users') ||
      pathname.startsWith('/admin/settings')
    ) {
      if (userRole !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    // Only super_admin and admin_lppm can access researchers, faculties, study-programs, reviewers
    if (
      pathname.startsWith('/admin/researchers') ||
      pathname.startsWith('/admin/faculties') ||
      pathname.startsWith('/admin/study-programs') ||
      pathname.startsWith('/admin/reviewers')
    ) {
      if (userRole !== 'super_admin' && userRole !== 'admin_lppm') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    const authCookie = request.cookies.get('lppm_auth')
    if (!authCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Role-based API route protection
    const roleCookie = request.cookies.get('lppm_role')
    const userRole = roleCookie?.value || ''

    // Check super_admin-only routes
    if (SUPER_ADMIN_ONLY_API_ROUTES.some((route) => pathname.startsWith(route))) {
      if (userRole !== 'super_admin') {
        return NextResponse.json(
          { error: 'Forbidden — insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Check admin_lppm+ routes
    if (ADMIN_LPPM_API_ROUTES.some((route) => pathname.startsWith(route))) {
      if (userRole !== 'super_admin' && userRole !== 'admin_lppm') {
        return NextResponse.json(
          { error: 'Forbidden — insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // All other /api/admin/* routes: allow any authenticated user
    // Client-side will handle further restrictions via hasPermission/canAccess
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
