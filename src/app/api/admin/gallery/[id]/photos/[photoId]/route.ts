import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { galleryPhotoSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { photoId } = await params
    const body = await request.json()
    const validated = galleryPhotoSchema.parse(body)

    const existing = await db.galleryPhoto.findUnique({ where: { id: photoId } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const photo = await db.galleryPhoto.update({
      where: { id: photoId },
      data: {
        imageUrl: validated.imageUrl,
        caption: validated.caption ?? null,
      },
    })

    return NextResponse.json({ success: true, data: photo })
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

    const existing = await db.galleryPhoto.findUnique({ where: { id: photoId } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    await db.galleryPhoto.delete({ where: { id: photoId } })

    return NextResponse.json({ success: true, message: 'Photo deleted' })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_PHOTOS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
