import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: funding, error } = await supabase
      .from('funding_schemes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !funding) {
      return NextResponse.json(
        { error: 'Funding scheme not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapFundingScheme(funding) })
  } catch (error) {
    console.error('[API_ADMIN_FUNDING_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch funding scheme' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = fundingSchemeSchema.parse(body)

    const { data: existing } = await supabase
      .from('funding_schemes')
      .select('id')
      .eq('id', id)
      .single()
    if (!existing) {
      return NextResponse.json(
        { error: 'Funding scheme not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.name)
    const { data: slugConflict } = await supabase
      .from('funding_schemes')
      .select('id')
      .eq('slug', slug)
      .limit(1)
    const finalSlug = slugConflict && slugConflict.length > 0 && slugConflict[0].id !== id
      ? `${slug}-${Date.now()}`
      : slug

    const { data: funding, error } = await supabase
      .from('funding_schemes')
      .update({
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
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_FUNDING_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update funding scheme' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapFundingScheme(funding) })
  } catch (error: unknown) {
    console.error('[API_ADMIN_FUNDING_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update funding scheme' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await supabase
      .from('funding_schemes')
      .select('id')
      .eq('id', id)
      .single()
    if (!existing) {
      return NextResponse.json(
        { error: 'Funding scheme not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('funding_schemes').delete().eq('id', id)
    if (error) {
      console.error('[API_ADMIN_FUNDING_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete funding scheme' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Funding scheme deleted' })
  } catch (error) {
    console.error('[API_ADMIN_FUNDING_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete funding scheme' },
      { status: 500 }
    )
  }
}
