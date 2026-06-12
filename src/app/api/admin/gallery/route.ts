import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { galleryAlbumSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapGalleryAlbum(a: Record<string, unknown>) {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    description: a.description ?? null,
    coverUrl: a.cover_url ?? null,
    category: a.category ?? null,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    photoCount: a.photoCount as number | undefined,
    _count: a._count as { photos: number } | undefined,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('gallery_albums')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (category) {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_GALLERY_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery albums' },
        { status: 500 }
      )
    }

    // Get photo counts
    const albumIds = (data ?? []).map((a: any) => a.id)
    let photoCountMap: Record<string, number> = {}
    if (albumIds.length > 0) {
      const { data: photoCounts } = await supabase
        .from('gallery_photos')
        .select('album_id')
        .in('album_id', albumIds)
      photoCountMap = (photoCounts || []).reduce((acc: Record<string, number>, p: any) => {
        acc[p.album_id] = (acc[p.album_id] || 0) + 1
        return acc
      }, {})
    }

    const albums = (data ?? []).map((album: any) => ({
      ...mapGalleryAlbum(album),
      photoCount: photoCountMap[album.id] || 0,
      _count: { photos: photoCountMap[album.id] || 0 },
    }))

    const total = count ?? 0

    return NextResponse.json({
      data: albums,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery albums' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = galleryAlbumSchema.parse(body)

    const slug = generateSlug(validated.title)
    const { data: existing } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data: album, error } = await supabase
      .from('gallery_albums')
      .insert({
        title: validated.title,
        slug: finalSlug,
        description: validated.description ?? null,
        cover_url: validated.coverUrl ?? null,
        category: validated.category ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_GALLERY_POST]', error)
      return NextResponse.json(
        { error: 'Failed to create gallery album' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapGalleryAlbum({ ...album, photoCount: 0, _count: { photos: 0 } }) }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_GALLERY_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create gallery album' },
      { status: 500 }
    )
  }
}
