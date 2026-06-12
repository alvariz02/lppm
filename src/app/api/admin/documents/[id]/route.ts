import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('documents')
      .select('*, category:document_categories(id, name)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapDocument(data) })
  } catch (error) {
    console.error('[API_ADMIN_DOCUMENTS_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
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
    const validated = documentSchema.parse(body)

    const { data: existing, error: existingError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const { data: slugConflict } = await supabase
      .from('documents')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('documents')
      .update({
        title: validated.title,
        slug: finalSlug,
        category_id: validated.categoryId ?? null,
        description: validated.description ?? null,
        file_url: validated.fileUrl ?? null,
        file_type: validated.fileType ?? null,
        file_size: validated.fileSize ?? null,
        is_active: validated.isActive ?? true,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_DOCUMENTS_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapDocument(data) })
  } catch (error: unknown) {
    console.error('[API_ADMIN_DOCUMENTS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update document' },
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
      .from('documents')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('documents').delete().eq('id', id)

    if (error) {
      console.error('[API_ADMIN_DOCUMENTS_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    console.error('[API_ADMIN_DOCUMENTS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
