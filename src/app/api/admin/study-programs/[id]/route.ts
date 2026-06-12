import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const studyProgram = await db.studyProgram.findUnique({
      where: { id },
      include: {
        faculty: true,
        _count: { select: { researchers: true, researches: true, communityServices: true } },
      },
    })

    if (!studyProgram) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: studyProgram })
  } catch (error) {
    console.error('[STUDY_PROGRAM_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data program studi' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, facultyId } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama program studi wajib diisi' }, { status: 400 })
    }
    if (!facultyId) {
      return NextResponse.json({ error: 'Fakultas wajib dipilih' }, { status: 400 })
    }

    const existing = await db.studyProgram.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    // Verify faculty exists
    const faculty = await db.faculty.findUnique({ where: { id: facultyId } })
    if (!faculty) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 400 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness (exclude self)
    const slugConflict = await db.studyProgram.findFirst({
      where: { slug, id: { not: id } },
    })
    if (slugConflict) {
      return NextResponse.json(
        { error: 'Program studi dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const studyProgram = await db.studyProgram.update({
      where: { id },
      data: { name: name.trim(), slug, facultyId },
      include: { faculty: true },
    })

    return NextResponse.json({ data: studyProgram })
  } catch (error) {
    console.error('[STUDY_PROGRAM_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui program studi' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.studyProgram.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    await db.studyProgram.delete({ where: { id } })

    return NextResponse.json({ message: 'Program studi berhasil dihapus' })
  } catch (error) {
    console.error('[STUDY_PROGRAM_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus program studi' }, { status: 500 })
  }
}
