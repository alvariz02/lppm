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
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const fundingSchemeId = searchParams.get('fundingSchemeId')
    const facultyId = searchParams.get('facultyId')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = {
      isPublished: true,
    }

    if (year) {
      where.year = parseInt(year)
    }

    if (status) {
      where.status = status
    }

    if (fundingSchemeId) {
      where.fundingSchemeId = fundingSchemeId
    }

    if (facultyId) {
      where.facultyId = facultyId
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (search) {
      where.title = { contains: search }
    }

    const [data, total] = await Promise.all([
      db.research.findMany({
        where,
        include: {
          leader: {
            select: {
              id: true,
              name: true,
              nidn: true,
              photoUrl: true,
              expertise: true,
            },
          },
          faculty: {
            select: { id: true, name: true, slug: true },
          },
          fundingScheme: {
            select: { id: true, name: true, slug: true, source: true, year: true },
          },
          members: {
            include: {
              researcher: {
                select: { id: true, name: true, nidn: true, photoUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.research.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_RESEARCH_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch research data' },
      { status: 500 }
    )
  }
}
