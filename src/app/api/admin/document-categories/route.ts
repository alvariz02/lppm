import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.name = { contains: search }
    }

    const [data, total] = await Promise.all([
      db.documentCategory.findMany({
        where,
        include: {
          _count: { select: { documents: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.documentCategory.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORIES_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data kategori dokumen' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness
    const existing = await db.documentCategory.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Kategori dokumen dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const category = await db.documentCategory.create({
      data: { name: name.trim(), slug },
      include: { _count: { select: { documents: true } } },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORIES_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat kategori dokumen' }, { status: 500 })
  }
}
