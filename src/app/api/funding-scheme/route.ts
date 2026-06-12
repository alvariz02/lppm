import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    } else {
      // Default: show active and closed only (not draft)
      where.status = { in: ['active', 'closed'] }
    }

    if (year) {
      where.year = parseInt(year)
    }

    const data = await db.fundingScheme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API_FUNDING_SCHEME_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch funding schemes' },
      { status: 500 }
    )
  }
}
