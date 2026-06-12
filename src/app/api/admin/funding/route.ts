import { NextRequest, NextResponse } from 'next/server'
import { supabase, paginateQuery } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { fundingSchemeSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

function mapFundingScheme(r: any) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    source: r.source,
    year: r.year,
    description: r.description,
    requirements: r.requirements,
    minBudget: r.min_budget,
    maxBudget: r.max_budget,
    openDate: r.open_date,
    deadline: r.deadline,
    status: r.status,
    guideFileUrl: r.guide_file_url,
    registrationUrl: r.registration_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const status = searchParams.get('status')
    const year = searchParams.get('year')
    const search = searchParams.get('search')

    const { from, to } = paginateQuery(page, pageSize)

    let query = supabase
      .from('funding_schemes')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
    }
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,source.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[API_ADMIN_FUNDING_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch funding schemes' },
        { status: 500 }
      )
    }

    const mappedData = (data || []).map(mapFundingScheme)
    const total = count ?? 0

    return NextResponse.json({
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[API_ADMIN_FUNDING_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch funding schemes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = fundingSchemeSchema.parse(body)

    const slug = generateSlug(validated.name)
    const { data: existing } = await supabase
      .from('funding_schemes')
      .select('id')
      .eq('slug', slug)
      .limit(1)
    const finalSlug = existing && existing.length > 0 ? `${slug}-${Date.now()}` : slug

    const { data: funding, error } = await supabase
      .from('funding_schemes')
      .insert({
        name: validated.name,
        slug: finalSlug,
        source: validated.source ?? null,
        year: validated.year,
        description: validated.description ?? null,
        requirements: validated.requirements ?? null,
        min_budget: validated.minBudget ?? null,
        max_budget: validated.maxBudget ?? null,
        open_date: validated.openDate ? new Date(validated.openDate).toISOString() : null,
        deadline: validated.deadline ? new Date(validated.deadline).toISOString() : null,
        status: validated.status,
        guide_file_url: validated.guideFileUrl ?? null,
        registration_url: validated.registrationUrl ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_FUNDING_POST]', error)
      return NextResponse.json(
        { error: 'Failed to create funding scheme' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapFundingScheme(funding) }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API_ADMIN_FUNDING_POST]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create funding scheme' },
      { status: 500 }
    )
  }
}
