import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const data = await db.lppmProfile.findFirst()

    if (!data) {
      return NextResponse.json(
        { error: 'LPPM profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API_LPPM_PROFILE_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch LPPM profile' },
      { status: 500 }
    )
  }
}
