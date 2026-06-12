import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { researcherSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const researcher = await db.researcher.findUnique({
      where: { id },
      include: {
        faculty: true,
        studyProgram: true,
        _count: {
          select: {
            researchLeader: true,
            researchMembers: true,
            serviceLeader: true,
            serviceMembers: true,
            publicationAuthors: true,
          },
        },
      },
    })

    if (!researcher) {
      return NextResponse.json({ error: 'Peneliti tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: researcher })
  } catch (error) {
    console.error('[RESEARCHER_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data peneliti' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = researcherSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const existing = await db.researcher.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Peneliti tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const researcher = await db.researcher.update({
      where: { id },
      data: {
        name: data.name,
        nidn: data.nidn || null,
        nip: data.nip || null,
        degree: data.degree || null,
        functionalPosition: data.functionalPosition || null,
        facultyId: data.facultyId || null,
        studyProgramId: data.studyProgramId || null,
        expertise: data.expertise || null,
        email: data.email || null,
        phone: data.phone || null,
        googleScholarUrl: data.googleScholarUrl || null,
        sintaId: data.sintaId || null,
        scopusId: data.scopusId || null,
        orcidId: data.orcidId || null,
        photoUrl: data.photoUrl || null,
        isActive: data.isActive ?? true,
      },
      include: { faculty: true, studyProgram: true },
    })

    return NextResponse.json({ data: researcher })
  } catch (error) {
    console.error('[RESEARCHER_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui peneliti' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.researcher.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Peneliti tidak ditemukan' }, { status: 404 })
    }

    await db.researcher.delete({ where: { id } })

    return NextResponse.json({ message: 'Peneliti berhasil dihapus' })
  } catch (error) {
    console.error('[RESEARCHER_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus peneliti' }, { status: 500 })
  }
}
