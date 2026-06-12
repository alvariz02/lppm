import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Megaphone,
  Calendar,
  Download,
  ArrowLeft,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/db'
import { formatDate } from '@/lib/helpers'
import {
  ANNOUNCEMENT_TYPE_LABELS,
  ANNOUNCEMENT_STATUS_LABELS,
  ANNOUNCEMENT_STATUS_COLORS,
} from '@/lib/constants'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: item } = await supabase
    .from('announcements')
    .select('title')
    .eq('slug', slug)
    .single()
  if (!item) return { title: 'Tidak Ditemukan' }
  return {
    title: `${item.title} | LPPM Kampus`,
    description: `Pengumuman LPPM: ${item.title}`,
  }
}

export default async function PengumumanDetailPage({ params }: PageProps) {
  const { slug } = await params

  const { data: rawAnn } = await supabase
    .from('announcements')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!rawAnn || rawAnn.status !== 'active') return notFound()

  const announcement: any = {
    ...rawAnn,
    attachmentUrl: rawAnn.attachment_url,
    publishedAt: rawAnn.published_at,
    expiredAt: rawAnn.expired_at,
    createdAt: rawAnn.created_at,
    updatedAt: rawAnn.updated_at,
  }

  const typeLabel =
    ANNOUNCEMENT_TYPE_LABELS[announcement.type as keyof typeof ANNOUNCEMENT_TYPE_LABELS] || announcement.type
  const statusLabel =
    ANNOUNCEMENT_STATUS_LABELS[announcement.status as keyof typeof ANNOUNCEMENT_STATUS_LABELS] || announcement.status
  const statusColor =
    ANNOUNCEMENT_STATUS_COLORS[announcement.status as keyof typeof ANNOUNCEMENT_STATUS_COLORS] || ''
  const isImportant = announcement.type === 'important'

  return (
    <div className="min-h-screen">
      <nav className="bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
            <li>/</li>
            <li><Link href="/pengumuman" className="hover:text-primary transition-colors">Pengumuman</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium line-clamp-1">{announcement.title}</li>
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
            <Badge className={`text-xs border-0 ${isImportant ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
              {isImportant ? <AlertCircle className="size-3 mr-1" /> : <Megaphone className="size-3 mr-1" />}
              {typeLabel}
            </Badge>
            <Badge variant="outline" className="text-xs border-white/30 text-white">{formatDate(announcement.publishedAt || announcement.createdAt)}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">{announcement.title}</h1>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="size-5 text-primary" />Isi Pengumuman</CardTitle></CardHeader>
                <CardContent><div className="text-muted-foreground leading-relaxed whitespace-pre-line">{announcement.content || 'Tidak ada konten tersedia.'}</div></CardContent>
              </Card>
              {announcement.attachmentUrl && (
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center"><Download className="size-5 text-primary" /></div>
                        <div><p className="text-sm font-medium">Lampiran</p><p className="text-xs text-muted-foreground">Klik untuk mengunduh file lampiran</p></div>
                      </div>
                      <Button asChild><a href={announcement.attachmentUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4 mr-2" />Unduh</a></Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Calendar className="size-5 text-primary" />Informasi</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Tanggal Publikasi</p><p className="text-sm font-medium">{formatDate(announcement.publishedAt || announcement.createdAt)}</p></div>
                  {announcement.expiredAt && (
                    <div><p className="text-xs text-muted-foreground">Tanggal Kadaluarsa</p><p className="text-sm font-medium flex items-center gap-1"><Clock className="size-3 text-muted-foreground" />{formatDate(announcement.expiredAt)}</p></div>
                  )}
                  <Separator />
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge className={`text-xs border-0 ${statusColor}`}>{statusLabel}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Jenis</p><Badge variant={isImportant ? 'destructive' : 'secondary'} className="text-xs">{isImportant ? <AlertCircle className="size-3 mr-1" /> : <Megaphone className="size-3 mr-1" />}{typeLabel}</Badge></div>
                </CardContent>
              </Card>
              <Link href="/pengumuman"><Button variant="outline" className="w-full"><ArrowLeft className="size-4 mr-2" />Kembali ke Pengumuman</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
