import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const research = await db.research.findUnique({
      where: { slug },
      include: {
        leader: {
          select: { id: true, name: true, nidn: true, photoUrl: true, expertise: true, email: true },
        },
        fundingScheme: {
          select: { id: true, name: true, slug: true, source: true, year: true },
        },
        faculty: {
          select: { id: true, name: true, slug: true },
        },
        studyProgram: {
          select: { id: true, name: true, slug: true },
        },
        members: {
          include: {
            researcher: {
              select: { id: true, name: true, nidn: true, photoUrl: true },
            },
          },
        },
        studentMembers: true,
        publications: {
          select: { id: true, title: true, slug: true, publicationType: true, year: true },
        },
      },
    })

    if (!research || !research.isPublished) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: research })
  } catch (error) {
    console.error('[API_RESEARCH_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
