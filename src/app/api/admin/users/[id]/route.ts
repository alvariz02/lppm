import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapProfile(profile) })
  } catch (error) {
    console.error('[API_ADMIN_USERS_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = profileSchema.parse(body)

    // Check if user exists
    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check email uniqueness if email is being changed
    if (validated.email !== existing.email) {
      const { data: emailConflict } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', validated.email)
        .single()

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, any> = {
      email: validated.email,
      full_name: validated.fullName ?? null,
      avatar_url: validated.avatarUrl ?? null,
      role: validated.role,
      is_active: validated.isActive ?? existing.is_active,
    }

    // Only update password if provided
    if (validated.password) {
      updateData.password = validated.password
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: mapProfile(profile) })
  } catch (error: unknown) {
    console.error('[API_ADMIN_USERS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'User deleted' })
  } catch (error) {
    console.error('[API_ADMIN_USERS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
