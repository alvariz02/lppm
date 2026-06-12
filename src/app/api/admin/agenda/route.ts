import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { agendaSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

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

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { location: { contains: search } },
        { organizer: { contains: search } },
      ]
    }
    if (eventType) {
      where.eventType = eventType
    }
    if (status) {
      where.status = status
    }

    const [data, total] = await Promise.all([
      db.agenda.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.agenda.count({ where }),
    ])

    return NextResponse.json({
      data,
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
    const existing = await db.agenda.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const agenda = await db.agenda.create({
      data: {
        title: data.title,
        slug,
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

    return NextResponse.json({ data: agenda }, { status: 201 })
  } catch (error) {
    console.error('[AGENDA_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat agenda' }, { status: 500 })
  }
}
