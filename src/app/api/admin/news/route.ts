import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { newsSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapNews(n: Record<string, unknown>) {
  return {
    id: n.id,
    categoryId: n.category_id ?? null,
    title: n.title,
    slug: n.slug,
    excerpt: n.excerpt ?? null,
    content: n.content,
    imageUrl: n.image_url ?? null,
    status: n.status,
    isFeatured: n.is_featured ?? false,
    seoTitle: n.seo_title ?? null,
    seoDescription: n.seo_description ?? null,
    publishedAt: n.published_at ?? null,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
    category: n.category ? { id: (n.category as Record<string, unknown>).id, name: (n.category as Record<string, unknown>).name } : null,
  }
}

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

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('news')
      .select('*, category:news_categories(id, name)', { count: 'exact' })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== '') {
      query = query.eq('is_featured', isFeatured === 'true')
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_NEWS_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch news' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapNews)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
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
    const { data: existing } = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('news')
      .insert({
        title: validated.title,
        slug: finalSlug,
        category_id: validated.categoryId ?? null,
        excerpt: validated.excerpt ?? null,
        content: validated.content,
        image_url: validated.imageUrl ?? null,
        status: validated.status,
        is_featured: validated.isFeatured ?? false,
        seo_title: validated.seoTitle ?? null,
        seo_description: validated.seoDescription ?? null,
        published_at: validated.publishedAt
          ? new Date(validated.publishedAt).toISOString()
          : validated.status === 'published'
            ? new Date().toISOString()
            : null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_NEWS_POST]', error)
      return NextResponse.json(
        { error: 'Failed to create news' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapNews(data) }, { status: 201 })
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
