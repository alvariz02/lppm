import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { agendaSchema } from '@/lib/validations'

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: agenda, error } = await supabase
      .from('agenda')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !agenda) {
      return NextResponse.json({ error: 'Agenda tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: mapAgenda(agenda) })
  } catch (error) {
    console.error('[AGENDA_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data agenda' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = agendaSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('agenda')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Agenda tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const { data: agenda, error } = await supabase
      .from('agenda')
      .update({
        title: data.title,
        description: data.description || null,
        event_type: data.eventType || null,
        start_date: data.startDate,
        end_date: data.endDate || null,
        location: data.location || null,
        organizer: data.organizer || null,
        poster_url: data.posterUrl || null,
        status: data.status,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[AGENDA_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui agenda' }, { status: 500 })
    }

    return NextResponse.json({ data: mapAgenda(agenda) })
  } catch (error) {
    console.error('[AGENDA_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui agenda' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('agenda')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Agenda tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('agenda').delete().eq('id', id)

    if (error) {
      console.error('[AGENDA_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus agenda' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Agenda berhasil dihapus' })
  } catch (error) {
    console.error('[AGENDA_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus agenda' }, { status: 500 })
  }
}
