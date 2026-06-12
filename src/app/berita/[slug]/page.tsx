import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Newspaper,
  Calendar,
  Tag,
  Share2,
  ArrowLeft,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/db'
import { formatDate } from '@/lib/helpers'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: item } = await supabase
    .from('news')
    .select('title, seo_title, seo_description, excerpt')
    .eq('slug', slug)
    .single()
  if (!item) return { title: 'Tidak Ditemukan' }
  return {
    title: `${item.seo_title || item.title} | LPPM Kampus`,
    description: item.seo_description || item.excerpt || `Berita LPPM: ${item.title}`,
  }
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params

  const { data: rawNews } = await supabase
    .from('news')
    .select('*, category:news_categories(id, name, slug)')
    .eq('slug', slug)
    .single()

  if (!rawNews || rawNews.status !== 'published') return notFound()

  const news: any = {
    ...rawNews,
    categoryId: rawNews.category_id,
    imageUrl: rawNews.image_url,
    isFeatured: rawNews.is_featured,
    seoTitle: rawNews.seo_title,
    seoDescription: rawNews.seo_description,
    publishedAt: rawNews.published_at,
    createdAt: rawNews.created_at,
    updatedAt: rawNews.updated_at,
    category: rawNews.category,
  }

  // Related news
  let relatedNews: any[] = []
  if (news.categoryId) {
    const { data: relData } = await supabase
      .from('news')
      .select('id, title, slug, excerpt, image_url, published_at, is_featured, category:news_categories(name, slug)')
      .eq('status', 'published')
      .neq('id', news.id)
      .eq('category_id', news.categoryId)
      .order('published_at', { ascending: false })
      .limit(3)
    relatedNews = (relData || []).map((n: any) => ({
      ...n,
      imageUrl: n.image_url,
      publishedAt: n.published_at,
      isFeatured: n.is_featured,
      createdAt: n.created_at,
      category: n.category,
    }))
  } else {
    const { data: relData } = await supabase
      .from('news')
      .select('id, title, slug, excerpt, image_url, published_at, is_featured, category:news_categories(name, slug)')
      .eq('status', 'published')
      .neq('id', news.id)
      .order('published_at', { ascending: false })
      .limit(3)
    relatedNews = (relData || []).map((n: any) => ({
      ...n,
      imageUrl: n.image_url,
      publishedAt: n.published_at,
      isFeatured: n.is_featured,
      createdAt: n.created_at,
      category: n.category,
    }))
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
            <li>/</li>
            <li><Link href="/berita" className="hover:text-primary transition-colors">Berita</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium line-clamp-1">{news.title}</li>
          </ol>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-12 lg:py-16">
        {news.imageUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${news.imageUrl})` }}>
            <div className="absolute inset-0 bg-primary/80" />
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 size-96 rounded-full bg-secondary/20 blur-3xl" />
            <div className="absolute bottom-0 -left-32 size-80 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {news.category && <Badge className="text-xs border-0 bg-white/20 text-white backdrop-blur-sm">{news.category.name}</Badge>}
            {news.isFeatured && <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs backdrop-blur-sm">Berita Utama</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">{news.title}</h1>
          <p className="mt-4 text-white/70 flex items-center gap-2 text-sm"><Calendar className="size-4" />{formatDate(news.publishedAt || news.createdAt)}</p>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{news.content || 'Tidak ada konten tersedia.'}</div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              {news.category && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Tag className="size-5 text-primary" />Kategori</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><p className="text-xs text-muted-foreground">Kategori</p><Link href={`/berita?category=${news.category.slug}`} className="text-sm font-medium text-primary hover:underline">{news.category.name}</Link></div>
                  </CardContent>
                </Card>
              )}
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Calendar className="size-5 text-secondary" />Informasi</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Dipublikasikan</p><p className="text-sm font-medium">{formatDate(news.publishedAt || news.createdAt)}</p></div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Bagikan</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="sm" asChild><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`/berita/${news.slug}`)}`} target="_blank" rel="noopener noreferrer"><Share2 className="size-4 mr-1" />Facebook</a></Button>
                      <Button variant="outline" size="sm" asChild><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`/berita/${news.slug}`)}&text=${encodeURIComponent(news.title)}`} target="_blank" rel="noopener noreferrer"><Share2 className="size-4 mr-1" />Twitter</a></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Link href="/berita"><Button variant="outline" className="w-full"><ArrowLeft className="size-4 mr-2" />Kembali ke Berita</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {relatedNews.length > 0 && (
        <section className="py-10 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Newspaper className="size-5 text-primary" />Berita Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((item: any) => (
                <Link key={item.id} href={`/berita/${item.slug}`}>
                  <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    {item.imageUrl ? (
                      <div className="h-40 bg-cover bg-center rounded-t-lg" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-t-lg flex items-center justify-center"><Newspaper className="size-8 text-white/50" /></div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.category && <Badge variant="secondary" className="text-[10px]">{item.category.name}</Badge>}
                        {item.isFeatured && <Badge className="bg-accent/20 text-accent-foreground text-[10px]">Utama</Badge>}
                      </div>
                      <CardTitle className="text-sm leading-snug line-clamp-2 mt-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {item.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>}
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="size-3" />{formatDate(item.publishedAt || item.createdAt)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
