import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { researchSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const research = await db.research.findUnique({
      where: { id },
      include: {
        leader: true,
        faculty: true,
        studyProgram: true,
        fundingScheme: true,
        members: { include: { researcher: true } },
        studentMembers: true,
        publications: true,
        proposalReviews: { include: { reviewer: true } },
      },
    })

    if (!research) {
      return NextResponse.json({ error: 'Penelitian tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: research })
  } catch (error) {
    console.error('[RESEARCH_GET_BY_ID]', error)
    return NextResponse.json({ error: 'Gagal memuat data penelitian' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = researchSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const existing = await db.research.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Penelitian tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data
    const slug = generateSlug(data.title)

    // Check slug uniqueness (exclude self)
    const slugConflict = await db.research.findFirst({
      where: { slug, id: { not: id } },
    })
    if (slugConflict) {
      return NextResponse.json(
        { error: 'Penelitian dengan judul tersebut sudah ada' },
        { status: 409 }
      )
    }

    const research = await db.research.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        abstract: data.abstract || null,
        year: data.year,
        fundingSchemeId: data.fundingSchemeId || null,
        leaderId: data.leaderId || null,
        facultyId: data.facultyId || null,
        studyProgramId: data.studyProgramId || null,
        fundingSource: data.fundingSource || null,
        budget: data.budget || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        outputs: data.outputs || null,
        mainImageUrl: data.mainImageUrl || null,
        documentUrl: data.documentUrl || null,
        isFeatured: data.isFeatured ?? false,
        isPublished: data.isPublished ?? true,
      },
      include: {
        leader: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true } },
        studyProgram: { select: { id: true, name: true } },
        fundingScheme: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ data: research })
  } catch (error) {
    console.error('[RESEARCH_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui penelitian' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.research.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Penelitian tidak ditemukan' }, { status: 404 })
    }

    await db.research.delete({ where: { id } })

    return NextResponse.json({ message: 'Penelitian berhasil dihapus' })
  } catch (error) {
    console.error('[RESEARCH_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus penelitian' }, { status: 500 })
  }
}
