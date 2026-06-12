import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { publicationSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapPublication(r: any) {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    publicationType: r.publication_type,
    authors: r.authors,
    publisherName: r.publisher_name,
    journalName: r.journal_name,
    year: r.year,
    volume: r.volume,
    number: r.number,
    pages: r.pages,
    issn: r.issn,
    isbn: r.isbn,
    doi: r.doi,
    url: r.url,
    indexing: r.indexing,
    accreditation: r.accreditation,
    fileUrl: r.file_url,
    researchId: r.research_id,
    serviceId: r.service_id,
    isPublished: r.is_published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: publication, error } = await supabase
      .from('publications')
      .select(
        '*, research:research!research_id(id, title), service:community_services!service_id(id, title)'
      )
      .eq('id', id)
      .single()

    if (error || !publication) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    const result = {
      ...mapPublication(publication),
      research: publication.research || null,
      service: publication.service || null,
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[API_ADMIN_PUBLICATIONS_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch publication' },
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
    const validated = publicationSchema.parse(body)

    const { data: existing } = await supabase
      .from('publications')
      .select('id')
      .eq('id', id)
      .single()
    if (!existing) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const { data: slugConflict } = await supabase
      .from('publications')
      .select('id')
      .eq('slug', slug)
      .limit(1)
    const finalSlug = slugConflict && slugConflict.length > 0 && slugConflict[0].id !== id
      ? `${slug}-${Date.now()}`
      : slug

    const { data: publication, error } = await supabase
      .from('publications')
      .update({
        title: validated.title,
        slug: finalSlug,
        publication_type: validated.publicationType,
        authors: validated.authors ?? null,
        publisher_name: validated.publisherName ?? null,
        journal_name: validated.journalName ?? null,
        year: validated.year,
        volume: validated.volume ?? null,
        number: validated.number ?? null,
        pages: validated.pages ?? null,
        issn: validated.issn ?? null,
        isbn: validated.isbn ?? null,
        doi: validated.doi ?? null,
        url: validated.url ?? null,
        indexing: validated.indexing ?? null,
        accreditation: validated.accreditation ?? null,
        file_url: validated.fileUrl ?? null,
        research_id: validated.researchId ?? null,
        service_id: validated.serviceId ?? null,
        is_published: validated.isPublished ?? true,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_PUBLICATIONS_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update publication' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapPublication(publication) })
  } catch (error: unknown) {
    console.error('[API_ADMIN_PUBLICATIONS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update publication' },
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

    const { data: existing } = await supabase
      .from('publications')
      .select('id')
      .eq('id', id)
      .single()
    if (!existing) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('publications').delete().eq('id', id)
    if (error) {
      console.error('[API_ADMIN_PUBLICATIONS_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete publication' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Publication deleted' })
  } catch (error) {
    console.error('[API_ADMIN_PUBLICATIONS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete publication' },
      { status: 500 }
    )
  }
}
