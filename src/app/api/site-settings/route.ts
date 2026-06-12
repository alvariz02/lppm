import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const data = await db.siteSetting.findFirst()

    if (!data) {
      return NextResponse.json(
        { error: 'Site settings not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API_SITE_SETTINGS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}
