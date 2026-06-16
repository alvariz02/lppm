import { supabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

function mapProfile(p: any) {
  return {
    id: p.id,
    email: p.email,
    // password field name is `password` in schema.sql
    password: p.password,
    fullName: p.full_name,
    avatarUrl: p.avatar_url,
    role: p.role,
    isActive: p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !profile || !profile.is_active) {
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

    const mapped = mapProfile(profile)

    const response = NextResponse.json({
      success: true,
      data: {
        id: mapped.id,
        email: mapped.email,
        fullName: mapped.fullName,
        role: mapped.role,
      },
    })

    // Set auth cookie for middleware to check (user ID)
    response.cookies.set('lppm_auth', mapped.id, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Set role cookie for middleware role-based route protection
    response.cookies.set('lppm_role', mapped.role, {
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
