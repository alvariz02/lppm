'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  AlertCircle,
  Filter,
  MapPin,
  Clock,
  Users,
  Tag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AGENDA_EVENT_TYPE_LABELS,
  AGENDA_STATUS_LABELS,
  AGENDA_EVENT_TYPE_OPTIONS,
  AGENDA_STATUS_OPTIONS,
  AGENDA_STATUS_COLORS,
} from '@/lib/constants'
import { formatDate, getStatusColor } from '@/lib/helpers'
import type { Agenda } from '@/types'

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

// ============ EVENT TYPE ICON MAP ============

const eventTypeColorMap: Record<string, string> = {
  seminar: 'bg-primary/10 text-primary',
  workshop: 'bg-sky-100 text-sky-700',
  sosialisasi: 'bg-emerald-100 text-emerald-700',
  monev: 'bg-amber-100 text-amber-700',
  deadline: 'bg-red-100 text-red-700',
  pelatihan: 'bg-purple-100 text-purple-700',
}

const eventTypeIconMap: Record<string, string> = {
  seminar: '🎤',
  workshop: '🔧',
  sosialisasi: '📢',
  monev: '📊',
  deadline: '⏰',
  pelatihan: '📚',
}

// ============ DATA FETCHING ============

function useAgenda(status: string, eventType: string | null) {
  return useQuery({
    queryKey: ['agenda', status, eventType],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('status', status)
      if (eventType) params.set('eventType', eventType)
      const res = await fetch(`/api/agenda?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch agenda')
      const json = await res.json()
      return (json.data ?? []) as Agenda[]
    },
  })
}

// ============ SKELETON ============

function AgendaSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="size-14 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ PAGE COMPONENT ============

export default function AgendaPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('upcoming')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')

  const { data, isLoading, error } = useAgenda(
    selectedStatus,
    selectedEventType === 'all' ? null : selectedEventType
  )

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
                <CalendarDays className="size-3.5 mr-1" />
                Jadwal
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Agenda Kegiatan
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-3 text-lg text-white/80 max-w-2xl"
            >
              Jadwal kegiatan dan acara LPPM
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8 flex-wrap"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <span className="font-medium">Filter:</span>
            </div>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {AGENDA_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedEventType}
              onValueChange={setSelectedEventType}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Jenis Acara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {AGENDA_EVENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data && (
              <span className="text-sm text-muted-foreground ml-auto">
                {data.length} kegiatan
              </span>
            )}
          </motion.div>

          {isLoading ? (
            <AgendaSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium">Gagal memuat agenda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Silakan coba lagi nanti
              </p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="size-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Tidak Ada Kegiatan
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {selectedStatus !== 'upcoming' || selectedEventType !== 'all'
                  ? 'Tidak ada kegiatan dengan filter yang dipilih.'
                  : 'Saat ini belum ada agenda kegiatan yang dijadwalkan.'}
              </p>
              {(selectedStatus !== 'upcoming' || selectedEventType !== 'all') && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedStatus('upcoming')
                    setSelectedEventType('all')
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4"
            >
              {data.map((agenda) => (
                <motion.div key={agenda.id} variants={staggerItem}>
                  <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-white">
                    <CardContent className="p-5 lg:p-6">
                      <div className="flex items-start gap-4">
                        {/* Date badge */}
                        <div className="size-14 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                          {agenda.startDate && (
                            <>
                              <span className="text-lg font-bold leading-none">
                                {new Date(agenda.startDate).getDate()}
                              </span>
                              <span className="text-[10px] font-medium leading-tight mt-0.5">
                                {new Date(agenda.startDate).toLocaleDateString('id-ID', { month: 'short' })}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title and badges */}
                          <div className="flex items-start gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-foreground text-sm lg:text-base leading-snug">
                              {agenda.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            {agenda.eventType && (
                              <Badge
                                className={`text-[10px] border-0 ${
                                  eventTypeColorMap[agenda.eventType] || 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {eventTypeIconMap[agenda.eventType] || ''}{' '}
                                {AGENDA_EVENT_TYPE_LABELS[agenda.eventType]}
                              </Badge>
                            )}
                            <Badge
                              className={`text-[10px] border-0 ${
                                AGENDA_STATUS_COLORS[agenda.status] ||
                                getStatusColor(agenda.status)
                              }`}
                            >
                              {AGENDA_STATUS_LABELS[agenda.status]}
                            </Badge>
                          </div>

                          {/* Details */}
                          <div className="space-y-1.5 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="size-3.5 shrink-0" />
                              <span className="text-xs">
                                {formatDate(agenda.startDate)}
                                {agenda.endDate &&
                                  ` — ${formatDate(agenda.endDate)}`}
                              </span>
                            </div>
                            {agenda.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="size-3.5 shrink-0" />
                                <span className="text-xs">{agenda.location}</span>
                              </div>
                            )}
                            {agenda.organizer && (
                              <div className="flex items-center gap-2">
                                <Users className="size-3.5 shrink-0" />
                                <span className="text-xs">{agenda.organizer}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {agenda.description && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              {agenda.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
