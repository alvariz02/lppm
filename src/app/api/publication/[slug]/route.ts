import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const publication = await db.publication.findUnique({
      where: { slug },
      include: {
        research: {
          select: { id: true, title: true, slug: true, year: true },
        },
        service: {
          select: { id: true, title: true, slug: true, year: true },
        },
        publicationAuthors: {
          include: {
            researcher: {
              select: { id: true, name: true, nidn: true, photoUrl: true },
            },
          },
        },
      },
    })

    if (!publication || !publication.isPublished) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: publication })
  } catch (error) {
    console.error('[API_PUBLICATION_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
