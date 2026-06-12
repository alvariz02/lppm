import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('news_categories')
      .select('id, name, slug, created_at, updated_at, news:news(count)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Kategori berita tidak ditemukan' }, { status: 404 })
    }

    const item = data as Record<string, unknown>
    const newsAgg = item.news as Array<Record<string, unknown>> | null
    const newsCount = Array.isArray(newsAgg) && newsAgg.length > 0 ? Number(newsAgg[0].count) : 0

    const mapped = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      _count: { news: newsCount },
    }

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[NEWS_CATEGORY_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data kategori berita' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    const { data: existing, error: existingError } = await supabase
      .from('news_categories')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Kategori berita tidak ditemukan' }, { status: 404 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness (exclude self)
    const { data: slugConflict } = await supabase
      .from('news_categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Kategori berita dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('news_categories')
      .update({ name: name.trim(), slug })
      .eq('id', id)
      .select('id, name, slug, created_at, updated_at, news:news(count)')
      .single()

    if (error) {
      console.error('[NEWS_CATEGORY_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui kategori berita' }, { status: 500 })
    }

    const item = data as Record<string, unknown>
    const newsAgg = item.news as Array<Record<string, unknown>> | null
    const newsCount = Array.isArray(newsAgg) && newsAgg.length > 0 ? Number(newsAgg[0].count) : 0

    const mapped = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      _count: { news: newsCount },
    }

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[NEWS_CATEGORY_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui kategori berita' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing, error: existingError } = await supabase
      .from('news_categories')
      .select('id, name, slug, created_at, updated_at, news:news(count)')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Kategori berita tidak ditemukan' }, { status: 404 })
    }

    // Check if any news uses this category
    const item = existing as Record<string, unknown>
    const newsAgg = item.news as Array<Record<string, unknown>> | null
    const newsCount = Array.isArray(newsAgg) && newsAgg.length > 0 ? Number(newsAgg[0].count) : 0

    if (newsCount > 0) {
      return NextResponse.json(
        { error: `Kategori ini masih digunakan oleh ${newsCount} berita. Hapus atau pindahkan berita terlebih dahulu.` },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('news_categories').delete().eq('id', id)

    if (error) {
      console.error('[NEWS_CATEGORY_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus kategori berita' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Kategori berita berhasil dihapus' })
  } catch (error) {
    console.error('[NEWS_CATEGORY_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus kategori berita' }, { status: 500 })
  }
}
