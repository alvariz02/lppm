import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { generateSlug } from '@/lib/helpers'

function mapStudyProgram(sp: Record<string, unknown>) {
  return {
    id: sp.id,
    name: sp.name,
    slug: sp.slug,
    facultyId: sp.faculty_id ?? null,
    createdAt: sp.created_at,
    updatedAt: sp.updated_at,
    faculty: sp.faculty ? mapFaculty(sp.faculty as Record<string, unknown>) : null,
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

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('study_programs')
      .select('*, faculty:faculties(*)', { count: 'exact' })
      .range(from, to)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (facultyId) {
      query = query.eq('faculty_id', facultyId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[STUDY_PROGRAMS_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data program studi' }, { status: 500 })
    }

    const mapped = (data ?? []).map(mapStudyProgram)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[STUDY_PROGRAMS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data program studi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, facultyId } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama program studi wajib diisi' }, { status: 400 })
    }
    if (!facultyId) {
      return NextResponse.json({ error: 'Fakultas wajib dipilih' }, { status: 400 })
    }

    // Verify faculty exists
    const { data: faculty } = await supabase
      .from('faculties')
      .select('id')
      .eq('id', facultyId)
      .single()

    if (!faculty) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 400 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('study_programs')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Program studi dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data: studyProgram, error } = await supabase
      .from('study_programs')
      .insert({ name: name.trim(), slug, faculty_id: facultyId })
      .select('*, faculty:faculties(*)')
      .single()

    if (error) {
      console.error('[STUDY_PROGRAMS_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat program studi' }, { status: 500 })
    }

    return NextResponse.json({ data: mapStudyProgram(studyProgram) }, { status: 201 })
  } catch (error) {
    console.error('[STUDY_PROGRAMS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat program studi' }, { status: 500 })
  }
}
