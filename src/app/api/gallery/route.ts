import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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
    photos: a.photos ? (a.photos as Record<string, unknown>[]).map(mapGalleryPhoto) : [],
  }
}

function mapGalleryPhoto(p: Record<string, unknown>) {
  return {
    id: p.id,
    albumId: p.album_id ?? null,
    imageUrl: p.image_url,
    caption: p.caption ?? null,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('gallery_albums')
      .select('*, photos:gallery_photos(*)')

    if (category) {
      query = query.eq('category', category)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('[API_GALLERY_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery' },
        { status: 500 }
      )
    }

    // Sort photos by created_at asc within each album
    const mapped = (data ?? []).map((album: any) => ({
      ...mapGalleryAlbum({
        ...album,
        photos: (album.photos || []).sort((a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }),
    }))

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[API_GALLERY_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}
