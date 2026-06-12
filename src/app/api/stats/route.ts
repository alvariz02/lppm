import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const currentYear = new Date().getFullYear()
    const last5Years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i)

    // Combine all independent counts into a single Promise.all
    const [
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
      // Chart data: research per year
      researchPerYear,
      // Chart data: community service per year
      servicePerYear,
      // Chart data: publications by type
      publicationsByType,
      // Chart data: funding schemes by status
      fundingByStatus,
      // Recent activities
      recentResearch,
      recentServices,
      recentNews,
    ] = await Promise.all([
      db.research.count({ where: { isPublished: true } }),
      db.communityService.count({ where: { isPublished: true } }),
      db.publication.count({ where: { isPublished: true } }),
      db.researcher.count({ where: { isActive: true } }),
      db.partner.count({ where: { status: 'active' } }),
      db.fundingScheme.count(),
      db.research.count({ where: { isPublished: true, status: 'ongoing' } }),
      db.research.count({ where: { isPublished: true, status: 'completed' } }),
      db.communityService.count({ where: { isPublished: true, status: 'ongoing' } }),
      db.communityService.count({ where: { isPublished: true, status: 'completed' } }),
      db.fundingScheme.count({ where: { status: 'active' } }),

      // Additional counts for dashboard
      db.news.count({ where: { status: 'published' } }),
      db.announcement.count({ where: { status: 'active' } }),
      db.document.count({ where: { isActive: true } }),
      db.contactMessage.count({ where: { isRead: false } }),
      db.proposalReview.count({ where: { status: 'waiting' } }),

      // Research per year (last 5 years)
      Promise.all(
        last5Years.map(async (year) => ({
          year,
          count: await db.research.count({ where: { year, isPublished: true } }),
        }))
      ),

      // Community service per year (last 5 years)
      Promise.all(
        last5Years.map(async (year) => ({
          year,
          count: await db.communityService.count({ where: { year, isPublished: true } }),
        }))
      ),

      // Publications by type
      db.publication.groupBy({
        by: ['publicationType'],
        where: { isPublished: true },
        _count: { publicationType: true },
      }),

      // Funding schemes by status
      db.fundingScheme.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Recent research
      db.research.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          year: true,
          createdAt: true,
        },
      }),

      // Recent community services
      db.communityService.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          year: true,
          createdAt: true,
        },
      }),

      // Recent news
      db.news.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

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
      publicationsByType: publicationsByType.map((item) => ({
        type: item.publicationType,
        count: item._count.publicationType,
      })),
      fundingByStatus: fundingByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      recentResearch,
      recentServices,
      recentNews,
    })
  } catch (error) {
    console.error('[API_STATS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
