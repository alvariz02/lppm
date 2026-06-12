import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { announcementSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapAnnouncement(a: Record<string, unknown>) {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    content: a.content ?? null,
    attachmentUrl: a.attachment_url ?? null,
    type: a.type,
    status: a.status,
    publishedAt: a.published_at ?? null,
    expiredAt: a.expired_at ?? null,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapAnnouncement(data) })
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

    const { data: existing, error: existingError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const { data: slugConflict } = await supabase
      .from('announcements')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('announcements')
      .update({
        title: validated.title,
        slug: finalSlug,
        content: validated.content ?? null,
        attachment_url: validated.attachmentUrl ?? null,
        type: validated.type,
        status: validated.status,
        published_at: validated.publishedAt
          ? new Date(validated.publishedAt).toISOString()
          : validated.status === 'active' && !existing.published_at
            ? new Date().toISOString()
            : existing.published_at,
        expired_at: validated.expiredAt
          ? new Date(validated.expiredAt).toISOString()
          : null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_ANNOUNCEMENTS_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update announcement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapAnnouncement(data) })
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

    const { data: existing, error: existingError } = await supabase
      .from('announcements')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('announcements').delete().eq('id', id)

    if (error) {
      console.error('[API_ADMIN_ANNOUNCEMENTS_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete announcement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Announcement deleted' })
  } catch (error) {
    console.error('[API_ADMIN_ANNOUNCEMENTS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
