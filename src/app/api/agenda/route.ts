import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'upcoming'
    const eventType = searchParams.get('eventType')

    const where: Record<string, unknown> = {
      status,
    }

    if (eventType) {
      where.eventType = eventType
    }

    const data = await db.agenda.findMany({
      where,
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API_AGENDA_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch agenda' },
      { status: 500 }
    )
  }
}
