import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reviewers')
      .select('*, researcher:researchers(*)')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('[API_REVIEWER_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviewers' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapReviewer)
    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[API_REVIEWER_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewers' },
      { status: 500 }
    )
  }
}
