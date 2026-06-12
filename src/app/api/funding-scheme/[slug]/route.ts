import { supabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data: fundingScheme, error } = await supabase
      .from('funding_schemes')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !fundingScheme) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    // Fetch related published researches
    const { data: researches } = await supabase
      .from('research')
      .select('id, title, slug, year, status, leader:researchers!leader_id(id, name)')
      .eq('funding_scheme_id', fundingScheme.id)
      .eq('is_published', true)

    // Fetch related published community services
    const { data: communityServices } = await supabase
      .from('community_services')
      .select('id, title, slug, year, status, leader:researchers!leader_id(id, name)')
      .eq('funding_scheme_id', fundingScheme.id)
      .eq('is_published', true)

    const mappedResearches = (researches || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      year: r.year,
      status: r.status,
      leader: r.leader || null,
    }))

    const mappedCommunityServices = (communityServices || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      year: s.year,
      status: s.status,
      leader: s.leader || null,
    }))

    const result = {
      ...mapFundingScheme(fundingScheme),
      researches: mappedResearches,
      communityServices: mappedCommunityServices,
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[API_FUNDING_SCHEME_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
