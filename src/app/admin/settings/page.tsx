'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Settings, Globe, Share2, Search as SearchIcon, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { siteSettingSchema, type SiteSettingInput } from '@/lib/validations'
import type { SiteSetting } from '@/types'

// ============ API HELPERS ============

async function fetchSettings() {
  const res = await fetch('/api/admin/settings')
  if (!res.ok) throw new Error('Gagal memuat pengaturan')
  const json = await res.json()
  return json.data as SiteSetting | null
}

async function saveSettings(data: SiteSettingInput) {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menyimpan pengaturan')
  }
  return res.json()
}

// ============ MAIN PAGE ============

export default function SettingsAdminPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
  })

  const form = useForm<SiteSettingInput>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: {
      siteName: '',
      lppmName: '',
      logoUrl: '',
      lppmLogoUrl: '',
      faviconUrl: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      googleMapsUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      seoTitle: '',
      seoDescription: '',
    },
  })

  // Sync form with fetched data
  const synced = useQuery({
    queryKey: ['admin-settings-sync'],
    queryFn: async () => {
      if (settings) {
        form.reset({
          siteName: settings.siteName ?? '',
          lppmName: settings.lppmName ?? '',
          logoUrl: settings.logoUrl ?? '',
          lppmLogoUrl: settings.lppmLogoUrl ?? '',
          faviconUrl: settings.faviconUrl ?? '',
          email: settings.email ?? '',
          phone: settings.phone ?? '',
          whatsapp: settings.whatsapp ?? '',
          address: settings.address ?? '',
          googleMapsUrl: settings.googleMapsUrl ?? '',
          facebookUrl: settings.facebookUrl ?? '',
          instagramUrl: settings.instagramUrl ?? '',
          youtubeUrl: settings.youtubeUrl ?? '',
          seoTitle: settings.seoTitle ?? '',
          seoDescription: settings.seoDescription ?? '',
        })
      }
      return true
    },
    enabled: !!settings,
  })

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      toast.success('Pengaturan berhasil disimpan')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  function onSubmit(values: SiteSettingInput) {
    saveMutation.mutate(values)
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
            <Settings className="size-5" />
          </div>
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60 mt-1" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
            <Settings className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pengaturan Website</h2>
            <p className="text-sm text-muted-foreground">Konfigurasi situs LPPM</p>
          </div>
        </div>
      </div>

      {isViewOnly && <ViewOnlyBanner />}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="general" className="gap-1.5">
              <Globe className="size-4 hidden sm:block" /> Umum
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1.5">
              <Settings className="size-4 hidden sm:block" /> Media
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5">
              <Share2 className="size-4 hidden sm:block" /> Sosial Media
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-1.5">
              <SearchIcon className="size-4 hidden sm:block" /> SEO
            </TabsTrigger>
          </TabsList>

          {/* Tab: Umum */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Umum</CardTitle>
                <CardDescription>Pengaturan dasar situs dan kontak</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Nama Situs</Label>
                    <Input {...form.register('siteName')} placeholder="LPPM Kampus" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nama LPPM</Label>
                    <Input {...form.register('lppmName')} placeholder="Lembaga Penelitian dan Pengabdian kepada Masyarakat" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input {...form.register('email')} type="email" placeholder="lppm@kampus.ac.id" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telepon</Label>
                    <Input {...form.register('phone')} placeholder="+62 ..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>WhatsApp</Label>
                    <Input {...form.register('whatsapp')} placeholder="+62 ..." />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>Alamat</Label>
                    <Textarea {...form.register('address')} placeholder="Alamat lengkap kampus" rows={3} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Media & Aset</CardTitle>
                <CardDescription>Logo, favicon, dan peta lokasi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>URL Logo Situs</Label>
                    <Input {...form.register('logoUrl')} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>URL Logo LPPM</Label>
                    <Input {...form.register('lppmLogoUrl')} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>URL Favicon</Label>
                    <Input {...form.register('faviconUrl')} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>URL Google Maps</Label>
                    <Input {...form.register('googleMapsUrl')} placeholder="https://maps.google.com/..." />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-3">Preview Logo</p>
                  <div className="flex items-center gap-4">
                    {form.watch('logoUrl') ? (
                      <img src={form.watch('logoUrl')} alt="Logo" className="h-12 object-contain" />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">Logo</div>
                    )}
                    {form.watch('lppmLogoUrl') ? (
                      <img src={form.watch('lppmLogoUrl')} alt="LPPM Logo" className="h-12 object-contain" />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">LPPM</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sosial Media */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sosial Media</CardTitle>
                <CardDescription>Link ke akun sosial media kampus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label>Facebook URL</Label>
                    <Input {...form.register('facebookUrl')} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Instagram URL</Label>
                    <Input {...form.register('instagramUrl')} placeholder="https://instagram.com/..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>YouTube URL</Label>
                    <Input {...form.register('youtubeUrl')} placeholder="https://youtube.com/..." />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO</CardTitle>
                <CardDescription>Pengaturan Search Engine Optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label>SEO Title</Label>
                    <Input {...form.register('seoTitle')} placeholder="Judul untuk mesin pencari" />
                    <p className="text-xs text-muted-foreground">Maks. 60 karakter untuk hasil terbaik</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>SEO Description</Label>
                    <Textarea {...form.register('seoDescription')} placeholder="Deskripsi untuk mesin pencari" rows={3} />
                    <p className="text-xs text-muted-foreground">Maks. 160 karakter untuk hasil terbaik</p>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-3">Preview di Google</p>
                  <div className="space-y-1">
                    <p className="text-blue-700 text-lg font-medium truncate">
                      {form.watch('seoTitle') || form.watch('siteName') || 'Judul Situs'}
                    </p>
                    <p className="text-green-700 text-xs">https://lppm-kampus.ac.id</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {form.watch('seoDescription') || 'Deskripsi situs akan muncul di sini...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Save Button */}
          {canWrite && (
          <div className="flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending} size="lg">
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" /> Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
          )}
        </Tabs>
      </form>
    </motion.div>
  )
}
