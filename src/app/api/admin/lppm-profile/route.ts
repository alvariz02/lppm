import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { lppmProfileSchema } from '@/lib/validations'

function mapLppmProfile(p: any) {
  return {
    id: p.id,
    about: p.about,
    vision: p.vision,
    mission: p.mission,
    goals: p.goals,
    duties: p.duties,
    chairmanName: p.chairman_name,
    chairmanPhotoUrl: p.chairman_photo_url,
    chairmanMessage: p.chairman_message,
    structureImageUrl: p.structure_image_url,
    activityLogs: p.activity_logs,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

export async function GET() {
  try {
    const { data: profile, error } = await supabase
      .from('lppm_profiles')
      .select('*')
      .limit(1)
      .single()

    if (error || !profile) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: mapLppmProfile(profile) })
  } catch (error) {
    console.error('[LPPM_PROFILE_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat profil LPPM' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = lppmProfileSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    // Upsert: update if exists, create if not
    const { data: existing } = await supabase
      .from('lppm_profiles')
      .select('*')
      .limit(1)
      .single()

    const recordData = {
      about: data.about ?? null,
      vision: data.vision ?? null,
      mission: data.mission ?? null,
      goals: data.goals ?? null,
      duties: data.duties ?? null,
      chairman_name: data.chairmanName ?? null,
      chairman_photo_url: data.chairmanPhotoUrl ?? null,
      chairman_message: data.chairmanMessage ?? null,
      structure_image_url: data.structureImageUrl ?? null,
    }

    let profile
    if (existing) {
      const { data: result, error } = await supabase
        .from('lppm_profiles')
        .update(recordData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      profile = result
    } else {
      const { data: result, error } = await supabase
        .from('lppm_profiles')
        .insert(recordData)
        .select()
        .single()

      if (error) throw error
      profile = result
    }

    return NextResponse.json({ data: mapLppmProfile(profile) })
  } catch (error) {
    console.error('[LPPM_PROFILE_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui profil LPPM' }, { status: 500 })
  }
}
