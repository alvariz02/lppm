import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const data = await db.announcement.findMany({
      where: { status: 'active' },
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API_ANNOUNCEMENT_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}
