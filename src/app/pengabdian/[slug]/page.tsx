import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  HeartHandshake,
  Calendar,
  User,
  Users,
  GraduationCap,
  Banknote,
  Building2,
  BookOpen,
  FileText,
  ArrowLeft,
  MapPin,
  Target,
  Package,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { db } from '@/lib/db'
import {
  formatDate,
  formatCurrency,
  getInitials,
} from '@/lib/helpers'
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  MEMBER_ROLE_LABELS,
} from '@/lib/constants'

// ============ TYPES ============

type PageProps = {
  params: Promise<{ slug: string }>
}

// ============ METADATA ============

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await db.communityService.findUnique({
    where: { slug },
    select: { title: true, summary: true },
  })
  if (!item) return { title: 'Tidak Ditemukan' }
  return {
    title: `${item.title} | LPPM Kampus`,
    description: item.summary || `Detail pengabdian: ${item.title}`,
  }
}

// ============ PAGE ============

export default async function PengabdianDetailPage({ params }: PageProps) {
  const { slug } = await params

  const service = await db.communityService.findUnique({
    where: { slug },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          nidn: true,
          photoUrl: true,
          expertise: true,
          email: true,
          degree: true,
          functionalPosition: true,
          faculty: { select: { name: true } },
          studyProgram: { select: { name: true } },
        },
      },
      faculty: { select: { name: true } },
      studyProgram: { select: { name: true } },
      fundingScheme: { select: { name: true, source: true, slug: true } },
      members: {
        include: {
          researcher: {
            select: {
              id: true,
              name: true,
              nidn: true,
              photoUrl: true,
              expertise: true,
              degree: true,
            },
          },
        },
      },
      studentMembers: true,
      publications: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          publicationType: true,
          year: true,
          journalName: true,
        },
        take: 5,
        orderBy: { year: 'desc' },
      },
    },
  })

  if (!service || !service.isPublished) return notFound()

  const statusLabel =
    PROJECT_STATUS_LABELS[service.status as keyof typeof PROJECT_STATUS_LABELS] || service.status
  const statusColor =
    PROJECT_STATUS_COLORS[service.status as keyof typeof PROJECT_STATUS_COLORS] || ''

  // Build location string
  const locationParts = [
    service.village,
    service.district,
    service.regency,
    service.location,
  ].filter(Boolean)
  const locationString = locationParts.join(', ')

  // Related community services (same faculty, excluding current)
  const relatedServices = await db.communityService.findMany({
    where: {
      isPublished: true,
      id: { not: service.id },
      ...(service.facultyId ? { facultyId: service.facultyId } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      year: true,
      status: true,
      summary: true,
      leader: { select: { name: true } },
      fundingSource: true,
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

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
              <Link href="/pengabdian" className="hover:text-primary transition-colors">
                Pengabdian
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium line-clamp-1">{service.title}</li>
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
              {service.year}
            </Badge>
            {service.fundingScheme && (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs backdrop-blur-sm">
                {service.fundingScheme.name}
              </Badge>
            )}
            {locationString && (
              <Badge className="bg-white/10 text-white border-white/20 text-xs backdrop-blur-sm">
                <MapPin className="size-3 mr-1" />
                {service.village || service.regency || service.location}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
            {service.title}
          </h1>
          {service.leader && (
            <p className="mt-4 text-white/80 flex items-center gap-2 text-sm sm:text-base">
              <User className="size-4 shrink-0" />
              Ketua: <span className="font-medium text-white">{service.leader.name}</span>
              {service.leader.degree && (
                <span className="text-white/60">({service.leader.degree})</span>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Summary */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="size-5 text-primary" />
                    Ringkasan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {service.summary || 'Tidak ada ringkasan tersedia.'}
                  </p>
                </CardContent>
              </Card>

              {/* Team */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="size-5 text-primary" />
                    Tim Pengabdian
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Leader */}
                  {service.leader && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Ketua Pengabdian
                      </p>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="size-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {getInitials(service.leader.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {service.leader.name}
                            {service.leader.degree && (
                              <span className="text-muted-foreground font-normal">
                                {' '}
                                ({service.leader.degree})
                              </span>
                            )}
                          </p>
                          {service.leader.nidn && (
                            <p className="text-xs text-muted-foreground">NIDN: {service.leader.nidn}</p>
                          )}
                          {service.leader.faculty && (
                            <p className="text-xs text-muted-foreground">{service.leader.faculty.name}</p>
                          )}
                          {service.leader.expertise && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {service.leader.expertise.split(',').map((exp, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">
                                  {exp.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Members */}
                  {service.members.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Anggota Pengabdian
                      </p>
                      <div className="space-y-2">
                        {service.members.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                            <div className="size-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
                              {getInitials(m.researcher.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {m.researcher.name}
                                {m.researcher.degree && (
                                  <span className="text-muted-foreground font-normal">
                                    {' '}
                                    ({m.researcher.degree})
                                  </span>
                                )}
                              </p>
                              {m.researcher.nidn && (
                                <p className="text-xs text-muted-foreground">NIDN: {m.researcher.nidn}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Members */}
                  {service.studentMembers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Anggota Mahasiswa
                      </p>
                      <div className="space-y-2">
                        {service.studentMembers.map((sm) => (
                          <div key={sm.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                            <div className="size-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground font-bold text-xs shrink-0">
                              <GraduationCap className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {sm.studentName}
                              </p>
                              {sm.nim && (
                                <p className="text-xs text-muted-foreground">NIM: {sm.nim}</p>
                              )}
                              {sm.studyProgram && (
                                <p className="text-xs text-muted-foreground">{sm.studyProgram}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              {locationString && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="size-5 text-primary" />
                      Lokasi Pengabdian
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {service.location && (
                      <div>
                        <p className="text-xs text-muted-foreground">Lokasi</p>
                        <p className="text-sm font-medium">{service.location}</p>
                      </div>
                    )}
                    {service.village && (
                      <div>
                        <p className="text-xs text-muted-foreground">Desa/Kelurahan</p>
                        <p className="text-sm font-medium">{service.village}</p>
                      </div>
                    )}
                    {service.district && (
                      <div>
                        <p className="text-xs text-muted-foreground">Kecamatan</p>
                        <p className="text-sm font-medium">{service.district}</p>
                      </div>
                    )}
                    {service.regency && (
                      <div>
                        <p className="text-xs text-muted-foreground">Kabupaten/Kota</p>
                        <p className="text-sm font-medium">{service.regency}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Impact */}
              {service.impact && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="size-5 text-primary" />
                      Dampak Pengabdian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {service.impact}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Outputs */}
              {service.outputs && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="size-5 text-primary" />
                      Luaran Pengabdian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {service.outputs}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Related Publications */}
              {service.publications.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="size-5 text-primary" />
                      Publikasi Terkait
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {service.publications.map((pub) => (
                      <Link
                        key={pub.id}
                        href={`/publikasi/${pub.slug}`}
                        className="block p-3 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                      >
                        <p className="font-medium text-foreground text-sm line-clamp-2">{pub.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {pub.publicationType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{pub.year}</span>
                          {pub.journalName && (
                            <span className="text-xs text-muted-foreground italic line-clamp-1">
                              {pub.journalName}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Funding Info */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Banknote className="size-5 text-accent" />
                    Informasi Pendanaan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.fundingScheme && (
                    <div>
                      <p className="text-xs text-muted-foreground">Skema Hibah</p>
                      <Link
                        href={`/hibah/${service.fundingScheme.slug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {service.fundingScheme.name}
                      </Link>
                    </div>
                  )}
                  {service.fundingSource && (
                    <div>
                      <p className="text-xs text-muted-foreground">Sumber Dana</p>
                      <p className="text-sm font-medium">{service.fundingSource}</p>
                    </div>
                  )}
                  {service.budget != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Anggaran</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(service.budget)}</p>
                    </div>
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
                    <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
                    <p className="text-sm font-medium">{formatDate(service.startDate!)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Selesai</p>
                    <p className="text-sm font-medium">{formatDate(service.endDate!)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={`text-xs border-0 ${statusColor}`}>{statusLabel}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Institution */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-5 text-primary" />
                    Institusi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.faculty && (
                    <div>
                      <p className="text-xs text-muted-foreground">Fakultas</p>
                      <p className="text-sm font-medium">{service.faculty.name}</p>
                    </div>
                  )}
                  {service.studyProgram && (
                    <div>
                      <p className="text-xs text-muted-foreground">Program Studi</p>
                      <p className="text-sm font-medium">{service.studyProgram.name}</p>
                    </div>
                  )}
                  {service.partnerName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Mitra</p>
                      <p className="text-sm font-medium">{service.partnerName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Back Button */}
              <Link href="/pengabdian">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="size-4 mr-2" />
                  Kembali ke Pengabdian
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Community Services */}
      {relatedServices.length > 0 && (
        <section className="py-10 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <HeartHandshake className="size-5 text-primary" />
              Pengabdian Terkait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((item) => {
                const relStatusLabel =
                  PROJECT_STATUS_LABELS[item.status as keyof typeof PROJECT_STATUS_LABELS] ||
                  item.status
                const relStatusColor =
                  PROJECT_STATUS_COLORS[item.status as keyof typeof PROJECT_STATUS_COLORS] || ''
                return (
                  <Link key={item.id} href={`/pengabdian/${item.slug}`}>
                    <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[10px] border-0 ${relStatusColor}`}>
                            {relStatusLabel}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {item.year}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm leading-snug line-clamp-2 mt-2">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.summary || 'Tidak ada ringkasan'}
                        </p>
                        {item.leader && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <User className="size-3" />
                            {item.leader.name}
                          </p>
                        )}
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
