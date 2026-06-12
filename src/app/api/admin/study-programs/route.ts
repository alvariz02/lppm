import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const facultyId = searchParams.get('facultyId') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.name = { contains: search }
    }
    if (facultyId) {
      where.facultyId = facultyId
    }

    const [data, total] = await Promise.all([
      db.studyProgram.findMany({
        where,
        include: { faculty: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.studyProgram.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[STUDY_PROGRAMS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data program studi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, facultyId } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama program studi wajib diisi' }, { status: 400 })
    }
    if (!facultyId) {
      return NextResponse.json({ error: 'Fakultas wajib dipilih' }, { status: 400 })
    }

    // Verify faculty exists
    const faculty = await db.faculty.findUnique({ where: { id: facultyId } })
    if (!faculty) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 400 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness
    const existing = await db.studyProgram.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Program studi dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const studyProgram = await db.studyProgram.create({
      data: { name: name.trim(), slug, facultyId },
      include: { faculty: true },
    })

    return NextResponse.json({ data: studyProgram }, { status: 201 })
  } catch (error) {
    console.error('[STUDY_PROGRAMS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat program studi' }, { status: 500 })
  }
}
