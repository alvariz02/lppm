import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API_PARTNER_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch partners' },
        { status: 500 }
      )
    }

    const mapped = (data ?? []).map(mapPartner)
    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[API_PARTNER_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}
