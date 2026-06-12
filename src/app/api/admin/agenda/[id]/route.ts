import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agendaSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agenda = await db.agenda.findUnique({ where: { id } })

    if (!agenda) {
      return NextResponse.json({ error: 'Agenda tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: agenda })
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

    const existing = await db.agenda.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agenda tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const agenda = await db.agenda.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        eventType: data.eventType || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location || null,
        organizer: data.organizer || null,
        posterUrl: data.posterUrl || null,
        status: data.status,
      },
    })

    return NextResponse.json({ data: agenda })
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

    const existing = await db.agenda.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agenda tidak ditemukan' }, { status: 404 })
    }

    await db.agenda.delete({ where: { id } })

    return NextResponse.json({ message: 'Agenda berhasil dihapus' })
  } catch (error) {
    console.error('[AGENDA_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus agenda' }, { status: 500 })
  }
}
