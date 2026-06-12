import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Banknote,
  Calendar,
  FileDown,
  ExternalLink,
  FlaskConical,
  HeartHandshake,
  ArrowLeft,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { db } from '@/lib/db'
import { formatDate, formatCurrency } from '@/lib/helpers'
import {
  FUNDING_SCHEME_STATUS_LABELS,
  FUNDING_SCHEME_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from '@/lib/constants'

// ============ TYPES ============

type PageProps = {
  params: Promise<{ slug: string }>
}

// ============ METADATA ============

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await db.fundingScheme.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!item) return { title: 'Tidak Ditemukan' }
  return {
    title: `${item.name} | LPPM Kampus`,
    description: item.description || `Skema hibah: ${item.name}`,
  }
}

// ============ PAGE ============

export default async function HibahDetailPage({ params }: PageProps) {
  const { slug } = await params

  const scheme = await db.fundingScheme.findUnique({
    where: { slug },
    include: {
      researches: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          year: true,
          status: true,
          leader: { select: { name: true } },
          fundingSource: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      communityServices: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          year: true,
          status: true,
          leader: { select: { name: true } },
          fundingSource: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!scheme) return notFound()

  const statusLabel =
    FUNDING_SCHEME_STATUS_LABELS[scheme.status as keyof typeof FUNDING_SCHEME_STATUS_LABELS] ||
    scheme.status
  const statusColor =
    FUNDING_SCHEME_STATUS_COLORS[scheme.status as keyof typeof FUNDING_SCHEME_STATUS_COLORS] || ''

  const isOpen = scheme.status === 'active'
  const isClosed = scheme.status === 'closed'
  const isDeadlineSoon =
    scheme.deadline &&
    new Date(scheme.deadline) > new Date() &&
    new Date(scheme.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/hibah" className="hover:text-primary transition-colors">
                Hibah &amp; Pendanaan
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium line-clamp-1">{scheme.name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-12 lg:py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 size-96 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute bottom-0 -left-32 size-80 rounded-full bg-accent/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge className={`text-xs border-0 ${statusColor}`}>{statusLabel}</Badge>
            <Badge variant="outline" className="text-xs border-white/30 text-white">
              {scheme.year}
            </Badge>
            {scheme.source && (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs backdrop-blur-sm">
                {scheme.source}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
            {scheme.name}
          </h1>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {isOpen && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <CheckCircle2 className="size-4 text-green-300" />
                <span>Pendaftaran Dibuka</span>
              </div>
            )}
            {isClosed && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock className="size-4" />
                <span>Pendaftaran Ditutup</span>
              </div>
            )}
            {isDeadlineSoon && (
              <div className="flex items-center gap-2 text-amber-200 text-sm">
                <AlertTriangle className="size-4" />
                <span>Deadline segera!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Banknote className="size-5 text-primary" />
                    Deskripsi Skema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {scheme.description || 'Tidak ada deskripsi tersedia.'}
                  </p>
                </CardContent>
              </Card>

              {/* Requirements */}
              {scheme.requirements && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="size-5 text-primary" />
                      Persyaratan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {scheme.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Researches */}
              {scheme.researches.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FlaskConical className="size-5 text-primary" />
                      Penelitian Terkait ({scheme.researches.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scheme.researches.map((r) => {
                      const rStatusLabel =
                        PROJECT_STATUS_LABELS[r.status as keyof typeof PROJECT_STATUS_LABELS] ||
                        r.status
                      const rStatusColor =
                        PROJECT_STATUS_COLORS[r.status as keyof typeof PROJECT_STATUS_COLORS] || ''
                      return (
                        <Link
                          key={r.id}
                          href={`/penelitian/${r.slug}`}
                          className="block p-3 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                        >
                          <p className="font-medium text-foreground text-sm line-clamp-2">
                            {r.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={`text-[10px] border-0 ${rStatusColor}`}>
                              {rStatusLabel}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {r.year}
                            </Badge>
                            {r.leader && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="size-3" />
                                {r.leader.name}
                              </span>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Community Services */}
              {scheme.communityServices.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <HeartHandshake className="size-5 text-primary" />
                      Pengabdian Terkait ({scheme.communityServices.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scheme.communityServices.map((s) => {
                      const sStatusLabel =
                        PROJECT_STATUS_LABELS[s.status as keyof typeof PROJECT_STATUS_LABELS] ||
                        s.status
                      const sStatusColor =
                        PROJECT_STATUS_COLORS[s.status as keyof typeof PROJECT_STATUS_COLORS] || ''
                      return (
                        <Link
                          key={s.id}
                          href={`/pengabdian/${s.slug}`}
                          className="block p-3 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                        >
                          <p className="font-medium text-foreground text-sm line-clamp-2">
                            {s.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={`text-[10px] border-0 ${sStatusColor}`}>
                              {sStatusLabel}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {s.year}
                            </Badge>
                            {s.leader && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="size-3" />
                                {s.leader.name}
                              </span>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget Range */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Banknote className="size-5 text-accent" />
                    Besaran Dana
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scheme.minBudget != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Anggaran Minimal</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(scheme.minBudget)}
                      </p>
                    </div>
                  )}
                  {scheme.maxBudget != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Anggaran Maksimal</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(scheme.maxBudget)}
                      </p>
                    </div>
                  )}
                  {scheme.minBudget == null && scheme.maxBudget == null && (
                    <p className="text-sm text-muted-foreground">Belum ditentukan</p>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="size-5 text-secondary" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Buka</p>
                    <p className="text-sm font-medium">{formatDate(scheme.openDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Tutup (Deadline)</p>
                    <p className="text-sm font-medium">{formatDate(scheme.deadline)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={`text-xs border-0 ${statusColor}`}>{statusLabel}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scheme.guideFileUrl && (
                    <Button asChild className="w-full" variant="outline">
                      <a href={scheme.guideFileUrl} target="_blank" rel="noopener noreferrer">
                        <FileDown className="size-4 mr-2" />
                        Unduh Panduan
                      </a>
                    </Button>
                  )}
                  {scheme.registrationUrl && (
                    <Button asChild className="w-full">
                      <a href={scheme.registrationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4 mr-2" />
                        Daftar Sekarang
                      </a>
                    </Button>
                  )}
                  {!scheme.guideFileUrl && !scheme.registrationUrl && (
                    <p className="text-sm text-muted-foreground text-center">
                      Belum ada tautan tersedia
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Back Button */}
              <Link href="/hibah">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="size-4 mr-2" />
                  Kembali ke Hibah
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
