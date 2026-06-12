import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { newsSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const news = await db.news.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: news })
  } catch (error) {
    console.error('[API_ADMIN_NEWS_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = newsSchema.parse(body)

    const existing = await db.news.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const slugConflict = await db.news.findUnique({ where: { slug } })
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const news = await db.news.update({
      where: { id },
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
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : (validated.status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt),
      },
    })

    return NextResponse.json({ success: true, data: news })
  } catch (error: unknown) {
    console.error('[API_ADMIN_NEWS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.news.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }

    await db.news.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'News deleted' })
  } catch (error) {
    console.error('[API_ADMIN_NEWS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    )
  }
}
