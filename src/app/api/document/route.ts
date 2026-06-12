import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

function mapDocument(d: Record<string, unknown>) {
  return {
    id: d.id,
    categoryId: d.category_id ?? null,
    title: d.title,
    slug: d.slug,
    description: d.description ?? null,
    fileUrl: d.file_url ?? null,
    fileType: d.file_type ?? null,
    fileSize: d.file_size ?? null,
    downloadCount: d.download_count ?? 0,
    isActive: d.is_active ?? true,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    category: d.category ? { id: (d.category as Record<string, unknown>).id, name: (d.category as Record<string, unknown>).name, slug: (d.category as Record<string, unknown>).slug } : null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    let query = supabase
      .from('documents')
      .select('*, category:document_categories(id, name, slug)')
      .eq('is_active', true)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('[API_DOCUMENT_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapDocument)

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[API_DOCUMENT_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Fetch current download_count and increment
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('download_count')
      .eq('id', id)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const newCount = (doc.download_count || 0) + 1

    const { data, error } = await supabase
      .from('documents')
      .update({ download_count: newCount })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_DOCUMENT_PATCH]', error)
      return NextResponse.json(
        { error: 'Failed to update download count' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: mapDocument(data) })
  } catch (error) {
    console.error('[API_DOCUMENT_PATCH]', error)
    return NextResponse.json(
      { error: 'Failed to update download count' },
      { status: 500 }
    )
  }
}
