import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { reviewerSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const reviewerType = searchParams.get('reviewerType') || ''
    const isActive = searchParams.get('isActive') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nidn: { contains: search } },
        { email: { contains: search } },
        { institution: { contains: search } },
      ]
    }
    if (reviewerType) {
      where.reviewerType = reviewerType
    }
    if (isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const [data, total] = await Promise.all([
      db.reviewer.findMany({
        where,
        include: {
          researcher: true,
          _count: { select: { proposalReviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.reviewer.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[REVIEWERS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data reviewer' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = reviewerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    const reviewer = await db.reviewer.create({
      data: {
        researcherId: data.researcherId || null,
        name: data.name,
        nidn: data.nidn || null,
        nip: data.nip || null,
        email: data.email || null,
        phone: data.phone || null,
        institution: data.institution || null,
        expertise: data.expertise || null,
        reviewerType: data.reviewerType,
        isActive: data.isActive ?? true,
      },
      include: { researcher: true },
    })

    return NextResponse.json({ data: reviewer }, { status: 201 })
  } catch (error) {
    console.error('[REVIEWERS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat reviewer' }, { status: 500 })
  }
}
