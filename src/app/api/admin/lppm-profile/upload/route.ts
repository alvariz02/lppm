import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { uploadBufferToCloudinary } from '@/lib/cloudinary.server'
import { supabase } from '@/lib/db'

const uploadSchema = z.object({
  type: z.enum(['chairmanPhoto', 'structureImage']),
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const typeRaw = formData.get('type')
    const file = formData.get('file')

    const parse = uploadSchema.safeParse({ type: typeRaw })
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const type = parse.data.type
    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await uploadBufferToCloudinary(buffer, file.name, {
      folder: 'lppm/profiles',
      resourceType: 'image',
    })

    const secureUrl = result.secureUrl

    // Update the single lppm_profiles row (create if missing)
    const { data: existing } = await supabase
      .from('lppm_profiles')
      .select('*')
      .limit(1)
      .single()

    const recordData =
      type === 'chairmanPhoto'
        ? { chairman_photo_url: secureUrl }
        : { structure_image_url: secureUrl }

    let profile
    if (existing) {
      const { data: updated, error } = await supabase
        .from('lppm_profiles')
        .update(recordData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      profile = updated
    } else {
      const { data: created, error } = await supabase
        .from('lppm_profiles')
        .insert({
          // insert minimal record; other fields can be null
          about: null,
          vision: null,
          mission: null,
          goals: null,
          duties: null,
          chairman_name: null,
          chairman_photo_url: type === 'chairmanPhoto' ? secureUrl : null,
          chairman_message: null,
          structure_image_url: type === 'structureImage' ? secureUrl : null,
        })
        .select()
        .single()

      if (error) throw error
      profile = created
    }

    return NextResponse.json({ data: { url: secureUrl, profile } })
  } catch (error) {
    console.error('[LPPM_PROFILE_UPLOAD_POST]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

