'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  AlertCircle,
  Send,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { contactMessageSchema } from '@/lib/validations'
import type { SiteSetting, ContactMessageFormData } from '@/types'

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ============ DATA FETCHING ============

function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings')
      if (!res.ok) throw new Error('Failed to fetch site settings')
      const json = await res.json()
      return json.data as SiteSetting
    },
  })
}

// ============ CONTACT FORM ============

interface ContactFormValues {
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
}

function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Gagal mengirim pesan')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Pesan berhasil dikirim!', {
        description: 'Terima kasih telah menghubungi kami. Kami akan segera merespons.',
      })
      reset()
    },
    onError: (error: Error) => {
      toast.error('Gagal mengirim pesan', {
        description: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
      })
    },
  })

  const onSubmit = (data: ContactFormValues) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Nama <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Nama lengkap Anda"
          {...register('name')}
          className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Email <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          placeholder="email@contoh.com"
          {...register('email')}
          className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Telepon</label>
        <Input
          type="tel"
          placeholder="08xxxxxxxxxx"
          {...register('phone')}
          className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Subjek</label>
        <Input
          placeholder="Subjek pesan"
          {...register('subject')}
          className={errors.subject ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.subject && (
          <p className="text-xs text-red-500">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Pesan <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Tulis pesan Anda..."
          rows={5}
          {...register('message')}
          className={errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="size-4 mr-2" />
            Kirim Pesan
          </>
        )}
      </Button>
    </form>
  )
}

// ============ SKELETON ============

function ContactSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

// ============ PAGE COMPONENT ============

export default function KontakPage() {
  const { data: settings, isLoading, error } = useSiteSettings()

  const contactItems = [
    {
      icon: MapPin,
      label: 'Alamat',
      value: settings?.address,
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Mail,
      label: 'Email',
      value: settings?.email,
      href: settings?.email ? `mailto:${settings.email}` : undefined,
      color: 'bg-sky-100 text-sky-700',
    },
    {
      icon: Phone,
      label: 'Telepon',
      value: settings?.phone,
      href: settings?.phone ? `tel:${settings.phone}` : undefined,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: settings?.whatsapp,
      href: settings?.whatsapp
        ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`
        : undefined,
      color: 'bg-green-100 text-green-700',
    },
  ]

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
                <MessageSquare className="size-3.5 mr-1" />
                Kontak
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Hubungi Kami
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-3 text-lg text-white/80 max-w-2xl"
            >
              Ada pertanyaan atau ingin berkolaborasi? Jangan ragu untuk menghubungi kami
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <ContactSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium">Gagal memuat informasi kontak</p>
              <p className="text-sm text-muted-foreground mt-1">
                Silakan coba lagi nanti
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
            >
              {/* Left Column: Contact Info */}
              <motion.div variants={staggerItem} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Informasi Kontak
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Hubungi kami melalui salah satu kanal berikut
                  </p>
                </div>

                <div className="space-y-3">
                  {contactItems.map((item) => (
                    <Card key={item.label} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div
                          className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                        >
                          <item.icon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium">
                            {item.label}
                          </p>
                          {item.value ? (
                            item.href ? (
                              <a
                                href={item.href}
                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="text-sm text-foreground hover:text-primary transition-colors font-medium break-all"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-sm text-foreground font-medium break-all">
                                {item.value}
                              </p>
                            )
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Tidak tersedia
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Office Hours */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Jam Operasional
                        </p>
                      </div>
                    </div>
                    <div className="ml-13 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Senin – Kamis</span>
                        <span className="font-medium text-foreground">08:00 – 16:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jumat</span>
                        <span className="font-medium text-foreground">08:00 – 11:30</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sabtu – Minggu</span>
                        <span className="font-medium text-red-500">Tutup</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map Placeholder */}
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-56 lg:h-64 bg-muted/30 relative">
                    {settings?.googleMapsUrl ? (
                      <iframe
                        src={settings.googleMapsUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Lokasi LPPM"
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <MapPin className="size-12 mb-2 opacity-30" />
                        <p className="text-sm font-medium opacity-50">
                          Peta Lokasi
                        </p>
                        <p className="text-xs opacity-40">
                          Google Maps embed
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Right Column: Contact Form */}
              <motion.div variants={staggerItem}>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6 lg:p-8">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground mb-1">
                        Kirim Pesan
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Isi formulir di bawah ini untuk mengirim pesan kepada kami
                      </p>
                    </div>
                    <ContactForm />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
