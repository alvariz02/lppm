import { NextResponse } from 'next/server'
import { supabase, countRecords } from '@/lib/db'

export async function GET() {
  try {
    const currentYear = new Date().getFullYear()
    const last5Years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i)

    // Count queries in parallel
    const [
      totalResearch, totalCommunityService, totalPublication, totalResearcher,
      totalPartner, totalFundingScheme, ongoingResearch, completedResearch,
      ongoingService, completedService, totalActiveHibah,
      totalNews, totalAnnouncement, totalDocument, unreadMessages, pendingReviews,
    ] = await Promise.all([
      countRecords('research', { is_published: true }),
      countRecords('community_services', { is_published: true }),
      countRecords('publications', { is_published: true }),
      countRecords('researchers', { is_active: true }),
      countRecords('partners', { status: 'active' }),
      countRecords('funding_schemes'),
      countRecords('research', { is_published: true, status: 'ongoing' }),
      countRecords('research', { is_published: true, status: 'completed' }),
      countRecords('community_services', { is_published: true, status: 'ongoing' }),
      countRecords('community_services', { is_published: true, status: 'completed' }),
      countRecords('funding_schemes', { status: 'active' }),
      countRecords('news', { status: 'published' }),
      countRecords('announcements', { status: 'active' }),
      countRecords('documents', { is_active: true }),
      countRecords('contact_messages', { is_read: false }),
      countRecords('proposal_reviews', { status: 'waiting' }),
    ])

    // Research per year
    const researchPerYear = await Promise.all(
      last5Years.map(async (year) => {
        const count = await countRecords('research', { year, is_published: true })
        return { year, count }
      })
    )

    // Community service per year
    const servicePerYear = await Promise.all(
      last5Years.map(async (year) => {
        const count = await countRecords('community_services', { year, is_published: true })
        return { year, count }
      })
    )

    // Publications by type
    const { data: pubTypeData } = await supabase.from('publications').select('publication_type')
    const publicationsByType = (pubTypeData || []).reduce((acc: any[], item: any) => {
      const existing = acc.find(a => a.type === item.publication_type)
      if (existing) existing.count++
      else acc.push({ type: item.publication_type, count: 1 })
      return acc
    }, [])

    // Funding by status
    const { data: fundStatusData } = await supabase.from('funding_schemes').select('status')
    const fundingByStatus = (fundStatusData || []).reduce((acc: any[], item: any) => {
      const existing = acc.find(a => a.status === item.status)
      if (existing) existing.count++
      else acc.push({ status: item.status, count: 1 })
      return acc
    }, [])

    // Recent data
    const { data: recentResearch } = await supabase.from('research').select('id, title, status, year, created_at').order('created_at', { ascending: false }).limit(5)
    const { data: recentServices } = await supabase.from('community_services').select('id, title, status, year, created_at').order('created_at', { ascending: false }).limit(5)
    const { data: recentNews } = await supabase.from('news').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5)

    // Map snake_case fields to camelCase in recent items for frontend compatibility
    const mapRecentResearch = (items: any[]) =>
      (items || []).map(item => ({
        id: item.id,
        title: item.title,
        status: item.status,
        year: item.year,
        createdAt: item.created_at,
      }))

    const mapRecentServices = (items: any[]) =>
      (items || []).map(item => ({
        id: item.id,
        title: item.title,
        status: item.status,
        year: item.year,
        createdAt: item.created_at,
      }))

    const mapRecentNews = (items: any[]) =>
      (items || []).map(item => ({
        id: item.id,
        title: item.title,
        status: item.status,
        createdAt: item.created_at,
      }))

    return NextResponse.json({
      totalResearch,
      totalCommunityService,
      totalPublication,
      totalResearcher,
      totalPartner,
      totalFundingScheme,
      ongoingResearch,
      completedResearch,
      ongoingService,
      completedService,
      totalActiveHibah,
      totalNews,
      totalAnnouncement,
      totalDocument,
      unreadMessages,
      pendingReviews,
      researchPerYear,
      servicePerYear,
      publicationsByType,
      fundingByStatus,
      recentResearch: mapRecentResearch(recentResearch),
      recentServices: mapRecentServices(recentServices),
      recentNews: mapRecentNews(recentNews),
    })
  } catch (error) {
    console.error('[API_STATS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
