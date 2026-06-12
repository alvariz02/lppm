import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { galleryPhotoSchema } from '@/lib/validations'

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { photoId } = await params
    const body = await request.json()
    const validated = galleryPhotoSchema.parse(body)

    const { data: existing } = await supabase
      .from('gallery_photos')
      .select('id')
      .eq('id', photoId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const { data: photo, error } = await supabase
      .from('gallery_photos')
      .update({
        image_url: validated.imageUrl,
        caption: validated.caption ?? null,
      })
      .eq('id', photoId)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_GALLERY_PHOTOS_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapGalleryPhoto(photo) })
  } catch (error: unknown) {
    console.error('[API_ADMIN_GALLERY_PHOTOS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { photoId } = await params

    const { data: existing } = await supabase
      .from('gallery_photos')
      .select('id')
      .eq('id', photoId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('gallery_photos').delete().eq('id', photoId)

    if (error) {
      console.error('[API_ADMIN_GALLERY_PHOTOS_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Photo deleted' })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_PHOTOS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
