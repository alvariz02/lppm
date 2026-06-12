import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('announcements')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_ANNOUNCEMENTS_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapAnnouncement)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_ANNOUNCEMENTS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = announcementSchema.parse(body)

    const slug = generateSlug(validated.title)
    const { data: existing } = await supabase
      .from('announcements')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: validated.title,
        slug: finalSlug,
        content: validated.content ?? null,
        attachment_url: validated.attachmentUrl ?? null,
        type: validated.type,
        status: validated.status,
        published_at: validated.publishedAt
          ? new Date(validated.publishedAt).toISOString()
          : validated.status === 'active'
            ? new Date().toISOString()
            : null,
        expired_at: validated.expiredAt
          ? new Date(validated.expiredAt).toISOString()
          : null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_ANNOUNCEMENTS_POST]', error)
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapAnnouncement(data) }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_ANNOUNCEMENTS_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
