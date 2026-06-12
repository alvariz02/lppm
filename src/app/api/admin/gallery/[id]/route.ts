import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { galleryAlbumSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const album = await db.galleryAlbum.findUnique({
      where: { id },
      include: { photos: { orderBy: { createdAt: 'desc' } } },
    })

    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: album })
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

    const existing = await db.galleryAlbum.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const slugConflict = await db.galleryAlbum.findUnique({ where: { slug } })
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const album = await db.galleryAlbum.update({
      where: { id },
      data: {
        title: validated.title,
        slug: finalSlug,
        description: validated.description ?? null,
        coverUrl: validated.coverUrl ?? null,
        category: validated.category ?? null,
      },
    })

    return NextResponse.json({ success: true, data: album })
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

    const existing = await db.galleryAlbum.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    await db.galleryAlbum.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Album deleted' })
  } catch (error) {
    console.error('[API_ADMIN_GALLERY_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    )
  }
}
