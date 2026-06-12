import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

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
    research: r.research || null,
    service: r.service || null,
    publicationAuthors: r.publication_authors || [],
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
    const publicationType = searchParams.get('publicationType')
    const year = searchParams.get('year')
    const search = searchParams.get('search')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('publications')
      .select(
        '*, research:research!research_id(id, title, slug), service:community_services!service_id(id, title, slug)',
        { count: 'exact' }
      )
      .eq('is_published', true)
      .range(from, to)

    if (publicationType) {
      query = query.eq('publication_type', publicationType)
    }
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_PUBLICATION_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch publications' },
        { status: 500 }
      )
    }

    // Fetch publication authors for each publication
    const publicationIds = (data || []).map((r: any) => r.id)
    let authorsData: any[] = []
    if (publicationIds.length > 0) {
      const { data: authors } = await supabase
        .from('publication_authors')
        .select('*, researcher:researchers(id, name, nidn)')
        .in('publication_id', publicationIds)
        .order('author_order', { ascending: true })
      authorsData = authors || []
    }

    const mappedData = (data || []).map((r: any) => {
      const pubAuthors = authorsData
        .filter((a: any) => a.publication_id === r.id)
        .map((a: any) => ({
          ...a,
          researcher: a.researcher ? {
            id: a.researcher.id,
            name: a.researcher.name,
            nidn: a.researcher.nidn,
          } : null,
        }))
      return {
        ...mapPublication(r),
        publicationAuthors: pubAuthors,
      }
    })

    const total = count ?? 0

    return NextResponse.json({
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_PUBLICATION_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  }
}
