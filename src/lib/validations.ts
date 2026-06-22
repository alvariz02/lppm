// ============================================================================
// LPPM Zod Validation Schemas
// ============================================================================

import { z } from 'zod'

// ============ SHARED ENUMS ============

const userRoleEnum = z.enum(['super_admin', 'admin_lppm', 'editor', 'reviewer'])
const projectStatusEnum = z.enum(['draft', 'ongoing', 'completed', 'cancelled'])
const fundingSchemeStatusEnum = z.enum(['draft', 'active', 'closed'])
const publicationTypeEnum = z.enum([
  'journal_national',
  'journal_international',
  'proceeding',
  'book',
  'book_chapter',
  'hki',
  'patent',
  'popular_article',
])
const newsStatusEnum = z.enum(['draft', 'published'])
const announcementTypeEnum = z.enum(['normal', 'important'])
const announcementStatusEnum = z.enum(['draft', 'active', 'inactive'])
const reviewerTypeEnum = z.enum(['internal', 'external'])
const partnerTypeEnum = z.enum(['government', 'industry', 'ngo', 'university', 'community', 'other'])
const partnerStatusEnum = z.enum(['active', 'inactive', 'expired'])
const agendaEventTypeEnum = z.enum(['seminar', 'workshop', 'sosialisasi', 'monev', 'deadline', 'pelatihan'])
const agendaStatusEnum = z.enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
const galleryCategoryEnum = z.enum(['research', 'community_service', 'seminar', 'workshop'])

// ============ RESEARCHER ============

export const researcherSchema = z.object({
  nidn: z.string().nullable().optional(),
  nip: z.string().nullable().optional(),
  name: z.string().min(1, 'Nama wajib diisi'),
  degree: z.string().nullable().optional(),
  functionalPosition: z.string().nullable().optional(),
  facultyId: z.string().nullable().optional(),
  studyProgramId: z.string().nullable().optional(),
  expertise: z.string().nullable().optional(),
  email: z.string().email('Format email tidak valid').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  googleScholarUrl: z.string().url('URL tidak valid').nullable().optional().or(z.literal('')),
  sintaId: z.string().nullable().optional(),
  scopusId: z.string().nullable().optional(),
  orcidId: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type ResearcherInput = z.infer<typeof researcherSchema>

// ============ RESEARCH ============

export const researchSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  abstract: z.string().nullable().optional(),
  year: z
    .number({ required_error: 'Tahun wajib diisi' })
    .int('Tahun harus berupa bilangan bulat')
    .min(2000, 'Tahun minimal 2000')
    .max(2030, 'Tahun maksimal 2030'),
  fundingSchemeId: z.string().nullable().optional(),
  leaderId: z.string().nullable().optional(),
  facultyId: z.string().min(1, 'Fakultas wajib dipilih'),
  studyProgramId: z.string().min(1, 'Program studi wajib dipilih'),
  fundingSource: z.string().nullable().optional(),

  budget: z.number().positive('Anggaran harus bernilai positif').nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: projectStatusEnum,
  outputs: z.string().nullable().optional(),
  mainImageUrl: z.string().nullable().optional(),
  documentUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
})

export type ResearchInput = z.infer<typeof researchSchema>

// ============ COMMUNITY SERVICE ============

export const communityServiceSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  summary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  regency: z.string().nullable().optional(),
  year: z
    .number({ required_error: 'Tahun wajib diisi' })
    .int('Tahun harus berupa bilangan bulat')
    .min(2000, 'Tahun minimal 2000')
    .max(2030, 'Tahun maksimal 2030'),
  fundingSchemeId: z.string().nullable().optional(),
  leaderId: z.string().nullable().optional(),
  facultyId: z.string().nullable().optional(),
  studyProgramId: z.string().nullable().optional(),
  partnerName: z.string().nullable().optional(),
  fundingSource: z.string().nullable().optional(),
  budget: z.number().positive('Anggaran harus bernilai positif').nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: projectStatusEnum,
  outputs: z.string().nullable().optional(),
  impact: z.string().nullable().optional(),
  mainImageUrl: z.string().nullable().optional(),
  documentUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
})

export type CommunityServiceInput = z.infer<typeof communityServiceSchema>

// ============ PUBLICATION ============

export const publicationSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  publicationType: publicationTypeEnum,
  authors: z.string().nullable().optional(),
  publisherName: z.string().nullable().optional(),
  journalName: z.string().nullable().optional(),
  year: z
    .number({ required_error: 'Tahun wajib diisi' })
    .int('Tahun harus berupa bilangan bulat')
    .min(1900, 'Tahun minimal 1900')
    .max(2030, 'Tahun maksimal 2030'),
  volume: z.string().nullable().optional(),
  number: z.string().nullable().optional(),
  pages: z.string().nullable().optional(),
  issn: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  doi: z.string().nullable().optional(),
  url: z.string().url('URL tidak valid').nullable().optional().or(z.literal('')),
  indexing: z.string().nullable().optional(),
  accreditation: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  researchId: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
})

export type PublicationInput = z.infer<typeof publicationSchema>

// ============ FUNDING SCHEME ============

export const fundingSchemeSchema = z
  .object({
    name: z.string().min(1, 'Nama skema wajib diisi'),
    source: z.string().nullable().optional(),
    year: z
      .number({ required_error: 'Tahun wajib diisi' })
      .int('Tahun harus berupa bilangan bulat')
      .min(2000, 'Tahun minimal 2000')
      .max(2030, 'Tahun maksimal 2030'),
    description: z.string().nullable().optional(),
    requirements: z.string().nullable().optional(),
    minBudget: z.number().nonnegative('Anggaran minimal tidak boleh negatif').nullable().optional(),
    maxBudget: z.number().nonnegative('Anggaran maksimal tidak boleh negatif').nullable().optional(),
    openDate: z.string().nullable().optional(),
    deadline: z.string().nullable().optional(),
    status: fundingSchemeStatusEnum,
    guideFileUrl: z.string().nullable().optional(),
    registrationUrl: z.string().url('URL tidak valid').nullable().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Deadline must be after openDate if both are provided
      if (data.openDate && data.deadline) {
        return new Date(data.deadline) > new Date(data.openDate)
      }
      return true
    },
    {
      message: 'Tanggal tutup harus setelah tanggal buka',
      path: ['deadline'],
    }
  )

export type FundingSchemeInput = z.infer<typeof fundingSchemeSchema>

// ============ NEWS ============

export const newsSchema = z.object({
  categoryId: z.string().nullable().optional(),
  title: z.string().min(1, 'Judul wajib diisi'),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1, 'Konten wajib diisi'),
  imageUrl: z.string().nullable().optional(),
  status: newsStatusEnum,
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
})

export type NewsInput = z.infer<typeof newsSchema>

// ============ ANNOUNCEMENT ============

export const announcementSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  content: z.string().nullable().optional(),
  attachmentUrl: z.string().nullable().optional(),
  type: announcementTypeEnum,
  status: announcementStatusEnum,
  publishedAt: z.string().nullable().optional(),
  expiredAt: z.string().nullable().optional(),
})

export type AnnouncementInput = z.infer<typeof announcementSchema>

// ============ DOCUMENT ============

export const documentSchema = z.object({
  categoryId: z.string().nullable().optional(),
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  fileSize: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type DocumentInput = z.infer<typeof documentSchema>

// ============ REVIEWER ============

export const reviewerSchema = z.object({
  researcherId: z.string().nullable().optional(),
  name: z.string().min(1, 'Nama wajib diisi'),
  nidn: z.string().nullable().optional(),
  nip: z.string().nullable().optional(),
  email: z.string().email('Format email tidak valid').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  institution: z.string().nullable().optional(),
  expertise: z.string().nullable().optional(),
  reviewerType: reviewerTypeEnum,
  isActive: z.boolean().optional(),
})

export type ReviewerInput = z.infer<typeof reviewerSchema>

// ============ PARTNER ============

export const partnerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  partnerType: partnerTypeEnum,
  address: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  email: z.string().email('Format email tidak valid').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  cooperationType: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: partnerStatusEnum,
  logoUrl: z.string().nullable().optional(),
  documentUrl: z.string().nullable().optional(),
})

export type PartnerInput = z.infer<typeof partnerSchema>

// ============ AGENDA ============

export const agendaSchema = z
  .object({
    title: z.string().min(1, 'Judul wajib diisi'),
    description: z.string().nullable().optional(),
    eventType: agendaEventTypeEnum.nullable().optional(),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    endDate: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    organizer: z.string().nullable().optional(),
    posterUrl: z.string().nullable().optional(),
    status: agendaStatusEnum,
  })
  .refine(
    (data) => {
      // endDate must be after startDate if both are provided
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate)
      }
      return true
    },
    {
      message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
      path: ['endDate'],
    }
  )

export type AgendaInput = z.infer<typeof agendaSchema>

// ============ CONTACT MESSAGE ============

export const contactMessageSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  phone: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  message: z.string().min(1, 'Pesan wajib diisi'),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>

// ============ PROFILE ============

export const profileSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().optional(),
  fullName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: userRoleEnum,
  isActive: z.boolean().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

// ============ SITE SETTING ============

export const siteSettingSchema = z.object({
  siteName: z.string().nullable().optional(),
  lppmName: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  lppmLogoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  googleMapsUrl: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
})

export type SiteSettingInput = z.infer<typeof siteSettingSchema>

// ============ LPPM PROFILE ============

export const lppmProfileSchema = z.object({
  about: z.string().nullable().optional(),
  vision: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  duties: z.string().nullable().optional(),
  chairmanName: z.string().nullable().optional(),
  chairmanPhotoUrl: z.string().nullable().optional(),
  chairmanMessage: z.string().nullable().optional(),
  structureImageUrl: z.string().nullable().optional(),
})

export type LppmProfileInput = z.infer<typeof lppmProfileSchema>

// ============ GALLERY ALBUM ============

export const galleryAlbumSchema = z.object({
  title: z.string().min(1, 'Judul album wajib diisi'),
  description: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  category: galleryCategoryEnum.nullable().optional(),
})

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>

// ============ GALLERY PHOTO ============

export const galleryPhotoSchema = z.object({
  imageUrl: z.string().min(1, 'URL gambar wajib diisi'),
  caption: z.string().nullable().optional(),
})

export type GalleryPhotoInput = z.infer<typeof galleryPhotoSchema>
