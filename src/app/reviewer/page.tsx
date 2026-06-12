'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { UserCheck, AlertCircle, Filter, GraduationCap, Building2 } from 'lucide-react'
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
import { REVIEWER_TYPE_LABELS } from '@/lib/constants'
import { getInitials } from '@/lib/helpers'
import type { Reviewer } from '@/types'

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

function useReviewers() {
  return useQuery({
    queryKey: ['reviewers'],
    queryFn: async () => {
      const res = await fetch('/api/reviewer')
      if (!res.ok) throw new Error('Failed to fetch reviewers')
      const json = await res.json()
      return (json.data ?? []) as Reviewer[]
    },
  })
}

// ============ SKELETON ============

function ReviewerSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="size-14 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ PAGE COMPONENT ============

export default function ReviewerPage() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const { data, isLoading, error } = useReviewers()

  const filteredData =
    selectedType === 'all'
      ? data ?? []
      : (data ?? []).filter((r) => r.reviewerType === selectedType)

  const typeColorMap: Record<string, string> = {
    internal: 'bg-primary/10 text-primary',
    external: 'bg-sky-100 text-sky-700',
  }

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
                <UserCheck className="size-3.5 mr-1" />
                Tim Peninjau
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Reviewer / Mitra Bestari
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-3 text-lg text-white/80 max-w-2xl"
            >
              Para ahli peninjau yang menjamin kualitas riset dan pengabdian
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
            className="flex items-center gap-3 mb-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <span className="font-medium">Tipe Reviewer:</span>
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
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">Eksternal</SelectItem>
              </SelectContent>
            </Select>
            {data && (
              <span className="text-sm text-muted-foreground ml-auto">
                {filteredData.length} reviewer
              </span>
            )}
          </motion.div>

          {isLoading ? (
            <ReviewerSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium">Gagal memuat reviewer</p>
              <p className="text-sm text-muted-foreground mt-1">
                Silakan coba lagi nanti
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck className="size-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Reviewer
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {selectedType !== 'all'
                  ? 'Tidak ada reviewer dengan tipe yang dipilih.'
                  : 'Saat ini belum ada reviewer yang terdaftar.'}
              </p>
              {selectedType !== 'all' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedType('all')}
                >
                  Lihat Semua Reviewer
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
              {filteredData.map((reviewer) => (
                <motion.div key={reviewer.id} variants={staggerItem}>
                  <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-lg">
                          {getInitials(reviewer.name)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm lg:text-base leading-snug truncate">
                            {reviewer.name}
                          </h3>

                          {reviewer.nidn && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <GraduationCap className="size-3 shrink-0" />
                              NIDN: {reviewer.nidn}
                            </p>
                          )}

                          {reviewer.institution && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                              <Building2 className="size-3 shrink-0" />
                              {reviewer.institution}
                            </p>
                          )}

                          {/* Badges */}
                          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                            <Badge
                              className={`text-[10px] border-0 ${typeColorMap[reviewer.reviewerType] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {REVIEWER_TYPE_LABELS[reviewer.reviewerType]}
                            </Badge>
                            {reviewer.expertise &&
                              reviewer.expertise.split(',').map((exp, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px] py-0"
                                >
                                  {exp.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Email / Contact */}
                      {reviewer.email && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground truncate">
                            {reviewer.email}
                          </p>
                        </div>
                      )}
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
