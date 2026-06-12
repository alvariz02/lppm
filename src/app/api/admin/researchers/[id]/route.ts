import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { researcherSchema } from '@/lib/validations'

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
    faculty: r.faculty ? mapFaculty(r.faculty as Record<string, unknown>) : null,
    studyProgram: r.study_program ? mapStudyProgram(r.study_program as Record<string, unknown>) : null,
    _count: r._count as Record<string, number> | undefined,
  }
}

function mapFaculty(f: Record<string, unknown>) {
  return {
    id: f.id,
    name: f.name,
    slug: f.slug,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  }
}

function mapStudyProgram(sp: Record<string, unknown>) {
  return {
    id: sp.id,
    name: sp.name,
    slug: sp.slug,
    facultyId: sp.faculty_id ?? null,
    createdAt: sp.created_at,
    updatedAt: sp.updated_at,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: researcher, error } = await supabase
      .from('researchers')
      .select('*, faculty:faculties(*), studyProgram:study_programs(*)')
      .eq('id', id)
      .single()

    if (error || !researcher) {
      return NextResponse.json({ error: 'Peneliti tidak ditemukan' }, { status: 404 })
    }

    // Get counts separately
    const [researchLeader, researchMembers, serviceLeader, serviceMembers, publicationAuthors] = await Promise.all([
      supabase.from('research_members').select('id', { count: 'exact', head: true }).eq('researcher_id', id).eq('role', 'ketua'),
      supabase.from('research_members').select('id', { count: 'exact', head: true }).eq('researcher_id', id).eq('role', 'anggota'),
      supabase.from('community_service_members').select('id', { count: 'exact', head: true }).eq('researcher_id', id).eq('role', 'ketua'),
      supabase.from('community_service_members').select('id', { count: 'exact', head: true }).eq('researcher_id', id).eq('role', 'anggota'),
      supabase.from('publication_authors').select('id', { count: 'exact', head: true }).eq('researcher_id', id),
    ])

    return NextResponse.json({
      data: {
        ...mapResearcher(researcher),
        _count: {
          researchLeader: researchLeader.count ?? 0,
          researchMembers: researchMembers.count ?? 0,
          serviceLeader: serviceLeader.count ?? 0,
          serviceMembers: serviceMembers.count ?? 0,
          publicationAuthors: publicationAuthors.count ?? 0,
        },
      },
    })
  } catch (error) {
    console.error('[RESEARCHER_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data peneliti' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = researcherSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('researchers')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Peneliti tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    const { data: researcher, error } = await supabase
      .from('researchers')
      .update({
        name: data.name,
        nidn: data.nidn || null,
        nip: data.nip || null,
        degree: data.degree || null,
        functional_position: data.functionalPosition || null,
        faculty_id: data.facultyId || null,
        study_program_id: data.studyProgramId || null,
        expertise: data.expertise || null,
        email: data.email || null,
        phone: data.phone || null,
        google_scholar_url: data.googleScholarUrl || null,
        sinta_id: data.sintaId || null,
        scopus_id: data.scopusId || null,
        orcid_id: data.orcidId || null,
        photo_url: data.photoUrl || null,
        is_active: data.isActive ?? true,
      })
      .eq('id', id)
      .select('*, faculty:faculties(*), studyProgram:study_programs(*)')
      .single()

    if (error) {
      console.error('[RESEARCHER_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui peneliti' }, { status: 500 })
    }

    return NextResponse.json({ data: mapResearcher(researcher) })
  } catch (error) {
    console.error('[RESEARCHER_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui peneliti' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('researchers')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Peneliti tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('researchers').delete().eq('id', id)

    if (error) {
      console.error('[RESEARCHER_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus peneliti' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Peneliti berhasil dihapus' })
  } catch (error) {
    console.error('[RESEARCHER_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus peneliti' }, { status: 500 })
  }
}
