import { supabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data: publication, error } = await supabase
      .from('publications')
      .select(
        '*, research:research!research_id(id, title, slug, year), service:community_services!service_id(id, title, slug, year)'
      )
      .eq('slug', slug)
      .single()

    if (error || !publication || !publication.is_published) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    // Fetch publication authors
    const { data: publicationAuthors } = await supabase
      .from('publication_authors')
      .select('*, researcher:researchers(id, name, nidn, photo_url)')
      .eq('publication_id', publication.id)

    const mappedAuthors = (publicationAuthors || []).map((a: any) => ({
      ...a,
      researcher: a.researcher ? {
        id: a.researcher.id,
        name: a.researcher.name,
        nidn: a.researcher.nidn,
        photoUrl: a.researcher.photo_url,
      } : null,
    }))

    const result = {
      ...mapPublication(publication),
      research: publication.research || null,
      service: publication.service || null,
      publicationAuthors: mappedAuthors,
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[API_PUBLICATION_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
