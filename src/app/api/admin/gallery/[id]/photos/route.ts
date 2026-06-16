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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = `gallery-photos:get:${Date.now()}:${Math.random().toString(16).slice(2)}`
  try {
    const { id } = await params
    console.info('[API_ADMIN_GALLERY_PHOTOS_GET] request', {
      correlationId,
      albumId: id,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      xForwardedFor: request.headers.get('x-forwarded-for'),
    })

    const { data: photos, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('album_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API_ADMIN_GALLERY_PHOTOS_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      )
    }

    const mapped = (photos ?? []).map(mapGalleryPhoto)
    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_PHOTOS_GET] catch', {
      correlationId,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      xForwardedFor: request.headers.get('x-forwarded-for'),
      error,
    })
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = `gallery-photos:post:${Date.now()}:${Math.random().toString(16).slice(2)}`
  try {
    const { id } = await params
    const body = await request.json()

    console.info('[API_ADMIN_GALLERY_PHOTOS_POST] request', {
      correlationId,
      albumId: id,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      xForwardedFor: request.headers.get('x-forwarded-for'),
      payload: {
        imageUrl: typeof body?.imageUrl === 'string' ? body.imageUrl.slice(0, 120) : body?.imageUrl,
        caption: body?.caption ?? null,
      },
    })

    const validated = galleryPhotoSchema.parse(body)


    const { data: album } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('id', id)
      .single()

    if (!album) {
      console.warn('[API_ADMIN_GALLERY_PHOTOS_POST] album not found', {
        correlationId,
        albumId: id,
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
      })
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }


    const { data: photo, error } = await supabase
      .from('gallery_photos')
      .insert({
        album_id: id,
        image_url: validated.imageUrl,
        caption: validated.caption ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_GALLERY_PHOTOS_POST] supabase insert error', {
        correlationId,
        albumId: id,
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        xForwardedFor: request.headers.get('x-forwarded-for'),
        error,
      })
      return NextResponse.json(
        { error: 'Failed to add photo' },
        { status: 500 }
      )
    }

    console.info('[API_ADMIN_GALLERY_PHOTOS_POST] success', {
      correlationId,
      albumId: id,
      photoId: (photo as any)?.id,
      imageUrl: (photo as any)?.image_url,
    })

    return NextResponse.json({ success: true, data: mapGalleryPhoto(photo) }, { status: 201 })

  } catch (error: unknown) {
    console.error('[API_ADMIN_GALLERY_PHOTOS_POST] catch', {
      correlationId,
      albumId: id,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      xForwardedFor: request.headers.get('x-forwarded-for'),
      error,
    })

    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add photo' },
      { status: 500 }
    )
  }
}

