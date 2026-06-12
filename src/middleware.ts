import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin pages
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('lppm_auth')
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
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
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
