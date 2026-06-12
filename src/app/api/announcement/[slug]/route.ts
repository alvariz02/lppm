import { supabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    if (data.status !== 'active') {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapAnnouncement(data) })
  } catch (error) {
    console.error('[API_ANNOUNCEMENT_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
