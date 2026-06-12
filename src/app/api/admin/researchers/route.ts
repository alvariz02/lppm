import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { researcherSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const facultyId = searchParams.get('facultyId') || ''
    const isActive = searchParams.get('isActive') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nidn: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (facultyId) {
      where.facultyId = facultyId
    }
    if (isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const [data, total] = await Promise.all([
      db.researcher.findMany({
        where,
        include: {
          faculty: true,
          studyProgram: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.researcher.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[RESEARCHERS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data peneliti' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = researcherSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    const researcher = await db.researcher.create({
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

    return NextResponse.json({ data: researcher }, { status: 201 })
  } catch (error) {
    console.error('[RESEARCHERS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat peneliti' }, { status: 500 })
  }
}
