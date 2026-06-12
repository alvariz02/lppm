'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Megaphone, AlertCircle, Calendar, FileText, ChevronRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, truncateText } from '@/lib/helpers'
import { ANNOUNCEMENT_TYPE_LABELS } from '@/lib/constants'
import type { Announcement } from '@/types'

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ============ DATA FETCHING ============

function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await fetch('/api/announcement')
      if (!res.ok) throw new Error('Failed to fetch announcements')
      const json = await res.json()
      return (json.data ?? []) as Announcement[]
    },
  })
}

// ============ SKELETON ============

function AnnouncementSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 lg:p-5 border-b last:border-b-0">
            <div className="flex items-start gap-4">
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============ PAGE COMPONENT ============

export default function PengumumanPage() {
  const { data, isLoading, error } = useAnnouncements()

  const importantAnnouncements = data?.filter((a) => a.type === 'important') ?? []
  const normalAnnouncements = data?.filter((a) => a.type === 'normal') ?? []
  const allAnnouncements = data ?? []

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary min-h-[260px] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 size-96 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute top-1/2 -left-32 size-80 rounded-full bg-accent/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30 text-sm px-4 py-1.5 font-medium backdrop-blur-sm">
                <Megaphone className="size-3.5 mr-1" />
                Informasi
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Pengumuman
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-3 text-lg text-white/80 max-w-2xl"
            >
              Informasi dan pengumuman resmi dari LPPM
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <AnnouncementSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium">Gagal memuat pengumuman</p>
              <p className="text-sm text-muted-foreground mt-1">
                Silakan coba lagi nanti
              </p>
            </div>
          ) : allAnnouncements.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="size-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Pengumuman
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Saat ini belum ada pengumuman yang tersedia. Silakan cek kembali nanti.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <Accordion type="multiple" className="space-y-3">
                {allAnnouncements.map((announcement) => (
                  <motion.div key={announcement.id} variants={staggerItem}>
                    <AccordionItem
                      value={announcement.id}
                      className="border-0"
                    >
                      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                        <AccordionTrigger className="px-4 lg:px-6 py-4 lg:py-5 hover:no-underline hover:bg-muted/30 transition-colors [&[data-state=open]]:bg-muted/30">
                          <div className="flex items-start gap-3 lg:gap-4 text-left flex-1 pr-4">
                            <div
                              className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                                announcement.type === 'important'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {announcement.type === 'important' ? (
                                <AlertCircle className="size-5" />
                              ) : (
                                <Megaphone className="size-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-foreground text-sm lg:text-base leading-snug">
                                  {announcement.title}
                                </h3>
                                {announcement.type === 'important' && (
                                  <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0 border-0 shrink-0">
                                    <AlertCircle className="size-2.5 mr-0.5" />
                                    Penting
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  {formatDate(announcement.publishedAt)}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0"
                                >
                                  {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 lg:px-6 pb-4 lg:pb-5">
                          <div className="pl-14 lg:pl-14">
                            {announcement.content ? (
                              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {announcement.content}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                Tidak ada konten tambahan
                              </p>
                            )}
                            {announcement.attachmentUrl && (
                              <a
                                href={announcement.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                              >
                                <FileText className="size-4" />
                                Lampiran
                                <ChevronRight className="size-3" />
                              </a>
                            )}
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
