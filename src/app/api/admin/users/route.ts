import { NextRequest, NextResponse } from 'next/server'
import { supabase, countRecords, paginateQuery, buildOrSearch } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { profileSchema } from '@/lib/validations'

function mapProfile(p: any) {
  return {
    id: p.id,
    email: p.email,
    password: p.password,
    fullName: p.full_name,
    avatarUrl: p.avatar_url,
    role: p.role,
    isActive: p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(from, to)

    // Apply role filter
    if (role) {
      query = query.eq('role', role)
    }

    // Apply search filter
    if (search) {
      query = query.or(buildOrSearch(['full_name', 'email'], search))
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_USERS_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    const total = count ?? 0
    const mappedData = (data || []).map(mapProfile)

    return NextResponse.json({
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_USERS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = profileSchema.parse(body)

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validated.email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        email: validated.email,
        password: validated.password || 'admin123',
        full_name: validated.fullName ?? null,
        avatar_url: validated.avatarUrl ?? null,
        role: validated.role,
        is_active: validated.isActive ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: mapProfile(profile) }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_USERS_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
