import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { announcementSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const announcement = await db.announcement.findUnique({ where: { id } })

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: announcement })
  } catch (error) {
    console.error('[API_ADMIN_ANNOUNCEMENTS_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
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
    const validated = announcementSchema.parse(body)

    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const slugConflict = await db.announcement.findUnique({ where: { slug } })
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        title: validated.title,
        slug: finalSlug,
        content: validated.content ?? null,
        attachmentUrl: validated.attachmentUrl ?? null,
        type: validated.type,
        status: validated.status,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : (validated.status === 'active' && !existing.publishedAt ? new Date() : existing.publishedAt),
        expiredAt: validated.expiredAt ? new Date(validated.expiredAt) : null,
      },
    })

    return NextResponse.json({ success: true, data: announcement })
  } catch (error: unknown) {
    console.error('[API_ADMIN_ANNOUNCEMENTS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update announcement' },
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

    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    await db.announcement.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Announcement deleted' })
  } catch (error) {
    console.error('[API_ADMIN_ANNOUNCEMENTS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
