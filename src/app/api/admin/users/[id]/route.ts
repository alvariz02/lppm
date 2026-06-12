import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profileSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profile = await db.profile.findUnique({ where: { id } })

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: profile })
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

    const existing = await db.profile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check email uniqueness if email is being changed
    if (validated.email !== existing.email) {
      const emailConflict = await db.profile.findUnique({ where: { email: validated.email } })
      if (emailConflict) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    const profile = await db.profile.update({
      where: { id },
      data: {
        email: validated.email,
        ...(validated.password ? { password: validated.password } : {}),
        fullName: validated.fullName ?? null,
        avatarUrl: validated.avatarUrl ?? null,
        role: validated.role,
        isActive: validated.isActive ?? existing.isActive,
      },
    })

    return NextResponse.json({ success: true, data: profile })
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

    const existing = await db.profile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await db.profile.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'User deleted' })
  } catch (error) {
    console.error('[API_ADMIN_USERS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
