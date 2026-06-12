import { supabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
  }
}

function mapResearcher(r: any) {
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    nidn: r.nidn,
    photoUrl: r.photo_url,
    expertise: r.expertise,
    email: r.email,
  }
}

function mapFundingScheme(r: any) {
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    source: r.source,
    year: r.year,
  }
}

function mapFaculty(r: any) {
  if (!r) return null
  return { id: r.id, name: r.name, slug: r.slug }
}

function mapStudyProgram(r: any) {
  if (!r) return null
  return { id: r.id, name: r.name, slug: r.slug }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data: research, error } = await supabase
      .from('research')
      .select('*, leader:researchers!leader_id(*), funding_scheme:funding_schemes!funding_scheme_id(*), faculty:faculties!faculty_id(*), study_program:study_programs!study_program_id(*)')
      .eq('slug', slug)
      .single()

    if (error || !research || !research.is_published) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    // Fetch members separately
    const { data: members } = await supabase
      .from('research_members')
      .select('*, researcher:researchers(id, name, nidn, photo_url)')
      .eq('research_id', research.id)

    // Fetch student members
    const { data: studentMembers } = await supabase
      .from('research_student_members')
      .select('*')
      .eq('research_id', research.id)

    // Fetch publications
    const { data: publications } = await supabase
      .from('publications')
      .select('id, title, slug, publication_type, year')
      .eq('research_id', research.id)

    const mappedMembers = (members || []).map((m: any) => ({
      ...m,
      researcher: m.researcher ? {
        id: m.researcher.id,
        name: m.researcher.name,
        nidn: m.researcher.nidn,
        photoUrl: m.researcher.photo_url,
      } : null,
    }))

    const mappedPublications = (publications || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      publicationType: p.publication_type,
      year: p.year,
    }))

    const result = {
      ...mapResearch(research),
      leader: mapResearcher(research.leader),
      fundingScheme: mapFundingScheme(research.funding_scheme),
      faculty: mapFaculty(research.faculty),
      studyProgram: mapStudyProgram(research.study_program),
      members: mappedMembers,
      studentMembers: studentMembers || [],
      publications: mappedPublications,
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[API_RESEARCH_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
