import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lppm.kampus.ac.id'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
