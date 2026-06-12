import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicationSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const publication = await db.publication.findUnique({
      where: { id },
      include: {
        research: { select: { id: true, title: true } },
        service: { select: { id: true, title: true } },
      },
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: publication })
  } catch (error) {
    console.error('[API_ADMIN_PUBLICATIONS_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch publication' },
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
    const validated = publicationSchema.parse(body)

    const existing = await db.publication.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const slugConflict = await db.publication.findUnique({ where: { slug } })
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const publication = await db.publication.update({
      where: { id },
      data: {
        title: validated.title,
        slug: finalSlug,
        publicationType: validated.publicationType,
        authors: validated.authors ?? null,
        publisherName: validated.publisherName ?? null,
        journalName: validated.journalName ?? null,
        year: validated.year,
        volume: validated.volume ?? null,
        number: validated.number ?? null,
        pages: validated.pages ?? null,
        issn: validated.issn ?? null,
        isbn: validated.isbn ?? null,
        doi: validated.doi ?? null,
        url: validated.url ?? null,
        indexing: validated.indexing ?? null,
        accreditation: validated.accreditation ?? null,
        researchId: validated.researchId ?? null,
        serviceId: validated.serviceId ?? null,
        isPublished: validated.isPublished ?? true,
      },
    })

    return NextResponse.json({ success: true, data: publication })
  } catch (error: unknown) {
    console.error('[API_ADMIN_PUBLICATIONS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update publication' },
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

    const existing = await db.publication.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    await db.publication.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Publication deleted' })
  } catch (error) {
    console.error('[API_ADMIN_PUBLICATIONS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete publication' },
      { status: 500 }
    )
  }
}
