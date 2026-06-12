import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

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
    category: n.category ? { id: (n.category as Record<string, unknown>).id, name: (n.category as Record<string, unknown>).name, slug: (n.category as Record<string, unknown>).slug } : null,
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
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('news')
      .select('*, category:news_categories(id, name, slug)', { count: 'exact' })
      .eq('status', 'published')
      .range(from, to)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    query = query.order('published_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_NEWS_GET]', error)
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
    console.error('[API_NEWS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
