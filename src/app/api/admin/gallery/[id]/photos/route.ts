import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { galleryPhotoSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const photos = await db.galleryPhoto.findMany({
      where: { albumId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: photos })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_PHOTOS_GET]', error)
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
  try {
    const { id } = await params
    const body = await request.json()
    const validated = galleryPhotoSchema.parse(body)

    const album = await db.galleryAlbum.findUnique({ where: { id } })
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    const photo = await db.galleryPhoto.create({
      data: {
        albumId: id,
        imageUrl: validated.imageUrl,
        caption: validated.caption ?? null,
      },
    })

    return NextResponse.json({ success: true, data: photo }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_GALLERY_PHOTOS_POST]', error)
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
