import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { agendaSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapAgenda(a: Record<string, unknown>) {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    description: a.description ?? null,
    eventType: a.event_type ?? null,
    startDate: a.start_date,
    endDate: a.end_date ?? null,
    location: a.location ?? null,
    organizer: a.organizer ?? null,
    posterUrl: a.poster_url ?? null,
    status: a.status,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const eventType = searchParams.get('eventType') || ''
    const status = searchParams.get('status') || ''

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('agenda')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,organizer.ilike.%${search}%`)
    }
    if (eventType) {
      query = query.eq('event_type', eventType)
    }
    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('start_date', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[AGENDA_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data agenda' }, { status: 500 })
    }

    const mapped = (data ?? []).map(mapAgenda)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[AGENDA_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data agenda' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = agendaSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    // Generate unique slug
    let slug = generateSlug(data.title)
    const { data: existing } = await supabase
      .from('agenda')
      .select('id')
      .eq('slug', slug)
      .single()
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const { data: agenda, error } = await supabase
      .from('agenda')
      .insert({
        title: data.title,
        slug,
        description: data.description || null,
        event_type: data.eventType || null,
        start_date: data.startDate,
        end_date: data.endDate || null,
        location: data.location || null,
        organizer: data.organizer || null,
        poster_url: data.posterUrl || null,
        status: data.status,
      })
      .select()
      .single()

    if (error) {
      console.error('[AGENDA_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat agenda' }, { status: 500 })
    }

    return NextResponse.json({ data: mapAgenda(agenda) }, { status: 201 })
  } catch (error) {
    console.error('[AGENDA_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat agenda' }, { status: 500 })
  }
}
