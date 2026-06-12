import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
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
    const isPublished = searchParams.get('isPublished')
    const search = searchParams.get('search')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('publications')
      .select(
        '*, research:research!research_id(id, title), service:community_services!service_id(id, title)',
        { count: 'exact' }
      )
      .range(from, to)

    if (publicationType) {
      query = query.eq('publication_type', publicationType)
    }
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (isPublished !== null && isPublished !== undefined && isPublished !== '') {
      query = query.eq('is_published', isPublished === 'true')
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,authors.ilike.%${search}%,journal_name.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_PUBLICATIONS_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch publications' },
        { status: 500 }
      )
    }

    const mappedData = (data || []).map((r: any) => ({
      ...mapPublication(r),
      research: r.research || null,
      service: r.service || null,
    }))

    const total = count ?? 0

    return NextResponse.json({
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_PUBLICATIONS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = publicationSchema.parse(body)

    const slug = generateSlug(validated.title)
    const { data: existing } = await supabase
      .from('publications')
      .select('id')
      .eq('slug', slug)
      .limit(1)
    const finalSlug = existing && existing.length > 0 ? `${slug}-${Date.now()}` : slug

    const { data: publication, error } = await supabase
      .from('publications')
      .insert({
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
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_PUBLICATIONS_POST]', error)
      return NextResponse.json(
        { error: 'Failed to create publication' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapPublication(publication) }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_PUBLICATIONS_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create publication' },
      { status: 500 }
    )
  }
}
