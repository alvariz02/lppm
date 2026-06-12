import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { researchSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const year = searchParams.get('year') || ''
    const status = searchParams.get('status') || ''
    const facultyId = searchParams.get('facultyId') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { fundingSource: { contains: search } },
      ]
    }
    if (year) {
      where.year = parseInt(year)
    }
    if (status) {
      where.status = status
    }
    if (facultyId) {
      where.facultyId = facultyId
    }

    const [data, total] = await Promise.all([
      db.research.findMany({
        where,
        include: {
          leader: { select: { id: true, name: true } },
          faculty: { select: { id: true, name: true } },
          studyProgram: { select: { id: true, name: true } },
          fundingScheme: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.research.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[RESEARCH_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data penelitian' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = researchSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data
    const slug = generateSlug(data.title)

    // Check slug uniqueness
    const existing = await db.research.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Penelitian dengan judul tersebut sudah ada' },
        { status: 409 }
      )
    }

    const research = await db.research.create({
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

    return NextResponse.json({ data: research }, { status: 201 })
  } catch (error) {
    console.error('[RESEARCH_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat penelitian' }, { status: 500 })
  }
}
