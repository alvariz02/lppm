import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { z } from 'zod'

const proposalReviewSchema = z.object({
  proposalType: z.enum(['research', 'community_service']),
  researchId: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
  reviewerId: z.string().min(1, 'Reviewer wajib dipilih'),
  score: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['waiting', 'reviewing', 'revision', 'accepted', 'rejected']).default('waiting'),
  reviewFileUrl: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
})

function mapProposalReview(rv: Record<string, unknown>) {
  return {
    id: rv.id,
    proposalType: rv.proposal_type,
    researchId: rv.research_id ?? null,
    serviceId: rv.service_id ?? null,
    reviewerId: rv.reviewer_id,
    score: rv.score ?? null,
    notes: rv.notes ?? null,
    status: rv.status,
    reviewFileUrl: rv.review_file_url ?? null,
    reviewedAt: rv.reviewed_at ?? null,
    createdAt: rv.created_at,
    updatedAt: rv.updated_at,
    research: rv.research ? { id: (rv.research as Record<string, unknown>).id, title: (rv.research as Record<string, unknown>).title } : null,
    service: rv.service ? { id: (rv.service as Record<string, unknown>).id, title: (rv.service as Record<string, unknown>).title } : null,
    reviewer: rv.reviewer ? { id: (rv.reviewer as Record<string, unknown>).id, name: (rv.reviewer as Record<string, unknown>).name } : null,
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
    const status = searchParams.get('status') || ''
    const proposalType = searchParams.get('proposalType') || ''

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('proposal_reviews')
      .select('*, reviewer:reviewers(id, name)', { count: 'exact' })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
    }
    if (proposalType) {
      query = query.eq('proposal_type', proposalType)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[REVIEWS_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data review' }, { status: 500 })
    }

    // Fetch related research/service titles separately
    const reviewData = data ?? []
    const researchIds = reviewData.filter((r: any) => r.research_id).map((r: any) => r.research_id)
    const serviceIds = reviewData.filter((r: any) => r.service_id).map((r: any) => r.service_id)

    let researchMap: Record<string, { id: string; title: string }> = {}
    let serviceMap: Record<string, { id: string; title: string }> = {}

    if (researchIds.length > 0) {
      const { data: researches } = await supabase
        .from('researches')
        .select('id, title')
        .in('id', researchIds)
      researchMap = (researches || []).reduce((acc: Record<string, any>, r: any) => {
        acc[r.id] = { id: r.id, title: r.title }
        return acc
      }, {})
    }

    if (serviceIds.length > 0) {
      const { data: services } = await supabase
        .from('community_services')
        .select('id, title')
        .in('id', serviceIds)
      serviceMap = (services || []).reduce((acc: Record<string, any>, s: any) => {
        acc[s.id] = { id: s.id, title: s.title }
        return acc
      }, {})
    }

    // Apply search filter on results if search was provided
    let filteredData = reviewData.map((rv: any) => ({
      ...rv,
      research: researchMap[rv.research_id] || null,
      service: serviceMap[rv.service_id] || null,
    }))

    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter((rv: any) => {
        const researchTitle = rv.research?.title?.toLowerCase() || ''
        const serviceTitle = rv.service?.title?.toLowerCase() || ''
        const reviewerName = rv.reviewer?.name?.toLowerCase() || ''
        return (
          researchTitle.includes(searchLower) ||
          serviceTitle.includes(searchLower) ||
          reviewerName.includes(searchLower)
        )
      })
    }

    const mapped = filteredData.map(mapProposalReview)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[REVIEWS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data review' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = proposalReviewSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    const { data: review, error } = await supabase
      .from('proposal_reviews')
      .insert({
        proposal_type: data.proposalType,
        research_id: data.researchId || null,
        service_id: data.serviceId || null,
        reviewer_id: data.reviewerId,
        score: data.score ?? null,
        notes: data.notes || null,
        status: data.status,
        review_file_url: data.reviewFileUrl || null,
        reviewed_at: data.reviewedAt || null,
      })
      .select('*, reviewer:reviewers(id, name)')
      .single()

    if (error) {
      console.error('[REVIEWS_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat review' }, { status: 500 })
    }

    // Fetch related research/service
    let research = null
    let service = null

    if (review.research_id) {
      const { data: r } = await supabase.from('researches').select('id, title').eq('id', review.research_id).single()
      research = r
    }
    if (review.service_id) {
      const { data: s } = await supabase.from('community_services').select('id, title').eq('id', review.service_id).single()
      service = s
    }

    return NextResponse.json({ data: mapProposalReview({ ...review, research, service }) }, { status: 201 })
  } catch (error) {
    console.error('[REVIEWS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat review' }, { status: 500 })
  }
}
