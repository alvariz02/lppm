import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: album, error } = await supabase
      .from('gallery_albums')
      .select('*, photos:gallery_photos(*)')
      .eq('id', id)
      .single()

    if (error || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Sort photos by created_at desc
    const sortedPhotos = (album.photos || []).sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ data: mapGalleryAlbum({ ...album, photos: sortedPhotos }) })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = galleryAlbumSchema.parse(body)

    const { data: existing } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const { data: slugConflict } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('slug', slug)
      .single()
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const { data: album, error } = await supabase
      .from('gallery_albums')
      .update({
        title: validated.title,
        slug: finalSlug,
        description: validated.description ?? null,
        cover_url: validated.coverUrl ?? null,
        category: validated.category ?? null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_GALLERY_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update album' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapGalleryAlbum({ ...album, photos: [] }) })
  } catch (error: unknown) {
    console.error('[API_ADMIN_GALLERY_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('gallery_albums').delete().eq('id', id)

    if (error) {
      console.error('[API_ADMIN_GALLERY_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete album' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Album deleted' })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    )
  }
}
