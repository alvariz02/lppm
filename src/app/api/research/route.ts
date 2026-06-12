import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

function mapResearch(r: any) {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    abstract: r.abstract,
    year: r.year,
    fundingSchemeId: r.funding_scheme_id,
    leaderId: r.leader_id,
    facultyId: r.faculty_id,
    studyProgramId: r.study_program_id,
    fundingSource: r.funding_source,
    budget: r.budget,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status,
    outputs: r.outputs,
    mainImageUrl: r.main_image_url,
    documentUrl: r.document_url,
    isFeatured: r.is_featured,
    isPublished: r.is_published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    leader: r.leader || null,
    faculty: r.faculty || null,
    fundingScheme: r.funding_scheme || null,
    members: r.members || [],
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
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const fundingSchemeId = searchParams.get('fundingSchemeId')
    const facultyId = searchParams.get('facultyId')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('research')
      .select(
        '*, leader:researchers!leader_id(id, name, nidn, photo_url, expertise), faculty:faculties!faculty_id(id, name, slug), funding_scheme:funding_schemes!funding_scheme_id(id, name, slug, source, year)',
        { count: 'exact' }
      )
      .eq('is_published', true)
      .range(from, to)

    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (fundingSchemeId) {
      query = query.eq('funding_scheme_id', fundingSchemeId)
    }
    if (facultyId) {
      query = query.eq('faculty_id', facultyId)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_RESEARCH_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch research data' },
        { status: 500 }
      )
    }

    // Fetch members for each research
    const researchIds = (data || []).map((r: any) => r.id)
    let membersData: any[] = []
    if (researchIds.length > 0) {
      const { data: members } = await supabase
        .from('research_members')
        .select('*, researcher:researchers(id, name, nidn, photo_url)')
        .in('research_id', researchIds)
      membersData = members || []
    }

    const mappedData = (data || []).map((r: any) => {
      const researchMembers = membersData.filter((m: any) => m.research_id === r.id)
      return {
        ...mapResearch(r),
        members: researchMembers,
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
    console.error('[API_RESEARCH_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch research data' },
      { status: 500 }
    )
  }
}
