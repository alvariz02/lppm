import { NextResponse } from 'next/server'

// This route does not use the database — only clears auth cookies.
// No changes needed for Supabase migration.

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' })

  // Clear auth cookie
  response.cookies.set('lppm_auth', '', {
    path: '/',
    maxAge: 0,
  })

  // Clear role cookie
  response.cookies.set('lppm_role', '', {
    path: '/',
    maxAge: 0,
  })

  return response
}
