import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

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

    const { data: faculty, error } = await supabase
      .from('faculties')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !faculty) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 404 })
    }

    // Get study programs for this faculty
    const { data: studyPrograms } = await supabase
      .from('study_programs')
      .select('*')
      .eq('faculty_id', id)
      .order('name', { ascending: true })

    // Get counts
    const [researchers, researches, communityServices] = await Promise.all([
      supabase.from('researchers').select('id', { count: 'exact', head: true }).eq('faculty_id', id),
      supabase.from('researches').select('id', { count: 'exact', head: true }).eq('faculty_id', id),
      supabase.from('community_services').select('id', { count: 'exact', head: true }).eq('faculty_id', id),
    ])

    return NextResponse.json({
      data: {
        ...mapFaculty(faculty),
        studyPrograms: (studyPrograms ?? []).map(mapStudyProgram),
        _count: {
          researchers: researchers.count ?? 0,
          researches: researches.count ?? 0,
          communityServices: communityServices.count ?? 0,
        },
      },
    })
  } catch (error) {
    console.error('[FACULTY_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data fakultas' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama fakultas wajib diisi' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('faculties')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 404 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness (exclude self)
    const { data: slugConflict } = await supabase
      .from('faculties')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Fakultas dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data: faculty, error } = await supabase
      .from('faculties')
      .update({ name: name.trim(), slug })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[FACULTY_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui fakultas' }, { status: 500 })
    }

    // Get study program count
    const { count: spCount } = await supabase
      .from('study_programs')
      .select('id', { count: 'exact', head: true })
      .eq('faculty_id', id)

    return NextResponse.json({
      data: {
        ...mapFaculty(faculty),
        _count: { studyPrograms: spCount ?? 0 },
      },
    })
  } catch (error) {
    console.error('[FACULTY_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui fakultas' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('faculties')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('faculties').delete().eq('id', id)

    if (error) {
      console.error('[FACULTY_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus fakultas' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Fakultas berhasil dihapus' })
  } catch (error) {
    console.error('[FACULTY_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus fakultas' }, { status: 500 })
  }
}
