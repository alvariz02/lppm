import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const fundingScheme = await db.fundingScheme.findUnique({
      where: { slug },
      include: {
        researches: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            year: true,
            status: true,
            leader: { select: { id: true, name: true } },
          },
        },
        communityServices: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            year: true,
            status: true,
            leader: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!fundingScheme) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: fundingScheme })
  } catch (error) {
    console.error('[API_FUNDING_SCHEME_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
