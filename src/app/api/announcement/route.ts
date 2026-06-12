import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 'active')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('[API_ANNOUNCEMENT_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapAnnouncement)

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[API_ANNOUNCEMENT_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}
