import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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
    const { data, error } = await supabase
      .from('lppm_profiles')
      .select('*')
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'LPPM profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapLppmProfile(data) })
  } catch (error) {
    console.error('[API_LPPM_PROFILE_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch LPPM profile' },
      { status: 500 }
    )
  }
}
