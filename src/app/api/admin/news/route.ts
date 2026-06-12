import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { newsSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const isFeatured = searchParams.get('isFeatured')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== '') {
      where.isFeatured = isFeatured === 'true'
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.news.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.news.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_NEWS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = newsSchema.parse(body)

    const slug = generateSlug(validated.title)
    const existing = await db.news.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const news = await db.news.create({
      data: {
        title: validated.title,
        slug: finalSlug,
        categoryId: validated.categoryId ?? null,
        excerpt: validated.excerpt ?? null,
        content: validated.content,
        imageUrl: validated.imageUrl ?? null,
        status: validated.status,
        isFeatured: validated.isFeatured ?? false,
        seoTitle: validated.seoTitle ?? null,
        seoDescription: validated.seoDescription ?? null,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : (validated.status === 'published' ? new Date() : null),
      },
    })

    return NextResponse.json({ success: true, data: news }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_NEWS_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    )
  }
}
