import { supabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data, error } = await supabase
      .from('news')
      .select('*, category:news_categories(id, name, slug)')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    if (data.status !== 'published') {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapNews(data) })
  } catch (error) {
    console.error('[API_NEWS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
