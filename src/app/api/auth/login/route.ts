import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    const profile = await db.profile.findUnique({ where: { email } })

    if (!profile || !profile.isActive) {
      return NextResponse.json(
        { error: 'Email tidak terdaftar atau akun tidak aktif' },
        { status: 401 }
      )
    }

    // Simple password verification (plain text for demo)
    // In production, use bcrypt or similar
    if (profile.password !== password) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
      },
    })

    // Set auth cookie for middleware to check
    response.cookies.set('lppm_auth', profile.id, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('[AUTH_LOGIN]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
