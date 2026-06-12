'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  Building2, Save, Loader2, Eye, User, Target, Briefcase, MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { lppmProfileSchema } from '@/lib/validations'

// ============ TYPES ============

interface LppmProfileData {
  id: string
  about: string | null
  vision: string | null
  mission: string | null
  goals: string | null
  duties: string | null
  chairmanName: string | null
  chairmanPhotoUrl: string | null
  chairmanMessage: string | null
  structureImageUrl: string | null
  createdAt: string
  updatedAt: string
}

type LppmProfileFormValues = {
  about: string | null
  vision: string | null
  mission: string | null
  goals: string | null
  duties: string | null
  chairmanName: string | null
  chairmanPhotoUrl: string | null
  chairmanMessage: string | null
  structureImageUrl: string | null
}

// ============ ANIMATION ============

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const animItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

// ============ MAIN COMPONENT ============

export default function AdminProfilLppmPage() {
  const queryClient = useQueryClient()
  const [showPreview, setShowPreview] = useState(false)

  // ============ FORM ============

  const form = useForm<LppmProfileFormValues>({
    resolver: zodResolver(lppmProfileSchema),
    defaultValues: {
      about: '',
      vision: '',
      mission: '',
      goals: '',
      duties: '',
      chairmanName: '',
      chairmanPhotoUrl: '',
      chairmanMessage: '',
      structureImageUrl: '',
    },
  })

  // ============ QUERY ============

  const { isLoading } = useQuery({
    queryKey: ['admin-lppm-profile'],
    queryFn: async () => {
      const res = await fetch('/api/admin/lppm-profile')
      if (!res.ok) throw new Error('Gagal memuat profil')
      const result = await res.json()
      return result.data as LppmProfileData | null
    },
    onSuccess: (data: LppmProfileData | null) => {
      if (data) {
        form.reset({
          about: data.about || '',
          vision: data.vision || '',
          mission: data.mission || '',
          goals: data.goals || '',
          duties: data.duties || '',
          chairmanName: data.chairmanName || '',
          chairmanPhotoUrl: data.chairmanPhotoUrl || '',
          chairmanMessage: data.chairmanMessage || '',
          structureImageUrl: data.structureImageUrl || '',
        })
      }
    },
  })

  // ============ MUTATION ============

  const saveMutation = useMutation({
    mutationFn: async (values: LppmProfileFormValues) => {
      const res = await fetch('/api/admin/lppm-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menyimpan profil')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lppm-profile'] })
    },
  })

  // ============ HANDLERS ============

  const onSubmit = useCallback(
    (values: LppmProfileFormValues) => {
      saveMutation.mutate(values)
    },
    [saveMutation]
  )

  // Watch form values for preview
  const watchAll = form.watch()

  // ============ RENDER ============

  if (isLoading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
        <motion.div variants={animItem} className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Profil LPPM</h2>
            <p className="text-sm text-muted-foreground">Kelola profil Lembaga</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-24 w-full" /></div>
            ))}
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent></Card>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      {/* Header */}
      <motion.div variants={animItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Profil LPPM</h2>
            <p className="text-sm text-muted-foreground">Kelola informasi profil Lembaga Penelitian dan Pengabdian kepada Masyarakat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="hidden lg:flex"
          >
            <Eye className="size-4 mr-1" />
            {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview'}
          </Button>
          <Button
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Save className="size-4 mr-1" />
            )}
            Simpan Profil
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={animItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* About */}
                <FormField control={form.control} name="about" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="size-3.5" />
                      Tentang LPPM
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi tentang LPPM..."
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vision */}
                  <FormField control={form.control} name="vision" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="size-3.5" />
                        Visi
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Visi LPPM..."
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Mission */}
                  <FormField control={form.control} name="mission" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="size-3.5" />
                        Misi
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Misi LPPM..."
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Goals */}
                  <FormField control={form.control} name="goals" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="size-3.5" />
                        Tujuan
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tujuan LPPM..."
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Duties */}
                  <FormField control={form.control} name="duties" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="size-3.5" />
                        Tugas & Fungsi
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tugas dan fungsi LPPM..."
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                {/* Chairman */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="size-3.5" />
                    Ketua LPPM
                  </h3>
                  <FormField control={form.control} name="chairmanName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Ketua</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama ketua LPPM" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="chairmanPhotoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto Ketua URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="chairmanMessage" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="size-3.5" />
                        Sambutan Ketua
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Sambutan ketua LPPM..."
                          rows={4}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                {/* Structure */}
                <FormField control={form.control} name="structureImageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Struktur Organisasi (Gambar URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://... (URL gambar struktur organisasi)" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Mobile save button */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="size-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="size-4 mr-1" />
                    )}
                    Simpan Profil
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview */}
        {(showPreview || typeof window === 'undefined') && (
          <div className="hidden lg:block space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Preview Profil</CardTitle>
                <CardDescription>Tampilan profil di halaman publik</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* About */}
                {watchAll.about && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Tentang LPPM</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{watchAll.about}</p>
                  </div>
                )}

                {/* Vision & Mission */}
                {(watchAll.vision || watchAll.mission) && (
                  <div className="grid grid-cols-2 gap-3">
                    {watchAll.vision && (
                      <div className="rounded-lg border p-3">
                        <Badge variant="outline" className="mb-2">Visi</Badge>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{watchAll.vision}</p>
                      </div>
                    )}
                    {watchAll.mission && (
                      <div className="rounded-lg border p-3">
                        <Badge variant="outline" className="mb-2">Misi</Badge>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{watchAll.mission}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Goals & Duties */}
                {(watchAll.goals || watchAll.duties) && (
                  <div className="grid grid-cols-2 gap-3">
                    {watchAll.goals && (
                      <div className="rounded-lg border p-3">
                        <Badge variant="outline" className="mb-2">Tujuan</Badge>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{watchAll.goals}</p>
                      </div>
                    )}
                    {watchAll.duties && (
                      <div className="rounded-lg border p-3">
                        <Badge variant="outline" className="mb-2">Tugas & Fungsi</Badge>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{watchAll.duties}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Chairman */}
                {watchAll.chairmanName && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {watchAll.chairmanPhotoUrl ? (
                        <img
                          src={watchAll.chairmanPhotoUrl}
                          alt={watchAll.chairmanName}
                          className="size-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="size-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{watchAll.chairmanName}</p>
                        <Badge variant="outline" className="text-xs mt-0.5">Ketua LPPM</Badge>
                      </div>
                    </div>
                    {watchAll.chairmanMessage && (
                      <p className="text-xs text-muted-foreground mt-2 italic whitespace-pre-line">&ldquo;{watchAll.chairmanMessage}&rdquo;</p>
                    )}
                  </div>
                )}

                {/* Structure Image */}
                {watchAll.structureImageUrl && (
                  <div>
                    <Badge variant="outline" className="mb-2">Struktur Organisasi</Badge>
                    <img
                      src={watchAll.structureImageUrl}
                      alt="Struktur Organisasi"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}

                {/* Empty state */}
                {!watchAll.about && !watchAll.vision && !watchAll.mission && !watchAll.chairmanName && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="size-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Isi form untuk melihat preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
