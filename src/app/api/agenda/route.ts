import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'upcoming'
    const eventType = searchParams.get('eventType')

    let query = supabase.from('agenda').select('*')

    query = query.eq('status', status)

    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    query = query.order('start_date', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('[API_AGENDA_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch agenda' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapAgenda)
    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[API_AGENDA_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch agenda' },
      { status: 500 }
    )
  }
}
