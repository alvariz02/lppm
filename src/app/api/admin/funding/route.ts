import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { fundingSchemeSchema } from '@/lib/validations'
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
    const year = searchParams.get('year')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (year) {
      where.year = parseInt(year)
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { source: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.fundingScheme.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.fundingScheme.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_FUNDING_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch funding schemes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = fundingSchemeSchema.parse(body)

    const slug = generateSlug(validated.name)
    const existing = await db.fundingScheme.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const funding = await db.fundingScheme.create({
      data: {
        name: validated.name,
        slug: finalSlug,
        source: validated.source ?? null,
        year: validated.year,
        description: validated.description ?? null,
        requirements: validated.requirements ?? null,
        minBudget: validated.minBudget ?? null,
        maxBudget: validated.maxBudget ?? null,
        openDate: validated.openDate ? new Date(validated.openDate) : null,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        status: validated.status,
        guideFileUrl: validated.guideFileUrl ?? null,
        registrationUrl: validated.registrationUrl ?? null,
      },
    })

    return NextResponse.json({ success: true, data: funding }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_FUNDING_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create funding scheme' },
      { status: 500 }
    )
  }
}
