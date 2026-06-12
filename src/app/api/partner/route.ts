import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const data = await db.partner.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API_PARTNER_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}
