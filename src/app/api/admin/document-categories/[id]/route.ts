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
      .from('document_categories')
      .select('id, name, slug, created_at, updated_at, documents:documents(count)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Kategori dokumen tidak ditemukan' }, { status: 404 })
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

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORY_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat kategori dokumen' }, { status: 500 })
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
      .from('document_categories')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Kategori dokumen tidak ditemukan' }, { status: 404 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness (exclude self)
    const { data: slugConflict } = await supabase
      .from('document_categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (slugConflict && slugConflict.id !== id) {
      return NextResponse.json(
        { error: 'Kategori dokumen dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('document_categories')
      .update({ name: name.trim(), slug })
      .eq('id', id)
      .select('id, name, slug, created_at, updated_at, documents:documents(count)')
      .single()

    if (error) {
      console.error('[DOCUMENT_CATEGORY_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui kategori dokumen' }, { status: 500 })
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

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORY_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui kategori dokumen' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing, error: existingError } = await supabase
      .from('document_categories')
      .select('id, name, slug, created_at, updated_at, documents:documents(count)')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Kategori dokumen tidak ditemukan' }, { status: 404 })
    }

    // Check if any documents use this category
    const item = existing as Record<string, unknown>
    const docsAgg = item.documents as Array<Record<string, unknown>> | null
    const docsCount = Array.isArray(docsAgg) && docsAgg.length > 0 ? Number(docsAgg[0].count) : 0

    if (docsCount > 0) {
      return NextResponse.json(
        { error: 'Kategori dokumen masih memiliki dokumen terkait. Hapus atau pindahkan dokumen terlebih dahulu.' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('document_categories').delete().eq('id', id)

    if (error) {
      console.error('[DOCUMENT_CATEGORY_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus kategori dokumen' }, { status: 500 })
    }

    return NextResponse.json({ data: { id } })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORY_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus kategori dokumen' }, { status: 500 })
  }
}
