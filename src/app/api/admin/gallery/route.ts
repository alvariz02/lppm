import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { galleryAlbumSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

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

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.galleryAlbum.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { photos: true } },
        },
      }),
      db.galleryAlbum.count({ where }),
    ])

    const albums = data.map((album) => ({
      ...album,
      photoCount: album._count.photos,
    }))

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
    const existing = await db.galleryAlbum.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const album = await db.galleryAlbum.create({
      data: {
        title: validated.title,
        slug: finalSlug,
        description: validated.description ?? null,
        coverUrl: validated.coverUrl ?? null,
        category: validated.category ?? null,
      },
    })

    return NextResponse.json({ success: true, data: album }, { status: 201 })
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
