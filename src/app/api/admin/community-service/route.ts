import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { communityServiceSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapCommunityService(r: any) {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    location: r.location,
    village: r.village,
    district: r.district,
    regency: r.regency,
    year: r.year,
    fundingSchemeId: r.funding_scheme_id,
    leaderId: r.leader_id,
    facultyId: r.faculty_id,
    studyProgramId: r.study_program_id,
    partnerName: r.partner_name,
    fundingSource: r.funding_source,
    budget: r.budget,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status,
    outputs: r.outputs,
    impact: r.impact,
    mainImageUrl: r.main_image_url,
    documentUrl: r.document_url,
    isFeatured: r.is_featured,
    isPublished: r.is_published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    leader: r.leader || null,
    faculty: r.faculty || null,
    studyProgram: r.study_program || null,
    fundingScheme: r.funding_scheme || null,
  }
}

function mapNestedResearcher(r: any) {
  if (!r) return null
  return { id: r.id, name: r.name }
}

function mapNestedEntity(r: any) {
  if (!r) return null
  return { id: r.id, name: r.name }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const year = searchParams.get('year') || ''
    const status = searchParams.get('status') || ''
    const facultyId = searchParams.get('facultyId') || ''

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('community_services')
      .select(
        '*, leader:researchers!leader_id(id, name), faculty:faculties!faculty_id(id, name), study_program:study_programs!study_program_id(id, name), funding_scheme:funding_schemes!funding_scheme_id(id, name)',
        { count: 'exact' }
      )
      .range(from, to)

    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,partner_name.ilike.%${search}%`)
    }
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (facultyId) {
      query = query.eq('faculty_id', facultyId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[COMMUNITY_SERVICE_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data pengabdian' }, { status: 500 })
    }

    const mappedData = (data || []).map((r: any) => ({
      ...mapCommunityService(r),
      leader: mapNestedResearcher(r.leader),
      faculty: mapNestedEntity(r.faculty),
      studyProgram: mapNestedEntity(r.study_program),
      fundingScheme: mapNestedEntity(r.funding_scheme),
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
    console.error('[COMMUNITY_SERVICE_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data pengabdian' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = communityServiceSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data
    const slug = generateSlug(data.title)

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('community_services')
      .select('id')
      .eq('slug', slug)
      .limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Pengabdian dengan judul tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data: service, error } = await supabase
      .from('community_services')
      .insert({
        title: data.title,
        slug,
        summary: data.summary || null,
        location: data.location || null,
        village: data.village || null,
        district: data.district || null,
        regency: data.regency || null,
        year: data.year,
        funding_scheme_id: data.fundingSchemeId || null,
        leader_id: data.leaderId || null,
        faculty_id: data.facultyId || null,
        study_program_id: data.studyProgramId || null,
        partner_name: data.partnerName || null,
        funding_source: data.fundingSource || null,
        budget: data.budget || null,
        start_date: data.startDate ? new Date(data.startDate).toISOString() : null,
        end_date: data.endDate ? new Date(data.endDate).toISOString() : null,
        status: data.status,
        outputs: data.outputs || null,
        impact: data.impact || null,
        main_image_url: data.mainImageUrl || null,
        document_url: data.documentUrl || null,
        is_featured: data.isFeatured ?? false,
        is_published: data.isPublished ?? true,
      })
      .select(
        '*, leader:researchers!leader_id(id, name), faculty:faculties!faculty_id(id, name), study_program:study_programs!study_program_id(id, name), funding_scheme:funding_schemes!funding_scheme_id(id, name)'
      )
      .single()

    if (error) {
      console.error('[COMMUNITY_SERVICE_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat pengabdian' }, { status: 500 })
    }

    const mapped = {
      ...mapCommunityService(service),
      leader: mapNestedResearcher(service.leader),
      faculty: mapNestedEntity(service.faculty),
      studyProgram: mapNestedEntity(service.study_program),
      fundingScheme: mapNestedEntity(service.funding_scheme),
    }

    return NextResponse.json({ data: mapped }, { status: 201 })
  } catch (error) {
    console.error('[COMMUNITY_SERVICE_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat pengabdian' }, { status: 500 })
  }
}
