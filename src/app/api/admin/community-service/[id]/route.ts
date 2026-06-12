import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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
  }
}

function mapResearcher(r: any) {
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    nidn: r.nidn,
    nip: r.nip,
    degree: r.degree,
    functionalPosition: r.functional_position,
    facultyId: r.faculty_id,
    studyProgramId: r.study_program_id,
    expertise: r.expertise,
    email: r.email,
    phone: r.phone,
    googleScholarUrl: r.google_scholar_url,
    sintaId: r.sinta_id,
    scopusId: r.scopus_id,
    orcidId: r.orcid_id,
    photoUrl: r.photo_url,
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function mapFaculty(r: any) {
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function mapStudyProgram(r: any) {
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    facultyId: r.faculty_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
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
    description: r.description,
    requirements: r.requirements,
    minBudget: r.min_budget,
    maxBudget: r.max_budget,
    openDate: r.open_date,
    deadline: r.deadline,
    status: r.status,
    guideFileUrl: r.guide_file_url,
    registrationUrl: r.registration_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: service, error } = await supabase
      .from('community_services')
      .select('*, leader:researchers!leader_id(*), faculty:faculties(*), study_program:study_programs(*), funding_scheme:funding_schemes(*)')
      .eq('id', id)
      .single()

    if (error || !service) {
      return NextResponse.json({ error: 'Pengabdian tidak ditemukan' }, { status: 404 })
    }

    // Fetch members separately
    const { data: members } = await supabase
      .from('community_service_members')
      .select('*, researcher:researchers(*)')
      .eq('service_id', id)

    // Fetch student members
    const { data: studentMembers } = await supabase
      .from('community_service_student_members')
      .select('*')
      .eq('service_id', id)

    // Fetch publications
    const { data: publications } = await supabase
      .from('publications')
      .select('*')
      .eq('service_id', id)

    // Fetch proposal reviews
    const { data: proposalReviews } = await supabase
      .from('proposal_reviews')
      .select('*, reviewer:reviewers(*)')
      .eq('service_id', id)

    const mappedMembers = (members || []).map((m: any) => ({
      ...m,
      researcher: mapResearcher(m.researcher),
    }))

    const mappedPublications = (publications || []).map((p: any) => ({
      ...p,
      publicationType: p.publication_type,
      publisherName: p.publisher_name,
      journalName: p.journal_name,
      fileUrl: p.file_url,
      researchId: p.research_id,
      serviceId: p.service_id,
      isPublished: p.is_published,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))

    const result = {
      ...mapCommunityService(service),
      leader: mapResearcher(service.leader),
      faculty: mapFaculty(service.faculty),
      studyProgram: mapStudyProgram(service.study_program),
      fundingScheme: mapFundingScheme(service.funding_scheme),
      members: mappedMembers,
      studentMembers: studentMembers || [],
      publications: mappedPublications,
      proposalReviews: proposalReviews || [],
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[COMMUNITY_SERVICE_GET_BY_ID]', error)
    return NextResponse.json({ error: 'Gagal memuat data pengabdian' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = communityServiceSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('community_services')
      .select('id')
      .eq('id', id)
      .single()
    if (!existing) {
      return NextResponse.json({ error: 'Pengabdian tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data
    const slug = generateSlug(data.title)

    // Check slug uniqueness (exclude self)
    const { data: slugConflict } = await supabase
      .from('community_services')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .limit(1)
    if (slugConflict && slugConflict.length > 0) {
      return NextResponse.json(
        { error: 'Pengabdian dengan judul tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data: service, error } = await supabase
      .from('community_services')
      .update({
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
      .eq('id', id)
      .select(
        '*, leader:researchers!leader_id(id, name), faculty:faculties!faculty_id(id, name), study_program:study_programs!study_program_id(id, name), funding_scheme:funding_schemes!funding_scheme_id(id, name)'
      )
      .single()

    if (error) {
      console.error('[COMMUNITY_SERVICE_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui pengabdian' }, { status: 500 })
    }

    const mapped = {
      ...mapCommunityService(service),
      leader: mapNestedResearcher(service.leader),
      faculty: mapNestedEntity(service.faculty),
      studyProgram: mapNestedEntity(service.study_program),
      fundingScheme: mapNestedEntity(service.funding_scheme),
    }

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[COMMUNITY_SERVICE_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui pengabdian' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('community_services')
      .select('id')
      .eq('id', id)
      .single()
    if (!existing) {
      return NextResponse.json({ error: 'Pengabdian tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('community_services').delete().eq('id', id)
    if (error) {
      console.error('[COMMUNITY_SERVICE_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus pengabdian' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pengabdian berhasil dihapus' })
  } catch (error) {
    console.error('[COMMUNITY_SERVICE_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus pengabdian' }, { status: 500 })
  }
}
