import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  FlaskConical,
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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/db'
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
  const { data: item } = await supabase
    .from('research')
    .select('title, abstract')
    .eq('slug', slug)
    .single()

  if (!item) return { title: 'Tidak Ditemukan' }
  return {
    title: `${item.title} | LPPM Kampus`,
    description: item.abstract || `Detail penelitian: ${item.title}`,
  }
}

// ============ PAGE ============

export default async function PenelitianDetailPage({ params }: PageProps) {
  const { slug } = await params

  // Get main record with joins
  const { data: rawResearch } = await supabase
    .from('research')
    .select(`*, leader:researchers!leader_id(id, name, nidn, photo_url, expertise, email, degree, functional_position, faculty:facilities(id, name), study_program:study_programs(id, name)), faculty:faculties(id, name), study_program:study_programs(id, name), funding_scheme:funding_schemes(id, name, source, slug)`)
    .eq('slug', slug)
    .single()

  if (!rawResearch || !rawResearch.is_published) return notFound()

  // Map snake_case to camelCase for the component
  const research: any = {
    ...rawResearch,
    fundingSchemeId: rawResearch.funding_scheme_id,
    leaderId: rawResearch.leader_id,
    facultyId: rawResearch.faculty_id,
    studyProgramId: rawResearch.study_program_id,
    fundingSource: rawResearch.funding_source,
    startDate: rawResearch.start_date,
    endDate: rawResearch.end_date,
    mainImageUrl: rawResearch.main_image_url,
    documentUrl: rawResearch.document_url,
    isFeatured: rawResearch.is_featured,
    isPublished: rawResearch.is_published,
    createdAt: rawResearch.created_at,
    updatedAt: rawResearch.updated_at,
    leader: rawResearch.leader,
    faculty: rawResearch.faculty,
    studyProgram: rawResearch.study_program,
    fundingScheme: rawResearch.funding_scheme,
  }

  // Get related data in parallel
  const [membersRes, studentMembersRes, publicationsRes] = await Promise.all([
    supabase
      .from('research_members')
      .select('*, researcher:researchers(id, name, nidn, photo_url, expertise, degree)')
      .eq('research_id', research.id),
    supabase
      .from('research_student_members')
      .select('*')
      .eq('research_id', research.id),
    supabase
      .from('publications')
      .select('id, title, slug, publication_type, year, journal_name')
      .eq('research_id', research.id)
      .eq('is_published', true)
      .order('year', { ascending: false })
      .limit(5),
  ])

  research.members = (membersRes.data || []).map((m: any) => ({
    ...m,
    researcherId: m.researcher_id,
    researchId: m.research_id,
    researcher: m.researcher,
  }))

  research.studentMembers = (studentMembersRes.data || []).map((m: any) => ({
    ...m,
    researchId: m.research_id,
    studyProgram: m.study_program,
  }))

  research.publications = (publicationsRes.data || []).map((p: any) => ({
    ...p,
    publicationType: p.publication_type,
    journalName: p.journal_name,
  }))

  const statusLabel =
    PROJECT_STATUS_LABELS[research.status as keyof typeof PROJECT_STATUS_LABELS] || research.status
  const statusColor =
    PROJECT_STATUS_COLORS[research.status as keyof typeof PROJECT_STATUS_COLORS] || ''

  // Related research (same faculty or funding scheme, excluding current)
  const orFilters: string[] = []
  if (research.facultyId) orFilters.push(`faculty_id.eq.${research.facultyId}`)
  if (research.fundingSchemeId) orFilters.push(`funding_scheme_id.eq.${research.fundingSchemeId}`)

  let relatedResearch: any[] = []
  if (orFilters.length > 0) {
    const { data: relData } = await supabase
      .from('research')
      .select('id, title, slug, year, status, abstract, leader:researchers!leader_id(name), funding_source')
      .eq('is_published', true)
      .neq('id', research.id)
      .or(orFilters.join(','))
      .order('created_at', { ascending: false })
      .limit(3)
    relatedResearch = (relData || []).map((r: any) => ({
      ...r,
      fundingSource: r.funding_source,
      leader: r.leader,
    }))
  }

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
              <Link href="/penelitian" className="hover:text-primary transition-colors">
                Penelitian
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium line-clamp-1">{research.title}</li>
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
              {research.year}
            </Badge>
            {research.fundingScheme && (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs backdrop-blur-sm">
                {research.fundingScheme.name}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
            {research.title}
          </h1>
          {research.leader && (
            <p className="mt-4 text-white/80 flex items-center gap-2 text-sm sm:text-base">
              <User className="size-4 shrink-0" />
              Ketua: <span className="font-medium text-white">{research.leader.name}</span>
              {research.leader.degree && (
                <span className="text-white/60">({research.leader.degree})</span>
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
              {/* Abstract */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="size-5 text-primary" />
                    Abstrak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {research.abstract || 'Tidak ada abstrak tersedia.'}
                  </p>
                </CardContent>
              </Card>

              {/* Research Team */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="size-5 text-primary" />
                    Tim Peneliti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Leader */}
                  {research.leader && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Ketua Peneliti
                      </p>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="size-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {getInitials(research.leader.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {research.leader.name}
                            {research.leader.degree && (
                              <span className="text-muted-foreground font-normal">
                                {' '}
                                ({research.leader.degree})
                              </span>
                            )}
                          </p>
                          {research.leader.nidn && (
                            <p className="text-xs text-muted-foreground">NIDN: {research.leader.nidn}</p>
                          )}
                          {research.leader.faculty && (
                            <p className="text-xs text-muted-foreground">{research.leader.faculty.name}</p>
                          )}
                          {research.leader.expertise && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {research.leader.expertise.split(',').map((exp: string, i: number) => (
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
                  {research.members.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Anggota Peneliti
                      </p>
                      <div className="space-y-2">
                        {research.members.map((m: any) => (
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
                  {research.studentMembers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Anggota Mahasiswa
                      </p>
                      <div className="space-y-2">
                        {research.studentMembers.map((sm: any) => (
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

              {/* Outputs */}
              {research.outputs && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="size-5 text-primary" />
                      Luaran Penelitian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {research.outputs}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Related Publications */}
              {research.publications.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="size-5 text-primary" />
                      Publikasi Terkait
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {research.publications.map((pub: any) => (
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
                  {research.fundingScheme && (
                    <div>
                      <p className="text-xs text-muted-foreground">Skema Hibah</p>
                      <Link
                        href={`/hibah/${research.fundingScheme.slug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {research.fundingScheme.name}
                      </Link>
                    </div>
                  )}
                  {research.fundingSource && (
                    <div>
                      <p className="text-xs text-muted-foreground">Sumber Dana</p>
                      <p className="text-sm font-medium">{research.fundingSource}</p>
                    </div>
                  )}
                  {research.budget != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Anggaran</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(research.budget)}</p>
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
                    <p className="text-sm font-medium">{formatDate(research.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Selesai</p>
                    <p className="text-sm font-medium">{formatDate(research.endDate)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={`text-xs border-0 ${statusColor}`}>{statusLabel}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Faculty & Study Program */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-5 text-primary" />
                    Institusi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {research.faculty && (
                    <div>
                      <p className="text-xs text-muted-foreground">Fakultas</p>
                      <p className="text-sm font-medium">{research.faculty.name}</p>
                    </div>
                  )}
                  {research.studyProgram && (
                    <div>
                      <p className="text-xs text-muted-foreground">Program Studi</p>
                      <p className="text-sm font-medium">{research.studyProgram.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Back Button */}
              <Link href="/penelitian">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="size-4 mr-2" />
                  Kembali ke Penelitian
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Research */}
      {relatedResearch.length > 0 && (
        <section className="py-10 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              Penelitian Terkait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedResearch.map((item: any) => {
                const relStatusLabel =
                  PROJECT_STATUS_LABELS[item.status as keyof typeof PROJECT_STATUS_LABELS] ||
                  item.status
                const relStatusColor =
                  PROJECT_STATUS_COLORS[item.status as keyof typeof PROJECT_STATUS_COLORS] || ''
                return (
                  <Link key={item.id} href={`/penelitian/${item.slug}`}>
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
                          {item.abstract || 'Tidak ada abstrak'}
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
