import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { announcementSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

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

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.announcement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.announcement.count({ where }),
    ])

    return NextResponse.json({
      data,
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
    const existing = await db.announcement.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const announcement = await db.announcement.create({
      data: {
        title: validated.title,
        slug: finalSlug,
        content: validated.content ?? null,
        attachmentUrl: validated.attachmentUrl ?? null,
        type: validated.type,
        status: validated.status,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : (validated.status === 'active' ? new Date() : null),
        expiredAt: validated.expiredAt ? new Date(validated.expiredAt) : null,
      },
    })

    return NextResponse.json({ success: true, data: announcement }, { status: 201 })
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
