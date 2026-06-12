import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const facultyId = searchParams.get('facultyId') || ''
    const isActive = searchParams.get('isActive') || ''

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('researchers')
      .select('*, faculty:faculties(*), studyProgram:study_programs(*)', { count: 'exact' })
      .range(from, to)

    if (search) {
      query = query.or(`name.ilike.%${search}%,nidn.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (facultyId) {
      query = query.eq('faculty_id', facultyId)
    }
    if (isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[RESEARCHERS_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data peneliti' }, { status: 500 })
    }

    const mapped = (data ?? []).map(mapResearcher)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[RESEARCHERS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data peneliti' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = researcherSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    const { data: researcher, error } = await supabase
      .from('researchers')
      .insert({
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
      .select('*, faculty:faculties(*), studyProgram:study_programs(*)')
      .single()

    if (error) {
      console.error('[RESEARCHERS_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat peneliti' }, { status: 500 })
    }

    return NextResponse.json({ data: mapResearcher(researcher) }, { status: 201 })
  } catch (error) {
    console.error('[RESEARCHERS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat peneliti' }, { status: 500 })
  }
}
