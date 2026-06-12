import { MetadataRoute } from 'next'
import { supabase } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lppm.kampus.ac.id'

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

  try {
    const [researchRes, servicesRes, publicationsRes, newsRes, announcementsRes, fundingRes] = await Promise.all([
      supabase.from('research').select('slug, updated_at').eq('is_published', true),
      supabase.from('community_services').select('slug, updated_at').eq('is_published', true),
      supabase.from('publications').select('slug, updated_at').eq('is_published', true),
      supabase.from('news').select('slug, updated_at').eq('status', 'published'),
      supabase.from('announcements').select('slug, updated_at').eq('status', 'active'),
      supabase.from('funding_schemes').select('slug, updated_at'),
    ])

    const dynamicPages = [
      ...(researchRes.data || []).map(r => ({ url: `${baseUrl}/penelitian/${r.slug}`, lastModified: new Date(r.updated_at), changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...(servicesRes.data || []).map(s => ({ url: `${baseUrl}/pengabdian/${s.slug}`, lastModified: new Date(s.updated_at), changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...(publicationsRes.data || []).map(p => ({ url: `${baseUrl}/publikasi/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...(newsRes.data || []).map(n => ({ url: `${baseUrl}/berita/${n.slug}`, lastModified: new Date(n.updated_at), changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...(announcementsRes.data || []).map(a => ({ url: `${baseUrl}/pengumuman/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...(fundingRes.data || []).map(f => ({ url: `${baseUrl}/hibah/${f.slug}`, lastModified: new Date(f.updated_at), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ]

    return [...staticPages, ...dynamicPages]
  } catch {
    return staticPages
  }
}
