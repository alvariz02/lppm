import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Calendar,
  MapPin,
  Clock,
  User,
  ArrowLeft,
  Building2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/db'
import { formatDate, formatDateTime } from '@/lib/helpers'
import {
  AGENDA_EVENT_TYPE_LABELS,
  AGENDA_STATUS_LABELS,
  AGENDA_STATUS_COLORS,
} from '@/lib/constants'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: item } = await supabase
    .from('agenda')
    .select('title, description')
    .eq('slug', slug)
    .single()
  if (!item) return { title: 'Tidak Ditemukan' }
  return {
    title: `${item.title} | LPPM Kampus`,
    description: item.description || `Agenda kegiatan: ${item.title}`,
  }
}

export default async function AgendaDetailPage({ params }: PageProps) {
  const { slug } = await params

  const { data: rawAgenda } = await supabase
    .from('agenda')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!rawAgenda) return notFound()

  const agenda: any = {
    ...rawAgenda,
    eventType: rawAgenda.event_type,
    startDate: rawAgenda.start_date,
    endDate: rawAgenda.end_date,
    posterUrl: rawAgenda.poster_url,
    createdAt: rawAgenda.created_at,
    updatedAt: rawAgenda.updated_at,
  }

  const eventTypeLabel =
    AGENDA_EVENT_TYPE_LABELS[agenda.eventType as keyof typeof AGENDA_EVENT_TYPE_LABELS] || agenda.eventType || 'Kegiatan'
  const statusLabel =
    AGENDA_STATUS_LABELS[agenda.status as keyof typeof AGENDA_STATUS_LABELS] || agenda.status
  const statusColor =
    AGENDA_STATUS_COLORS[agenda.status as keyof typeof AGENDA_STATUS_COLORS] || ''

  // Related agenda
  const { data: relData } = await supabase
    .from('agenda')
    .select('id, title, slug, start_date, event_type, status, location')
    .neq('id', agenda.id)
    .in('status', ['upcoming', 'ongoing'])
    .order('start_date', { ascending: true })
    .limit(3)

  const relatedAgenda = (relData || []).map((a: any) => ({
    ...a,
    startDate: a.start_date,
    eventType: a.event_type,
  }))

  return (
    <div className="min-h-screen">
      <nav className="bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
            <li>/</li>
            <li><Link href="/agenda" className="hover:text-primary transition-colors">Agenda</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium line-clamp-1">{agenda.title}</li>
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
            <Badge className={`text-xs border-0 ${statusColor}`}>{statusLabel}</Badge>
            <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs backdrop-blur-sm">{eventTypeLabel}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">{agenda.title}</h1>
          <div className="flex items-center gap-4 mt-4 flex-wrap text-white/80 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="size-4" />{formatDate(agenda.startDate)}</span>
            {agenda.location && <span className="flex items-center gap-1.5"><MapPin className="size-4" />{agenda.location}</span>}
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="size-5 text-primary" />Deskripsi Kegiatan</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground leading-relaxed whitespace-pre-line">{agenda.description || 'Tidak ada deskripsi tersedia.'}</p></CardContent>
              </Card>
              {agenda.posterUrl && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="text-lg">Poster</CardTitle></CardHeader>
                  <CardContent><img src={agenda.posterUrl} alt={agenda.title} className="w-full rounded-lg border" /></CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock className="size-5 text-secondary" />Detail Kegiatan</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Tanggal Mulai</p><p className="text-sm font-medium">{formatDateTime(agenda.startDate)}</p></div>
                  {agenda.endDate && <div><p className="text-xs text-muted-foreground">Tanggal Selesai</p><p className="text-sm font-medium">{formatDateTime(agenda.endDate)}</p></div>}
                  <Separator />
                  <div><p className="text-xs text-muted-foreground">Jenis Kegiatan</p><Badge className="text-xs border-0 bg-primary/10 text-primary">{eventTypeLabel}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge className={`text-xs border-0 ${statusColor}`}>{statusLabel}</Badge></div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-5 text-primary" />Lokasi &amp; Penyelenggara</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {agenda.location && <div><p className="text-xs text-muted-foreground">Lokasi</p><p className="text-sm font-medium flex items-center gap-1"><MapPin className="size-3 text-muted-foreground" />{agenda.location}</p></div>}
                  {agenda.organizer && <div><p className="text-xs text-muted-foreground">Penyelenggara</p><p className="text-sm font-medium flex items-center gap-1"><User className="size-3 text-muted-foreground" />{agenda.organizer}</p></div>}
                </CardContent>
              </Card>
              <Link href="/agenda"><Button variant="outline" className="w-full"><ArrowLeft className="size-4 mr-2" />Kembali ke Agenda</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {relatedAgenda.length > 0 && (
        <section className="py-10 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Calendar className="size-5 text-primary" />Agenda Mendatang</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedAgenda.map((item: any) => {
                const relStatusLabel = AGENDA_STATUS_LABELS[item.status as keyof typeof AGENDA_STATUS_LABELS] || item.status
                const relStatusColor = AGENDA_STATUS_COLORS[item.status as keyof typeof AGENDA_STATUS_COLORS] || ''
                const relEventType = AGENDA_EVENT_TYPE_LABELS[item.eventType as keyof typeof AGENDA_EVENT_TYPE_LABELS] || item.eventType || 'Kegiatan'
                return (
                  <Link key={item.id} href={`/agenda/${item.slug}`}>
                    <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[10px] border-0 ${relStatusColor}`}>{relStatusLabel}</Badge>
                          <Badge className="text-[10px] bg-primary/10 text-primary border-0">{relEventType}</Badge>
                        </div>
                        <CardTitle className="text-sm leading-snug line-clamp-2 mt-2">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" />{formatDate(item.startDate)}</p>
                        {item.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="size-3" />{item.location}</p>}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
