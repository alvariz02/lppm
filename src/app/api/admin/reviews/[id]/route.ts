import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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
    reviewer: rv.reviewer ? mapReviewer(rv.reviewer as Record<string, unknown>) : null,
  }
}

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
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: review, error } = await supabase
      .from('proposal_reviews')
      .select('*, reviewer:reviewers(*)')
      .eq('id', id)
      .single()

    if (error || !review) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 })
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

    return NextResponse.json({ data: mapProposalReview({ ...review, research, service }) })
  } catch (error) {
    console.error('[REVIEW_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data review' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = proposalReviewSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('proposal_reviews')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const { data: review, error } = await supabase
      .from('proposal_reviews')
      .update({
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
      .eq('id', id)
      .select('*, reviewer:reviewers(id, name)')
      .single()

    if (error) {
      console.error('[REVIEW_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui review' }, { status: 500 })
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

    return NextResponse.json({ data: mapProposalReview({ ...review, research, service }) })
  } catch (error) {
    console.error('[REVIEW_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui review' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('proposal_reviews')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('proposal_reviews').delete().eq('id', id)

    if (error) {
      console.error('[REVIEW_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus review' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Review berhasil dihapus' })
  } catch (error) {
    console.error('[REVIEW_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus review' }, { status: 500 })
  }
}
