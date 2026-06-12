import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: reviewer, error } = await supabase
      .from('reviewers')
      .select('*, researcher:researchers(*)')
      .eq('id', id)
      .single()

    if (error || !reviewer) {
      return NextResponse.json({ error: 'Reviewer tidak ditemukan' }, { status: 404 })
    }

    // Fetch proposal reviews separately
    const { data: proposalReviews } = await supabase
      .from('proposal_reviews')
      .select('*, research:researches(id, title), service:community_services(id, title)')
      .eq('reviewer_id', id)

    const mappedReviews = (proposalReviews ?? []).map((rv: any) => ({
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
      research: rv.research ? { id: rv.research.id, title: rv.research.title } : null,
      service: rv.service ? { id: rv.service.id, title: rv.service.title } : null,
    }))

    return NextResponse.json({
      data: {
        ...mapReviewer(reviewer),
        proposalReviews: mappedReviews,
      },
    })
  } catch (error) {
    console.error('[REVIEWER_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data reviewer' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = reviewerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('reviewers')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Reviewer tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const { data: reviewer, error } = await supabase
      .from('reviewers')
      .update({
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
      .eq('id', id)
      .select('*, researcher:researchers(*)')
      .single()

    if (error) {
      console.error('[REVIEWER_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui reviewer' }, { status: 500 })
    }

    return NextResponse.json({ data: mapReviewer(reviewer) })
  } catch (error) {
    console.error('[REVIEWER_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui reviewer' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('reviewers')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Reviewer tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('reviewers').delete().eq('id', id)

    if (error) {
      console.error('[REVIEWER_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus reviewer' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Reviewer berhasil dihapus' })
  } catch (error) {
    console.error('[REVIEWER_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus reviewer' }, { status: 500 })
  }
}
