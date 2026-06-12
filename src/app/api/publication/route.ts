import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

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
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {
      isPublished: true,
    }

    if (publicationType) {
      where.publicationType = publicationType
    }

    if (year) {
      where.year = parseInt(year)
    }

    if (search) {
      where.title = { contains: search }
    }

    const [data, total] = await Promise.all([
      db.publication.findMany({
        where,
        include: {
          research: {
            select: { id: true, title: true, slug: true },
          },
          service: {
            select: { id: true, title: true, slug: true },
          },
          publicationAuthors: {
            include: {
              researcher: {
                select: { id: true, name: true, nidn: true },
              },
            },
            orderBy: { authorOrder: 'asc' },
          },
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
    console.error('[API_PUBLICATION_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  }
}
