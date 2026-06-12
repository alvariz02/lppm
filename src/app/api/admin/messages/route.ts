import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

function mapContactMessage(m: Record<string, unknown>) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone ?? null,
    subject: m.subject ?? null,
    message: m.message,
    isRead: m.is_read ?? false,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
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
    const isRead = searchParams.get('isRead')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (isRead !== null && isRead !== '' && isRead !== undefined) {
      query = query.eq('is_read', isRead === 'true')
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_MESSAGES_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)

    const mapped = (data ?? []).map(mapContactMessage)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      unreadCount: unreadCount ?? 0,
    })
  } catch (error) {
    console.error('[API_ADMIN_MESSAGES_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
