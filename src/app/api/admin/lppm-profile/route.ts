import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lppmProfileSchema } from '@/lib/validations'

export async function GET() {
  try {
    const profile = await db.lppmProfile.findFirst()

    return NextResponse.json({ data: profile })
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
    const existing = await db.lppmProfile.findFirst()

    let profile
    if (existing) {
      profile = await db.lppmProfile.update({
        where: { id: existing.id },
        data: {
          about: data.about ?? null,
          vision: data.vision ?? null,
          mission: data.mission ?? null,
          goals: data.goals ?? null,
          duties: data.duties ?? null,
          chairmanName: data.chairmanName ?? null,
          chairmanPhotoUrl: data.chairmanPhotoUrl ?? null,
          chairmanMessage: data.chairmanMessage ?? null,
          structureImageUrl: data.structureImageUrl ?? null,
        },
      })
    } else {
      profile = await db.lppmProfile.create({
        data: {
          about: data.about ?? null,
          vision: data.vision ?? null,
          mission: data.mission ?? null,
          goals: data.goals ?? null,
          duties: data.duties ?? null,
          chairmanName: data.chairmanName ?? null,
          chairmanPhotoUrl: data.chairmanPhotoUrl ?? null,
          chairmanMessage: data.chairmanMessage ?? null,
          structureImageUrl: data.structureImageUrl ?? null,
        },
      })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('[LPPM_PROFILE_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui profil LPPM' }, { status: 500 })
  }
}
