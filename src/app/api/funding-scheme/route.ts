import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    let query = supabase
      .from('funding_schemes')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    } else {
      // Default: show active and closed only (not draft)
      query = query.in('status', ['active', 'closed'])
    }

    if (year) {
      query = query.eq('year', parseInt(year))
    }

    const { data, error } = await query

    if (error) {
      console.error('[API_FUNDING_SCHEME_GET]', error)
      return NextResponse.json(
        { error: 'Failed to fetch funding schemes' },
        { status: 500 }
      )
    }

    const mappedData = (data || []).map(mapFundingScheme)

    return NextResponse.json({ data: mappedData })
  } catch (error) {
    console.error('[API_FUNDING_SCHEME_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch funding schemes' },
      { status: 500 }
    )
  }
}
