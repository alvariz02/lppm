import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
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

    const where: Record<string, unknown> = {}
    if (search) {
      where.name = { contains: search }
    }

    const [data, total] = await Promise.all([
      db.newsCategory.findMany({
        where,
        include: {
          _count: { select: { news: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.newsCategory.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[NEWS_CATEGORIES_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data kategori berita' }, { status: 500 })
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
    const existing = await db.newsCategory.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Kategori berita dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const category = await db.newsCategory.create({
      data: { name: name.trim(), slug },
      include: { _count: { select: { news: true } } },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    console.error('[NEWS_CATEGORIES_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat kategori berita' }, { status: 500 })
  }
}
