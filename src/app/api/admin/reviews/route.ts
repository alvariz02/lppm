import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const proposalReviewSchema = z.object({
  proposalType: z.enum(['research', 'community_service']),
  researchId: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
  reviewerId: z.string().min(1, 'Reviewer wajib dipilih'),
  score: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['waiting', 'reviewing', 'revision', 'accepted', 'rejected']).default('waiting'),
  reviewFileUrl: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const proposalType = searchParams.get('proposalType') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { research: { title: { contains: search } } },
        { service: { title: { contains: search } } },
        { reviewer: { name: { contains: search } } },
      ]
    }
    if (status) {
      where.status = status
    }
    if (proposalType) {
      where.proposalType = proposalType
    }

    const [data, total] = await Promise.all([
      db.proposalReview.findMany({
        where,
        include: {
          research: { select: { id: true, title: true } },
          service: { select: { id: true, title: true } },
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.proposalReview.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[REVIEWS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data review' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = proposalReviewSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    const review = await db.proposalReview.create({
      data: {
        proposalType: data.proposalType,
        researchId: data.researchId || null,
        serviceId: data.serviceId || null,
        reviewerId: data.reviewerId,
        score: data.score ?? null,
        notes: data.notes || null,
        status: data.status,
        reviewFileUrl: data.reviewFileUrl || null,
        reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : null,
      },
      include: {
        research: { select: { id: true, title: true } },
        service: { select: { id: true, title: true } },
        reviewer: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error) {
    console.error('[REVIEWS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat review' }, { status: 500 })
  }
}
