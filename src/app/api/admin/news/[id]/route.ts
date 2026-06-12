import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('news')
      .select('*, category:news_categories(id, name)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapNews(data) })
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

    const { data: existing, error: existingError } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const { data: slugConflict } = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('news')
      .update({
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
          : validated.status === 'published' && !existing.published_at
            ? new Date().toISOString()
            : existing.published_at,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_NEWS_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update news' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapNews(data) })
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

    const { data: existing, error: existingError } = await supabase
      .from('news')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('news').delete().eq('id', id)

    if (error) {
      console.error('[API_ADMIN_NEWS_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete news' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'News deleted' })
  } catch (error) {
    console.error('[API_ADMIN_NEWS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    )
  }
}
