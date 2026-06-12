import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
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

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('document_categories')
      .select('id, name, slug, created_at, updated_at, documents:documents(count)', { count: 'exact' })
      .range(from, to)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[DOCUMENT_CATEGORIES_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data kategori dokumen' }, { status: 500 })
    }

    const mapped = (data ?? []).map((item: Record<string, unknown>) => {
      const docsAgg = item.documents as Array<Record<string, unknown>> | null
      const docsCount = Array.isArray(docsAgg) && docsAgg.length > 0 ? Number(docsAgg[0].count) : 0
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        _count: { documents: docsCount },
      }
    })

    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
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
    const { data: existing } = await supabase
      .from('document_categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Kategori dokumen dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('document_categories')
      .insert({ name: name.trim(), slug })
      .select('id, name, slug, created_at, updated_at, documents:documents(count)')
      .single()

    if (error) {
      console.error('[DOCUMENT_CATEGORIES_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat kategori dokumen' }, { status: 500 })
    }

    const item = data as Record<string, unknown>
    const docsAgg = item.documents as Array<Record<string, unknown>> | null
    const docsCount = Array.isArray(docsAgg) && docsAgg.length > 0 ? Number(docsAgg[0].count) : 0

    const mapped = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      _count: { documents: docsCount },
    }

    return NextResponse.json({ data: mapped }, { status: 201 })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORIES_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat kategori dokumen' }, { status: 500 })
  }
}
