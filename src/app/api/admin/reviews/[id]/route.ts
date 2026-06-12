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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const review = await db.proposalReview.findUnique({
      where: { id },
      include: {
        research: { select: { id: true, title: true } },
        service: { select: { id: true, title: true } },
        reviewer: true,
      },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: review })
  } catch (error) {
    console.error('[REVIEW_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data review' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = proposalReviewSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const existing = await db.proposalReview.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const review = await db.proposalReview.update({
      where: { id },
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

    return NextResponse.json({ data: review })
  } catch (error) {
    console.error('[REVIEW_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui review' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.proposalReview.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 })
    }

    await db.proposalReview.delete({ where: { id } })

    return NextResponse.json({ message: 'Review berhasil dihapus' })
  } catch (error) {
    console.error('[REVIEW_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus review' }, { status: 500 })
  }
}
