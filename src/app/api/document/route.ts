import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const data = await db.document.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API_DOCUMENT_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const document = await db.document.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    })

    return NextResponse.json({ data: document })
  } catch (error) {
    console.error('[API_DOCUMENT_PATCH]', error)
    return NextResponse.json(
      { error: 'Failed to update download count' },
      { status: 500 }
    )
  }
}
