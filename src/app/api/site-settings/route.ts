import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

function mapSiteSetting(s: any) {
  return {
    id: s.id,
    siteName: s.site_name,
    lppmName: s.lppm_name,
    logoUrl: s.logo_url,
    lppmLogoUrl: s.lppm_logo_url,
    faviconUrl: s.favicon_url,
    email: s.email,
    phone: s.phone,
    whatsapp: s.whatsapp,
    address: s.address,
    googleMapsUrl: s.google_maps_url,
    facebookUrl: s.facebook_url,
    instagramUrl: s.instagram_url,
    youtubeUrl: s.youtube_url,
    seoTitle: s.seo_title,
    seoDescription: s.seo_description,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Site settings not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapSiteSetting(data) })
  } catch (error) {
    console.error('[API_SITE_SETTINGS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}
