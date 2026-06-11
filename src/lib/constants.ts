// ============================================================================
// LPPM Constants - Label Maps and Configuration
// ============================================================================

import type {
  UserRole,
  ProjectStatus,
  FundingSchemeStatus,
  PublicationType,
  NewsStatus,
  AnnouncementType,
  AnnouncementStatus,
  ReviewerType,
  ProposalReviewStatus,
  ProposalType,
  PartnerType,
  PartnerStatus,
  AgendaEventType,
  AgendaStatus,
  GalleryCategory,
  MemberRole,
} from '@/types'

// ============ ROLE LABELS ============

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin_lppm: 'Admin LPPM',
  editor: 'Editor',
  reviewer: 'Reviewer',
}

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ PROJECT STATUS LABELS ============

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  ongoing: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ FUNDING SCHEME STATUS LABELS ============

export const FUNDING_SCHEME_STATUS_LABELS: Record<FundingSchemeStatus, string> = {
  draft: 'Draft',
  active: 'Aktif',
  closed: 'Ditutup',
}

export const FUNDING_SCHEME_STATUS_OPTIONS = Object.entries(
  FUNDING_SCHEME_STATUS_LABELS
).map(([value, label]) => ({ value, label }))

// ============ PUBLICATION TYPE LABELS ============

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  journal_national: 'Jurnal Nasional',
  journal_international: 'Jurnal Internasional',
  proceeding: 'Prosiding',
  book: 'Buku',
  book_chapter: 'Bab Buku',
  hki: 'HKI',
  patent: 'Paten',
  popular_article: 'Artikel Populer',
}

export const PUBLICATION_TYPE_OPTIONS = Object.entries(PUBLICATION_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ NEWS STATUS LABELS ============

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  draft: 'Draft',
  published: 'Dipublikasikan',
}

export const NEWS_STATUS_OPTIONS = Object.entries(NEWS_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ ANNOUNCEMENT TYPE LABELS ============

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  normal: 'Biasa',
  important: 'Penting',
}

export const ANNOUNCEMENT_TYPE_OPTIONS = Object.entries(ANNOUNCEMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ ANNOUNCEMENT STATUS LABELS ============

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  draft: 'Draft',
  active: 'Aktif',
  inactive: 'Tidak Aktif',
}

export const ANNOUNCEMENT_STATUS_OPTIONS = Object.entries(ANNOUNCEMENT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ REVIEWER TYPE LABELS ============

export const REVIEWER_TYPE_LABELS: Record<ReviewerType, string> = {
  internal: 'Internal',
  external: 'Eksternal',
}

export const REVIEWER_TYPE_OPTIONS = Object.entries(REVIEWER_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ PROPOSAL REVIEW STATUS LABELS ============

export const PROPOSAL_REVIEW_STATUS_LABELS: Record<ProposalReviewStatus, string> = {
  waiting: 'Menunggu',
  reviewing: 'Sedang Ditinjau',
  revision: 'Revisi',
  accepted: 'Diterima',
  rejected: 'Ditolak',
}

export const PROPOSAL_REVIEW_STATUS_OPTIONS = Object.entries(
  PROPOSAL_REVIEW_STATUS_LABELS
).map(([value, label]) => ({ value, label }))

// ============ PROPOSAL TYPE LABELS ============

export const PROPOSAL_TYPE_LABELS: Record<ProposalType, string> = {
  research: 'Penelitian',
  community_service: 'Pengabdian Masyarakat',
}

export const PROPOSAL_TYPE_OPTIONS = Object.entries(PROPOSAL_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ PARTNER TYPE LABELS ============

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  government: 'Pemerintah',
  industry: 'Industri',
  ngo: 'LSM/NGO',
  university: 'Universitas',
  community: 'Komunitas',
  other: 'Lainnya',
}

export const PARTNER_TYPE_OPTIONS = Object.entries(PARTNER_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ PARTNER STATUS LABELS ============

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  expired: 'Kedaluwarsa',
}

export const PARTNER_STATUS_OPTIONS = Object.entries(PARTNER_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ AGENDA EVENT TYPE LABELS ============

export const AGENDA_EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
  seminar: 'Seminar',
  workshop: 'Workshop',
  sosialisasi: 'Sosialisasi',
  monev: 'Monev',
  deadline: 'Deadline',
  pelatihan: 'Pelatihan',
}

export const AGENDA_EVENT_TYPE_OPTIONS = Object.entries(AGENDA_EVENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ AGENDA STATUS LABELS ============

export const AGENDA_STATUS_LABELS: Record<AgendaStatus, string> = {
  upcoming: 'Akan Datang',
  ongoing: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const AGENDA_STATUS_OPTIONS = Object.entries(AGENDA_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ GALLERY CATEGORY LABELS ============

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  research: 'Penelitian',
  community_service: 'Pengabdian Masyarakat',
  seminar: 'Seminar',
  workshop: 'Workshop',
}

export const GALLERY_CATEGORY_OPTIONS = Object.entries(GALLERY_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ MEMBER ROLE LABELS ============

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  ketua: 'Ketua',
  anggota: 'Anggota',
}

export const MEMBER_ROLE_OPTIONS = Object.entries(MEMBER_ROLE_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============ STATUS COLOR CLASSES ============

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  ongoing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export const FUNDING_SCHEME_STATUS_COLORS: Record<FundingSchemeStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export const NEWS_STATUS_COLORS: Record<NewsStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
}

export const ANNOUNCEMENT_STATUS_COLORS: Record<AnnouncementStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
}

export const PROPOSAL_REVIEW_STATUS_COLORS: Record<ProposalReviewStatus, string> = {
  waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export const PARTNER_STATUS_COLORS: Record<PartnerStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export const AGENDA_STATUS_COLORS: Record<AgendaStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

// ============ PAGINATION ============

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ============ APP CONFIG ============

export const APP_NAME = 'LPPM Kampus'
export const APP_DESCRIPTION = 'Lembaga Penelitian dan Pengabdian kepada Masyarakat'
