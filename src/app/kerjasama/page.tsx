'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Handshake,
  AlertCircle,
  Filter,
  Building2,
  Globe,
  Calendar,
  ExternalLink,
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
  PARTNER_TYPE_LABELS,
  PARTNER_STATUS_LABELS,
  PARTNER_TYPE_OPTIONS,
  PARTNER_STATUS_COLORS,
} from '@/lib/constants'
import { formatDate, getStatusColor } from '@/lib/helpers'
import type { Partner } from '@/types'

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

// ============ TYPE ICON MAP ============

const partnerTypeIconMap: Record<string, string> = {
  government: '🏛️',
  industry: '🏭',
  ngo: '🤝',
  university: '🎓',
  community: '👥',
  other: '🏢',
}

const partnerTypeColorMap: Record<string, string> = {
  government: 'bg-primary/10 text-primary',
  industry: 'bg-sky-100 text-sky-800',
  ngo: 'bg-emerald-100 text-emerald-800',
  university: 'bg-amber-100 text-amber-800',
  community: 'bg-rose-100 text-rose-800',
  other: 'bg-gray-100 text-gray-700',
}

// ============ DATA FETCHING ============

function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await fetch('/api/partner')
      if (!res.ok) throw new Error('Failed to fetch partners')
      const json = await res.json()
      return (json.data ?? []) as Partner[]
    },
  })
}

// ============ SKELETON ============

function PartnerSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="size-14 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ PAGE COMPONENT ============

export default function KerjasamaPage() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const { data, isLoading, error } = usePartners()

  const filteredData =
    selectedType === 'all'
      ? data ?? []
      : (data ?? []).filter((p) => p.partnerType === selectedType)

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
                <Handshake className="size-3.5 mr-1" />
                Kolaborasi
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Kerja Sama / Mitra
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-3 text-lg text-white/80 max-w-2xl"
            >
              Mitra strategis dalam penelitian dan pengabdian kepada masyarakat
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8 flex-wrap"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <span className="font-medium">Tipe Mitra:</span>
            </div>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {PARTNER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data && (
              <span className="text-sm text-muted-foreground ml-auto">
                {filteredData.length} mitra
              </span>
            )}
          </motion.div>

          {isLoading ? (
            <PartnerSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium">Gagal memuat mitra</p>
              <p className="text-sm text-muted-foreground mt-1">
                Silakan coba lagi nanti
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16">
              <Handshake className="size-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Mitra
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {selectedType !== 'all'
                  ? 'Tidak ada mitra dengan tipe yang dipilih.'
                  : 'Saat ini belum ada mitra kerja sama yang terdaftar.'}
              </p>
              {selectedType !== 'all' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedType('all')}
                >
                  Lihat Semua Mitra
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
            >
              {filteredData.map((partner) => (
                <motion.div key={partner.id} variants={staggerItem}>
                  <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Logo placeholder */}
                        <div className="size-14 rounded-xl bg-muted/50 border border-border flex items-center justify-center shrink-0">
                          {partner.logoUrl ? (
                            <img
                              src={partner.logoUrl}
                              alt={partner.name}
                              className="size-10 object-contain"
                            />
                          ) : (
                            <span className="text-2xl">
                              {partnerTypeIconMap[partner.partnerType] || '🏢'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm lg:text-base leading-snug truncate">
                            {partner.name}
                          </h3>
                          <Badge
                            className={`text-[10px] border-0 mt-1 ${
                              partnerTypeColorMap[partner.partnerType] ||
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {PARTNER_TYPE_LABELS[partner.partnerType]}
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-2 text-sm">
                        {partner.cooperationType && (
                          <div className="flex items-start gap-2">
                            <Globe className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              {partner.cooperationType}
                            </span>
                          </div>
                        )}
                        {partner.address && (
                          <div className="flex items-start gap-2">
                            <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-xs line-clamp-2">
                              {partner.address}
                            </span>
                          </div>
                        )}
                        {partner.startDate && (
                          <div className="flex items-start gap-2">
                            <Calendar className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-xs">
                              {formatDate(partner.startDate)}
                              {partner.endDate && ` - ${formatDate(partner.endDate)}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="mt-4 pt-3 border-t flex items-center gap-2">
                        <Badge
                          className={`text-[10px] border-0 ${
                            PARTNER_STATUS_COLORS[partner.status] ||
                            getStatusColor(partner.status)
                          }`}
                        >
                          {PARTNER_STATUS_LABELS[partner.status]}
                        </Badge>
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
