import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const faculty = await db.faculty.findUnique({
      where: { id },
      include: {
        studyPrograms: { orderBy: { name: 'asc' } },
        _count: { select: { researchers: true, researches: true, communityServices: true } },
      },
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: faculty })
  } catch (error) {
    console.error('[FACULTY_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data fakultas' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama fakultas wajib diisi' }, { status: 400 })
    }

    const existing = await db.faculty.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 404 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness (exclude self)
    const slugConflict = await db.faculty.findFirst({
      where: { slug, id: { not: id } },
    })
    if (slugConflict) {
      return NextResponse.json(
        { error: 'Fakultas dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const faculty = await db.faculty.update({
      where: { id },
      data: { name: name.trim(), slug },
      include: { _count: { select: { studyPrograms: true } } },
    })

    return NextResponse.json({ data: faculty })
  } catch (error) {
    console.error('[FACULTY_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui fakultas' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.faculty.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 404 })
    }

    await db.faculty.delete({ where: { id } })

    return NextResponse.json({ message: 'Fakultas berhasil dihapus' })
  } catch (error) {
    console.error('[FACULTY_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus fakultas' }, { status: 500 })
  }
}
