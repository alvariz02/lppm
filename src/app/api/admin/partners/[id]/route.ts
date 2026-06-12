import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { partnerSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapPartner(p: Record<string, unknown>) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    partnerType: p.partner_type,
    address: p.address ?? null,
    contactPerson: p.contact_person ?? null,
    email: p.email ?? null,
    phone: p.phone ?? null,
    cooperationType: p.cooperation_type ?? null,
    startDate: p.start_date ?? null,
    endDate: p.end_date ?? null,
    status: p.status,
    logoUrl: p.logo_url ?? null,
    documentUrl: p.document_url ?? null,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !partner) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: mapPartner(partner) })
  } catch (error) {
    console.error('[PARTNER_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data mitra' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = partnerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('partners')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    // Regenerate slug if name changed
    const slug = generateSlug(data.name)
    const { data: slugConflict } = await supabase
      .from('partners')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Mitra dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const { data: partner, error } = await supabase
      .from('partners')
      .update({
        name: data.name,
        slug,
        partner_type: data.partnerType,
        address: data.address || null,
        contact_person: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        cooperation_type: data.cooperationType || null,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        status: data.status,
        logo_url: data.logoUrl || null,
        document_url: data.documentUrl || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PARTNER_PUT]', error)
      return NextResponse.json({ error: 'Gagal memperbarui mitra' }, { status: 500 })
    }

    return NextResponse.json({ data: mapPartner(partner) })
  } catch (error) {
    console.error('[PARTNER_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui mitra' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('partners')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase.from('partners').delete().eq('id', id)

    if (error) {
      console.error('[PARTNER_DELETE]', error)
      return NextResponse.json({ error: 'Gagal menghapus mitra' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Mitra berhasil dihapus' })
  } catch (error) {
    console.error('[PARTNER_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus mitra' }, { status: 500 })
  }
}
