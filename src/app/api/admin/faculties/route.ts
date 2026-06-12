import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { generateSlug } from '@/lib/helpers'

function mapFaculty(f: Record<string, unknown>) {
  return {
    id: f.id,
    name: f.name,
    slug: f.slug,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
    _count: f._count as { studyPrograms: number } | undefined,
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

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('faculties')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[FACULTIES_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data fakultas' }, { status: 500 })
    }

    // Get study program counts
    const facultyIds = (data ?? []).map((f: any) => f.id)
    let spCountMap: Record<string, number> = {}
    if (facultyIds.length > 0) {
      const { data: spCounts } = await supabase
        .from('study_programs')
        .select('faculty_id')
        .in('faculty_id', facultyIds)
      spCountMap = (spCounts || []).reduce((acc: Record<string, number>, sp: any) => {
        acc[sp.faculty_id] = (acc[sp.faculty_id] || 0) + 1
        return acc
      }, {})
    }

    const mapped = (data ?? []).map((f: any) => ({
      ...mapFaculty(f),
      _count: { studyPrograms: spCountMap[f.id] || 0 },
    }))

    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[FACULTIES_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data fakultas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama fakultas wajib diisi' }, { status: 400 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('faculties')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Fakultas dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data: faculty, error } = await supabase
      .from('faculties')
      .insert({ name: name.trim(), slug })
      .select()
      .single()

    if (error) {
      console.error('[FACULTIES_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat fakultas' }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        ...mapFaculty(faculty),
        _count: { studyPrograms: 0 },
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[FACULTIES_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat fakultas' }, { status: 500 })
  }
}
