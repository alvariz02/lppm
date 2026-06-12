import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { documentSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

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
    category: d.category ? { id: (d.category as Record<string, unknown>).id, name: (d.category as Record<string, unknown>).name } : null,
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
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('documents')
      .select('*, category:document_categories(id, name)', { count: 'exact' })
      .range(from, to)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_DOCUMENTS_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapDocument)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_DOCUMENTS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = documentSchema.parse(body)

    const slug = generateSlug(validated.title)
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: validated.title,
        slug: finalSlug,
        category_id: validated.categoryId ?? null,
        description: validated.description ?? null,
        file_url: validated.fileUrl ?? null,
        file_type: validated.fileType ?? null,
        file_size: validated.fileSize ?? null,
        is_active: validated.isActive ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_DOCUMENTS_POST]', error)
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapDocument(data) }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_DOCUMENTS_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
