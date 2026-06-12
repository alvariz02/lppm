import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { publicationSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const publicationType = searchParams.get('publicationType')
    const year = searchParams.get('year')
    const isPublished = searchParams.get('isPublished')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (publicationType) {
      where.publicationType = publicationType
    }

    if (year) {
      where.year = parseInt(year)
    }

    if (isPublished !== null && isPublished !== undefined && isPublished !== '') {
      where.isPublished = isPublished === 'true'
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { contains: search } },
        { journalName: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.publication.findMany({
        where,
        include: {
          research: { select: { id: true, title: true } },
          service: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.publication.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_PUBLICATIONS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = publicationSchema.parse(body)

    const slug = generateSlug(validated.title)
    const existing = await db.publication.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const publication = await db.publication.create({
      data: {
        title: validated.title,
        slug: finalSlug,
        publicationType: validated.publicationType,
        authors: validated.authors ?? null,
        publisherName: validated.publisherName ?? null,
        journalName: validated.journalName ?? null,
        year: validated.year,
        volume: validated.volume ?? null,
        number: validated.number ?? null,
        pages: validated.pages ?? null,
        issn: validated.issn ?? null,
        isbn: validated.isbn ?? null,
        doi: validated.doi ?? null,
        url: validated.url ?? null,
        indexing: validated.indexing ?? null,
        accreditation: validated.accreditation ?? null,
        researchId: validated.researchId ?? null,
        serviceId: validated.serviceId ?? null,
        isPublished: validated.isPublished ?? true,
      },
    })

    return NextResponse.json({ success: true, data: publication }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_PUBLICATIONS_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create publication' },
      { status: 500 }
    )
  }
}
