import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { reviewerSchema } from '@/lib/validations'

function mapReviewer(r: Record<string, unknown>) {
  return {
    id: r.id,
    researcherId: r.researcher_id ?? null,
    name: r.name,
    nidn: r.nidn ?? null,
    nip: r.nip ?? null,
    email: r.email ?? null,
    phone: r.phone ?? null,
    institution: r.institution ?? null,
    expertise: r.expertise ?? null,
    reviewerType: r.reviewer_type,
    isActive: r.is_active ?? true,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    researcher: r.researcher ? mapResearcher(r.researcher as Record<string, unknown>) : null,
    _count: r._count as { proposalReviews: number } | undefined,
  }
}

function mapResearcher(r: Record<string, unknown>) {
  return {
    id: r.id,
    nidn: r.nidn ?? null,
    nip: r.nip ?? null,
    name: r.name,
    degree: r.degree ?? null,
    functionalPosition: r.functional_position ?? null,
    facultyId: r.faculty_id ?? null,
    studyProgramId: r.study_program_id ?? null,
    expertise: r.expertise ?? null,
    email: r.email ?? null,
    phone: r.phone ?? null,
    googleScholarUrl: r.google_scholar_url ?? null,
    sintaId: r.sinta_id ?? null,
    scopusId: r.scopus_id ?? null,
    orcidId: r.orcid_id ?? null,
    photoUrl: r.photo_url ?? null,
    isActive: r.is_active ?? true,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
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
    const reviewerType = searchParams.get('reviewerType') || ''
    const isActive = searchParams.get('isActive') || ''

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('reviewers')
      .select('*, researcher:researchers(*)', { count: 'exact' })
      .range(from, to)

    if (search) {
      query = query.or(`name.ilike.%${search}%,nidn.ilike.%${search}%,email.ilike.%${search}%,institution.ilike.%${search}%`)
    }
    if (reviewerType) {
      query = query.eq('reviewer_type', reviewerType)
    }
    if (isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[REVIEWERS_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data reviewer' }, { status: 500 })
    }

    // Get proposal review counts for each reviewer
    const reviewerIds = (data ?? []).map((r: any) => r.id)
    let reviewCountMap: Record<string, number> = {}
    if (reviewerIds.length > 0) {
      const { data: reviewCounts } = await supabase
        .from('proposal_reviews')
        .select('reviewer_id')
        .in('reviewer_id', reviewerIds)
      reviewCountMap = (reviewCounts || []).reduce((acc: Record<string, number>, rv: any) => {
        acc[rv.reviewer_id] = (acc[rv.reviewer_id] || 0) + 1
        return acc
      }, {})
    }

    const mapped = (data ?? []).map((r: any) => ({
      ...mapReviewer(r),
      _count: { proposalReviews: reviewCountMap[r.id] || 0 },
    }))

    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[REVIEWERS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data reviewer' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = reviewerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    const { data: reviewer, error } = await supabase
      .from('reviewers')
      .insert({
        researcher_id: data.researcherId || null,
        name: data.name,
        nidn: data.nidn || null,
        nip: data.nip || null,
        email: data.email || null,
        phone: data.phone || null,
        institution: data.institution || null,
        expertise: data.expertise || null,
        reviewer_type: data.reviewerType,
        is_active: data.isActive ?? true,
      })
      .select('*, researcher:researchers(*)')
      .single()

    if (error) {
      console.error('[REVIEWERS_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat reviewer' }, { status: 500 })
    }

    return NextResponse.json({ data: mapReviewer(reviewer) }, { status: 201 })
  } catch (error) {
    console.error('[REVIEWERS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat reviewer' }, { status: 500 })
  }
}
