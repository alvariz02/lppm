import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lppm.kampus.ac.id'

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/profil`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/penelitian`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/pengabdian`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/publikasi`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/hibah`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/berita`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/pengumuman`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/dokumen`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/reviewer`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/kerjasama`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/agenda`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/galeri`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/kontak`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  // Dynamic pages from database
  try {
    const researches = await db.research.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } })
    const services = await db.communityService.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } })
    const publications = await db.publication.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } })
    const news = await db.news.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } })
    const announcements = await db.announcement.findMany({ where: { status: 'active' }, select: { slug: true, updatedAt: true } })
    const fundingSchemes = await db.fundingScheme.findMany({ select: { slug: true, updatedAt: true } })

    const dynamicPages = [
      ...researches.map(r => ({ url: `${baseUrl}/penelitian/${r.slug}`, lastModified: r.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...services.map(s => ({ url: `${baseUrl}/pengabdian/${s.slug}`, lastModified: s.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...publications.map(p => ({ url: `${baseUrl}/publikasi/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...news.map(n => ({ url: `${baseUrl}/berita/${n.slug}`, lastModified: n.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...announcements.map(a => ({ url: `${baseUrl}/pengumuman/${a.slug}`, lastModified: a.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...fundingSchemes.map(f => ({ url: `${baseUrl}/hibah/${f.slug}`, lastModified: f.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ]

    return [...staticPages, ...dynamicPages]
  } catch {
    return staticPages
  }
}
