import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  BookOpen,
  ExternalLink,
  User,
  FlaskConical,
  HeartHandshake,
  ArrowLeft,
  FileText,
  Award,
  Globe,
  Hash,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/db'
import { getInitials } from '@/lib/helpers'
import { PUBLICATION_TYPE_LABELS } from '@/lib/constants'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: item } = await supabase
    .from('publications')
    .select('title, authors')
    .eq('slug', slug)
    .single()
  if (!item) return { title: 'Tidak Ditemukan' }
  return {
    title: `${item.title} | LPPM Kampus`,
    description: item.authors ? `Publikasi oleh ${item.authors}` : `Detail publikasi: ${item.title}`,
  }
}

export default async function PublikasiDetailPage({ params }: PageProps) {
  const { slug } = await params

  const { data: rawPub } = await supabase
    .from('publications')
    .select('*, research:research!research_id(id, title, slug, year), service:community_services!service_id(id, title, slug, year)')
    .eq('slug', slug)
    .single()

  if (!rawPub || !rawPub.is_published) return notFound()

  const { data: pubAuthors } = await supabase
    .from('publication_authors')
    .select('*, researcher:researchers(id, name, nidn, photo_url, expertise, degree)')
    .eq('publication_id', rawPub.id)
    .order('author_order', { ascending: true })

  const publication: any = {
    ...rawPub,
    publicationType: rawPub.publication_type,
    publisherName: rawPub.publisher_name,
    journalName: rawPub.journal_name,
    fileUrl: rawPub.file_url,
    researchId: rawPub.research_id,
    serviceId: rawPub.service_id,
    isPublished: rawPub.is_published,
    createdAt: rawPub.created_at,
    updatedAt: rawPub.updated_at,
    research: rawPub.research,
    service: rawPub.service,
    publicationAuthors: (pubAuthors || []).map((pa: any) => ({
      ...pa,
      researcherId: pa.researcher_id,
      publicationId: pa.publication_id,
      authorOrder: pa.author_order,
      researcher: pa.researcher,
    })),
  }

  const pubTypeLabel =
    PUBLICATION_TYPE_LABELS[publication.publicationType as keyof typeof PUBLICATION_TYPE_LABELS] ||
    publication.publicationType

  return (
    <div className="min-h-screen">
      <nav className="bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
            <li>/</li>
            <li><Link href="/publikasi" className="hover:text-primary transition-colors">Publikasi</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium line-clamp-1">{publication.title}</li>
          </ol>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-12 lg:py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 size-96 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute bottom-0 -left-32 size-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge className="text-xs border-0 bg-white/20 text-white backdrop-blur-sm">{pubTypeLabel}</Badge>
            <Badge variant="outline" className="text-xs border-white/30 text-white">{publication.year}</Badge>
            {publication.journalName && <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs backdrop-blur-sm">{publication.journalName}</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">{publication.title}</h1>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {publication.publicationAuthors.length > 0 ? (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="size-5 text-primary" />Penulis</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {publication.publicationAuthors.map((pa: any, index: number) => (
                      <div key={pa.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">{getInitials(pa.researcher.name)}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{index + 1}. {pa.researcher.name}{pa.researcher.degree && <span className="text-muted-foreground font-normal"> ({pa.researcher.degree})</span>}</p>
                          {pa.researcher.nidn && <p className="text-xs text-muted-foreground">NIDN: {pa.researcher.nidn}</p>}
                          {pa.researcher.expertise && (
                            <div className="flex flex-wrap gap-1 mt-1">{pa.researcher.expertise.split(',').map((exp: string, i: number) => (<Badge key={i} variant="secondary" className="text-[10px]">{exp.trim()}</Badge>))}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : publication.authors ? (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="size-5 text-primary" />Penulis</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground leading-relaxed">{publication.authors}</p></CardContent>
                </Card>
              ) : null}

              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="size-5 text-primary" />Detail Publikasi</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {publication.journalName && <div><p className="text-xs text-muted-foreground">Nama Jurnal</p><p className="text-sm font-medium">{publication.journalName}</p></div>}
                    {publication.publisherName && <div><p className="text-xs text-muted-foreground">Penerbit</p><p className="text-sm font-medium">{publication.publisherName}</p></div>}
                    {publication.volume && <div><p className="text-xs text-muted-foreground">Volume</p><p className="text-sm font-medium">{publication.volume}</p></div>}
                    {publication.number && <div><p className="text-xs text-muted-foreground">Nomor</p><p className="text-sm font-medium">{publication.number}</p></div>}
                    {publication.pages && <div><p className="text-xs text-muted-foreground">Halaman</p><p className="text-sm font-medium">{publication.pages}</p></div>}
                    {publication.issn && <div><p className="text-xs text-muted-foreground">ISSN</p><p className="text-sm font-medium">{publication.issn}</p></div>}
                    {publication.isbn && <div><p className="text-xs text-muted-foreground">ISBN</p><p className="text-sm font-medium">{publication.isbn}</p></div>}
                    {publication.indexing && <div><p className="text-xs text-muted-foreground">Indeksasi</p><p className="text-sm font-medium">{publication.indexing}</p></div>}
                    {publication.accreditation && <div><p className="text-xs text-muted-foreground">Akreditasi</p><Badge variant="secondary" className="text-xs">{publication.accreditation}</Badge></div>}
                  </div>
                  {publication.doi && (
                    <><Separator className="my-4" /><div className="flex items-center gap-2"><Hash className="size-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">DOI:</span><a href={publication.doi.startsWith('http') ? publication.doi : `https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">{publication.doi}<ExternalLink className="size-3" /></a></div></>
                  )}
                  {publication.url && (
                    <><Separator className="my-4" /><div className="flex items-center gap-2"><Globe className="size-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">URL:</span><a href={publication.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 line-clamp-1">{publication.url}<ExternalLink className="size-3 shrink-0" /></a></div></>
                  )}
                </CardContent>
              </Card>

              {(publication.research || publication.service) && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="size-5 text-primary" />Penelitian/Pengabdian Terkait</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {publication.research && (
                      <Link href={`/penelitian/${publication.research.slug}`} className="block p-3 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-2 mb-1"><FlaskConical className="size-4 text-primary" /><span className="text-xs text-muted-foreground">Penelitian</span><Badge variant="outline" className="text-[10px]">{publication.research.year}</Badge></div>
                        <p className="font-medium text-foreground text-sm line-clamp-2">{publication.research.title}</p>
                      </Link>
                    )}
                    {publication.service && (
                      <Link href={`/pengabdian/${publication.service.slug}`} className="block p-3 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-2 mb-1"><HeartHandshake className="size-4 text-sky-500" /><span className="text-xs text-muted-foreground">Pengabdian</span><Badge variant="outline" className="text-[10px]">{publication.service.year}</Badge></div>
                        <p className="font-medium text-foreground text-sm line-clamp-2">{publication.service.title}</p>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Award className="size-5 text-primary" />Jenis Publikasi</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Tipe</p><Badge variant="secondary">{pubTypeLabel}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Tahun</p><p className="text-sm font-medium">{publication.year}</p></div>
                  {publication.accreditation && <div><p className="text-xs text-muted-foreground">Akreditasi</p><Badge variant="secondary" className="text-xs">{publication.accreditation}</Badge></div>}
                  {publication.indexing && <div><p className="text-xs text-muted-foreground">Indeksasi</p><p className="text-sm font-medium">{publication.indexing}</p></div>}
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="size-5 text-secondary" />Tautan Cepat</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {publication.doi && <a href={publication.doi.startsWith('http') ? publication.doi : `https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="size-4" />Lihat di DOI</a>}
                  {publication.url && <a href={publication.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="size-4" />Lihat Publikasi</a>}
                  {publication.fileUrl && <a href={publication.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><FileText className="size-4" />Download File</a>}
                </CardContent>
              </Card>
              <Link href="/publikasi"><Button variant="outline" className="w-full"><ArrowLeft className="size-4 mr-2" />Kembali ke Publikasi</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
