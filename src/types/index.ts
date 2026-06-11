// ============================================================================
// LPPM Types - Based on Prisma Schema
// ============================================================================

// ============ ENUM-LIKE UNION TYPES ============

/** User roles in the system */
export type UserRole = 'super_admin' | 'admin_lppm' | 'editor' | 'reviewer'

/** Research / Community Service project status */
export type ProjectStatus = 'draft' | 'ongoing' | 'completed' | 'cancelled'

/** Funding scheme status */
export type FundingSchemeStatus = 'draft' | 'active' | 'closed'

/** Publication types */
export type PublicationType =
  | 'journal_national'
  | 'journal_international'
  | 'proceeding'
  | 'book'
  | 'book_chapter'
  | 'hki'
  | 'patent'
  | 'popular_article'

/** News status */
export type NewsStatus = 'draft' | 'published'

/** Announcement type */
export type AnnouncementType = 'normal' | 'important'

/** Announcement status */
export type AnnouncementStatus = 'draft' | 'active' | 'inactive'

/** Reviewer type */
export type ReviewerType = 'internal' | 'external'

/** Proposal review status */
export type ProposalReviewStatus = 'waiting' | 'reviewing' | 'revision' | 'accepted' | 'rejected'

/** Proposal type */
export type ProposalType = 'research' | 'community_service'

/** Partner type */
export type PartnerType = 'government' | 'industry' | 'ngo' | 'university' | 'community' | 'other'

/** Partner status */
export type PartnerStatus = 'active' | 'inactive' | 'expired'

/** Agenda event type */
export type AgendaEventType = 'seminar' | 'workshop' | 'sosialisasi' | 'monev' | 'deadline' | 'pelatihan'

/** Agenda status */
export type AgendaStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

/** Gallery album category */
export type GalleryCategory = 'research' | 'community_service' | 'seminar' | 'workshop'

/** Member role */
export type MemberRole = 'ketua' | 'anggota'

// ============ MODEL TYPES ============

export type Profile = {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type SiteSetting = {
  id: string
  siteName: string
  lppmName: string
  logoUrl: string | null
  lppmLogoUrl: string | null
  faviconUrl: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  googleMapsUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  createdAt: Date
  updatedAt: Date
}

export type LppmProfile = {
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
  createdAt: Date
  updatedAt: Date
}

export type Faculty = {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type StudyProgram = {
  id: string
  facultyId: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type Researcher = {
  id: string
  nidn: string | null
  nip: string | null
  name: string
  degree: string | null
  functionalPosition: string | null
  facultyId: string | null
  studyProgramId: string | null
  expertise: string | null
  email: string | null
  phone: string | null
  googleScholarUrl: string | null
  sintaId: string | null
  scopusId: string | null
  orcidId: string | null
  photoUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type FundingScheme = {
  id: string
  name: string
  slug: string
  source: string | null
  year: number
  description: string | null
  requirements: string | null
  minBudget: number | null
  maxBudget: number | null
  openDate: Date | null
  deadline: Date | null
  status: FundingSchemeStatus
  guideFileUrl: string | null
  registrationUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type Research = {
  id: string
  title: string
  slug: string
  abstract: string | null
  year: number
  fundingSchemeId: string | null
  leaderId: string | null
  facultyId: string | null
  studyProgramId: string | null
  fundingSource: string | null
  budget: number | null
  startDate: Date | null
  endDate: Date | null
  status: ProjectStatus
  outputs: string | null
  mainImageUrl: string | null
  documentUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export type ResearchMember = {
  id: string
  researchId: string
  researcherId: string
  role: string
  createdAt: Date
}

export type ResearchStudentMember = {
  id: string
  researchId: string
  studentName: string
  nim: string | null
  studyProgram: string | null
  role: string
  createdAt: Date
}

export type CommunityService = {
  id: string
  title: string
  slug: string
  summary: string | null
  location: string | null
  village: string | null
  district: string | null
  regency: string | null
  year: number
  fundingSchemeId: string | null
  leaderId: string | null
  facultyId: string | null
  studyProgramId: string | null
  partnerName: string | null
  fundingSource: string | null
  budget: number | null
  startDate: Date | null
  endDate: Date | null
  status: ProjectStatus
  outputs: string | null
  impact: string | null
  mainImageUrl: string | null
  documentUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export type CommunityServiceMember = {
  id: string
  serviceId: string
  researcherId: string
  role: string
  createdAt: Date
}

export type CommunityServiceStudentMember = {
  id: string
  serviceId: string
  studentName: string
  nim: string | null
  studyProgram: string | null
  role: string
  createdAt: Date
}

export type Publication = {
  id: string
  title: string
  slug: string
  publicationType: PublicationType
  authors: string | null
  publisherName: string | null
  journalName: string | null
  year: number
  volume: string | null
  number: string | null
  pages: string | null
  issn: string | null
  isbn: string | null
  doi: string | null
  url: string | null
  indexing: string | null
  accreditation: string | null
  fileUrl: string | null
  researchId: string | null
  serviceId: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export type PublicationAuthor = {
  id: string
  publicationId: string
  researcherId: string
  authorOrder: number
  createdAt: Date
}

export type NewsCategory = {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type News = {
  id: string
  categoryId: string | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  imageUrl: string | null
  status: NewsStatus
  isFeatured: boolean
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type Announcement = {
  id: string
  title: string
  slug: string
  content: string | null
  attachmentUrl: string | null
  type: AnnouncementType
  status: AnnouncementStatus
  publishedAt: Date | null
  expiredAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type DocumentCategory = {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type Document = {
  id: string
  categoryId: string | null
  title: string
  slug: string
  description: string | null
  fileUrl: string | null
  fileType: string | null
  fileSize: string | null
  downloadCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type Reviewer = {
  id: string
  researcherId: string | null
  name: string
  nidn: string | null
  nip: string | null
  email: string | null
  phone: string | null
  institution: string | null
  expertise: string | null
  reviewerType: ReviewerType
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProposalReview = {
  id: string
  proposalType: ProposalType
  researchId: string | null
  serviceId: string | null
  reviewerId: string
  score: number | null
  notes: string | null
  status: ProposalReviewStatus
  reviewFileUrl: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type Partner = {
  id: string
  name: string
  slug: string
  partnerType: PartnerType
  address: string | null
  contactPerson: string | null
  email: string | null
  phone: string | null
  cooperationType: string | null
  startDate: Date | null
  endDate: Date | null
  status: PartnerStatus
  logoUrl: string | null
  documentUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type Agenda = {
  id: string
  title: string
  slug: string
  description: string | null
  eventType: AgendaEventType | null
  startDate: Date
  endDate: Date | null
  location: string | null
  organizer: string | null
  posterUrl: string | null
  status: AgendaStatus
  createdAt: Date
  updatedAt: Date
}

export type GalleryAlbum = {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  category: GalleryCategory | null
  createdAt: Date
  updatedAt: Date
}

export type GalleryPhoto = {
  id: string
  albumId: string
  imageUrl: string
  caption: string | null
  createdAt: Date
  updatedAt: Date
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  isRead: boolean
  createdAt: Date
}

export type ActivityLog = {
  id: string
  userId: string | null
  action: string
  tableName: string | null
  recordId: string | null
  description: string | null
  createdAt: Date
}

// ============ FORM / INPUT TYPES ============

export type ResearchFormData = Omit<Research, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type CommunityServiceFormData = Omit<CommunityService, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type PublicationFormData = Omit<Publication, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type FundingSchemeFormData = Omit<FundingScheme, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type NewsFormData = Omit<News, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type AnnouncementFormData = Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type DocumentFormData = Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'downloadCount'>

export type ResearcherFormData = Omit<Researcher, 'id' | 'createdAt' | 'updatedAt'>

export type ReviewerFormData = Omit<Reviewer, 'id' | 'createdAt' | 'updatedAt'>

export type PartnerFormData = Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type AgendaFormData = Omit<Agenda, 'id' | 'createdAt' | 'updatedAt' | 'slug'>

export type ContactMessageFormData = Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>

export type ProfileFormData = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>

export type SiteSettingFormData = Omit<SiteSetting, 'id' | 'createdAt' | 'updatedAt'>

export type LppmProfileFormData = Omit<LppmProfile, 'id' | 'createdAt' | 'updatedAt'>

// ============ RELATIONAL / EXTENDED TYPES ============

export type ResearchWithRelations = Research & {
  fundingScheme: FundingScheme | null
  leader: Researcher | null
  faculty: Faculty | null
  studyProgram: StudyProgram | null
  members: (ResearchMember & { researcher: Researcher })[]
  studentMembers: ResearchStudentMember[]
  publications: Publication[]
  proposalReviews: (ProposalReview & { reviewer: Reviewer })[]
}

export type CommunityServiceWithRelations = CommunityService & {
  fundingScheme: FundingScheme | null
  leader: Researcher | null
  faculty: Faculty | null
  studyProgram: StudyProgram | null
  members: (CommunityServiceMember & { researcher: Researcher })[]
  studentMembers: CommunityServiceStudentMember[]
  publications: Publication[]
  proposalReviews: (ProposalReview & { reviewer: Reviewer })[]
}

export type PublicationWithRelations = Publication & {
  research: Research | null
  service: CommunityService | null
  publicationAuthors: (PublicationAuthor & { researcher: Researcher })[]
}

export type NewsWithRelations = News & {
  category: NewsCategory | null
}

export type DocumentWithRelations = Document & {
  category: DocumentCategory | null
}

export type ResearcherWithRelations = Researcher & {
  faculty: Faculty | null
  studyProgram: StudyProgram | null
  reviewer: Reviewer | null
}

export type ReviewerWithRelations = Reviewer & {
  researcher: Researcher | null
  proposalReviews: ProposalReview[]
}

export type AgendaWithRelations = Agenda

export type PartnerWithRelations = Partner

export type GalleryAlbumWithRelations = GalleryAlbum & {
  photos: GalleryPhoto[]
}

// ============ API RESPONSE TYPES ============

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type DashboardStats = {
  totalResearch: number
  totalCommunityService: number
  totalPublication: number
  totalResearcher: number
  totalFundingScheme: number
  totalPartner: number
  ongoingResearch: number
  completedResearch: number
  ongoingService: number
  completedService: number
}
