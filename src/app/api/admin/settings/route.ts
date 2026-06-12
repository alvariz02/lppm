import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettingSchema } from '@/lib/validations'

export async function GET() {
  try {
    const settings = await db.siteSetting.findFirst()

    if (!settings) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[API_ADMIN_SETTINGS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = siteSettingSchema.parse(body)

    const existing = await db.siteSetting.findFirst()

    let settings
    if (existing) {
      settings = await db.siteSetting.update({
        where: { id: existing.id },
        data: {
          siteName: validated.siteName ?? existing.siteName,
          lppmName: validated.lppmName ?? existing.lppmName,
          logoUrl: validated.logoUrl ?? null,
          lppmLogoUrl: validated.lppmLogoUrl ?? null,
          faviconUrl: validated.faviconUrl ?? null,
          email: validated.email ?? null,
          phone: validated.phone ?? null,
          whatsapp: validated.whatsapp ?? null,
          address: validated.address ?? null,
          googleMapsUrl: validated.googleMapsUrl ?? null,
          facebookUrl: validated.facebookUrl ?? null,
          instagramUrl: validated.instagramUrl ?? null,
          youtubeUrl: validated.youtubeUrl ?? null,
          seoTitle: validated.seoTitle ?? null,
          seoDescription: validated.seoDescription ?? null,
        },
      })
    } else {
      settings = await db.siteSetting.create({
        data: {
          siteName: validated.siteName ?? 'LPPM Kampus',
          lppmName: validated.lppmName ?? 'Lembaga Penelitian dan Pengabdian kepada Masyarakat',
          logoUrl: validated.logoUrl ?? null,
          lppmLogoUrl: validated.lppmLogoUrl ?? null,
          faviconUrl: validated.faviconUrl ?? null,
          email: validated.email ?? null,
          phone: validated.phone ?? null,
          whatsapp: validated.whatsapp ?? null,
          address: validated.address ?? null,
          googleMapsUrl: validated.googleMapsUrl ?? null,
          facebookUrl: validated.facebookUrl ?? null,
          instagramUrl: validated.instagramUrl ?? null,
          youtubeUrl: validated.youtubeUrl ?? null,
          seoTitle: validated.seoTitle ?? null,
          seoDescription: validated.seoDescription ?? null,
        },
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error: unknown) {
    console.error('[API_ADMIN_SETTINGS_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
