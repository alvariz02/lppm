import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documentSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const document = await db.document.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: document })
  } catch (error) {
    console.error('[API_ADMIN_DOCUMENTS_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
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
    const validated = documentSchema.parse(body)

    const existing = await db.document.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.title)
    const slugConflict = await db.document.findUnique({ where: { slug } })
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const document = await db.document.update({
      where: { id },
      data: {
        title: validated.title,
        slug: finalSlug,
        categoryId: validated.categoryId ?? null,
        description: validated.description ?? null,
        fileUrl: validated.fileUrl ?? null,
        fileType: validated.fileType ?? null,
        fileSize: validated.fileSize ?? null,
        isActive: validated.isActive ?? true,
      },
    })

    return NextResponse.json({ success: true, data: document })
  } catch (error: unknown) {
    console.error('[API_ADMIN_DOCUMENTS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update document' },
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

    const existing = await db.document.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    await db.document.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    console.error('[API_ADMIN_DOCUMENTS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
