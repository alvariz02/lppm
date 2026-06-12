import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const partnerType = searchParams.get('partnerType') || ''
    const status = searchParams.get('status') || ''

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('partners')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%,cooperation_type.ilike.%${search}%`)
    }
    if (partnerType) {
      query = query.eq('partner_type', partnerType)
    }
    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[PARTNERS_GET]', error)
      return NextResponse.json({ error: 'Gagal memuat data mitra' }, { status: 500 })
    }

    const mapped = (data ?? []).map(mapPartner)
    const total = count ?? 0

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[PARTNERS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data mitra' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = partnerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    // Generate unique slug
    let slug = generateSlug(data.name)
    const { data: existing } = await supabase
      .from('partners')
      .select('id')
      .eq('slug', slug)
      .single()
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const { data: partner, error } = await supabase
      .from('partners')
      .insert({
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
      .select()
      .single()

    if (error) {
      console.error('[PARTNERS_POST]', error)
      return NextResponse.json({ error: 'Gagal membuat mitra' }, { status: 500 })
    }

    return NextResponse.json({ data: mapPartner(partner) }, { status: 201 })
  } catch (error) {
    console.error('[PARTNERS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat mitra' }, { status: 500 })
  }
}
