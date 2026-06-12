import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: studyProgram, error } = await supabase
      .from('study_programs')
      .select('*, faculty:faculties(*)')
      .eq('id', id)
      .single()

    if (error || !studyProgram) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    // Get counts
    const [researchers, researches, communityServices] = await Promise.all([
      supabase.from('researchers').select('id', { count: 'exact', head: true }).eq('study_program_id', id),
      supabase.from('researches').select('id', { count: 'exact', head: true }).eq('study_program_id', id),
      supabase.from('community_services').select('id', { count: 'exact', head: true }).eq('study_program_id', id),
    ])

    return NextResponse.json({
      data: {
        ...mapStudyProgram(studyProgram),
        _count: {
          researchers: researchers.count ?? 0,
          researches: researches.count ?? 0,
          communityServices: communityServices.count ?? 0,
        },
      },
    })
  } catch (error) {
    console.error('[STUDY_PROGRAM_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data program studi' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, facultyId } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama program studi wajib diisi' }, { status: 400 })
    }
    if (!facultyId) {
      return NextResponse.json({ error: 'Fakultas wajib dipilih' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('study_programs')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
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

    // Check slug uniqueness (exclude self)
    const { data: slugConflict } = await supabase
      .from('study_programs')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Program studi dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data: studyProgram, error } = await supabase
      .from('study_programs')
      .update({ name: name.trim(), slug, faculty_id: facultyId })
      .eq('id', id)
      .select('*, faculty:faculties(*)')
      .single()

    if (error) {
      console.error('[STUDY_PROGRAM_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui program studi' }, { status: 500 })
    }

    return NextResponse.json({ data: mapStudyProgram(studyProgram) })
  } catch (error) {
    console.error('[STUDY_PROGRAM_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui program studi' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('study_programs')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('study_programs').delete().eq('id', id)

    if (error) {
      console.error('[STUDY_PROGRAM_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus program studi' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Program studi berhasil dihapus' })
  } catch (error) {
    console.error('[STUDY_PROGRAM_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus program studi' }, { status: 500 })
  }
}
