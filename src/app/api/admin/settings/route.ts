import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { siteSettingSchema } from '@/lib/validations'

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
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()

    if (error || !settings) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: mapSiteSetting(settings) })
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

    const { data: existing } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()

    const recordData = {
      site_name: validated.siteName ?? (existing?.site_name ?? 'LPPM Kampus'),
      lppm_name: validated.lppmName ?? (existing?.lppm_name ?? 'Lembaga Penelitian dan Pengabdian kepada Masyarakat'),
      logo_url: validated.logoUrl ?? null,
      lppm_logo_url: validated.lppmLogoUrl ?? null,
      favicon_url: validated.faviconUrl ?? null,
      email: validated.email ?? null,
      phone: validated.phone ?? null,
      whatsapp: validated.whatsapp ?? null,
      address: validated.address ?? null,
      google_maps_url: validated.googleMapsUrl ?? null,
      facebook_url: validated.facebookUrl ?? null,
      instagram_url: validated.instagramUrl ?? null,
      youtube_url: validated.youtubeUrl ?? null,
      seo_title: validated.seoTitle ?? null,
      seo_description: validated.seoDescription ?? null,
    }

    let settings
    if (existing) {
      const { data: result, error } = await supabase
        .from('site_settings')
        .update(recordData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      settings = result
    } else {
      const { data: result, error } = await supabase
        .from('site_settings')
        .insert(recordData)
        .select()
        .single()

      if (error) throw error
      settings = result
    }

    return NextResponse.json({ success: true, data: mapSiteSetting(settings) })
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
