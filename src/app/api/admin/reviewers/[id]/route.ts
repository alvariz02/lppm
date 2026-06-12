import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviewerSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviewer = await db.reviewer.findUnique({
      where: { id },
      include: {
        researcher: true,
        proposalReviews: {
          include: {
            research: { select: { id: true, title: true } },
            service: { select: { id: true, title: true } },
          },
        },
      },
    })

    if (!reviewer) {
      return NextResponse.json({ error: 'Reviewer tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: reviewer })
  } catch (error) {
    console.error('[REVIEWER_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data reviewer' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = reviewerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const existing = await db.reviewer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Reviewer tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const reviewer = await db.reviewer.update({
      where: { id },
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

    return NextResponse.json({ data: reviewer })
  } catch (error) {
    console.error('[REVIEWER_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui reviewer' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.reviewer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Reviewer tidak ditemukan' }, { status: 404 })
    }

    await db.reviewer.delete({ where: { id } })

    return NextResponse.json({ message: 'Reviewer berhasil dihapus' })
  } catch (error) {
    console.error('[REVIEWER_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus reviewer' }, { status: 500 })
  }
}
