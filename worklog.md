# Work Log

## Task 3: Update Global CSS Theme for LPPM Website

**Date:** 2026-03-05
**File Modified:** `/home/z/my-project/src/app/globals.css`

### Changes Made

#### 1. Light Mode (`:root`) Color Variables
- `--primary`: Changed from grayscale black to dark navy `oklch(0.35 0.1 250)` (#1e3a5f)
- `--primary-foreground`: White `oklch(1 0 0)` (unchanged, already white)
- `--secondary`: Changed from light gray to sky blue `oklch(0.62 0.21 255)` (#3b82f6)
- `--secondary-foreground`: Changed to white `oklch(1 0 0)`
- `--accent`: Changed from light gray to golden yellow `oklch(0.78 0.17 75)` (#f59e0b)
- `--accent-foreground`: Changed to dark navy `oklch(0.35 0.1 250)`
- `--foreground`: Changed from pure black to dark gray with blue tint `oklch(0.22 0.03 250)`
- `--card-foreground`, `--popover-foreground`: Same dark gray-blue as foreground
- `--muted`: Light gray with blue tint `oklch(0.96 0.01 250)`
- `--muted-foreground`: Medium gray with blue tint `oklch(0.55 0.03 250)`
- `--border`, `--input`: Light gray with blue tint `oklch(0.92 0.01 250)`
- `--ring`: Sky blue `oklch(0.62 0.21 255)`
- `--destructive`: Kept original red value

#### 2. Dark Mode (`.dark`) Color Variables
- `--background`: Very dark blue-gray `oklch(0.15 0.04 250)`
- `--foreground`: Light gray with blue tint `oklch(0.93 0.01 250)`
- `--primary`: Sky blue `oklch(0.62 0.21 255)` (swapped from light mode)
- `--primary-foreground`: Dark navy `oklch(0.35 0.1 250)`
- `--secondary`: Darker blue `oklch(0.45 0.2 260)` (#1e40af)
- `--secondary-foreground`: White `oklch(1 0 0)`
- `--accent`: Golden yellow `oklch(0.78 0.17 75)` (same as light mode)
- `--accent-foreground`: Dark navy `oklch(0.35 0.1 250)`
- `--card`, `--popover`: Dark blue-gray `oklch(0.2 0.05 250)`
- `--muted`: Dark blue `oklch(0.25 0.05 250)`
- `--muted-foreground`: Medium gray-blue `oklch(0.65 0.04 250)`
- `--ring`: Sky blue `oklch(0.62 0.21 255)`

#### 3. Chart Colors Updated (both modes)
- `--chart-1`: Dark navy (primary blue)
- `--chart-2`: Sky blue (secondary blue)
- `--chart-3`: Golden yellow (accent)
- `--chart-4`: Teal `oklch(0.65 0.13 195)`
- `--chart-5`: Indigo `oklch(0.48 0.18 275)`

#### 4. Sidebar Colors Updated
- Both light and dark sidebar colors updated to match the LPPM navy/blue theme

#### 5. Custom Utility Classes Added
- **Smooth scroll:** `html { scroll-behavior: smooth; }` added to `@layer base`
- **Custom scrollbar:** Thin 8px scrollbar with rounded thumb, themed track/thumb colors using CSS variables
- **Focus ring:** `*:focus-visible` with 2px solid ring color and 2px offset

### Structure Preserved
- All imports, `@custom-variant`, `@theme inline` block, and `@layer base` structure kept intact
- Only color values were changed; no structural modifications

---

## Task 4-b: Create Public Layout Components

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/components/layout/Navbar.tsx`
- `/home/z/my-project/src/components/layout/Footer.tsx`
- `/home/z/my-project/src/components/layout/PublicLayout.tsx`

**File Modified:**
- `/home/z/my-project/src/app/page.tsx` (updated to use PublicLayout wrapper)

### 1. Navbar.tsx

A responsive navigation bar component with the following features:

- **Client component** (`'use client'`) with Framer Motion fade-in animation on mount
- **Sticky positioning** (`sticky top-0 z-50`) with smooth scroll-based background transition
  - At top: white background with subtle shadow
  - When scrolled: `bg-white/90 backdrop-blur-md` with stronger shadow
- **Desktop navigation** (hidden on mobile, visible at `lg:` breakpoint):
  - Logo area with `GraduationCap` icon + "LPPM" text
  - Navigation links: Beranda, Profil, Kerja Sama, Agenda, Galeri, Kontak as direct links
  - "Akademik" dropdown menu containing: Penelitian, Pengabdian, Publikasi, Hibah
  - "Info" dropdown menu containing: Berita, Pengumuman, Dokumen
  - Active link highlighting using `usePathname()` — primary color with `bg-primary/10`
- **Right side actions:**
  - Search button (magnifying glass icon, ghost variant)
  - Admin login button (`outline` variant, links to `/login`, hidden on small screens)
- **Mobile navigation** (visible below `lg:` breakpoint):
  - Hamburger menu button using `Sheet` component from shadcn/ui
  - Sheet slides from right side (300px/350px width)
  - All navigation links listed vertically with active state highlighting
  - Close on link click
  - Login Admin button in sheet footer
- **shadcn/ui components used:** Sheet, SheetContent, SheetTrigger, SheetTitle, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
- **lucide-react icons used:** Menu, Search, GraduationCap, ChevronDown, LogIn, X

### 2. Footer.tsx

A professional campus footer component:

- **Dark navy background** (`bg-primary`) with white/light text (`text-primary-foreground`)
- **4-column responsive grid layout:**
  - Mobile: 1 column
  - Tablet (`sm:`): 2 columns
  - Desktop (`lg:`): 4 columns
- **Column 1 (Logo & Description):**
  - `GraduationCap` icon (accent color) + "LPPM" text as home link
  - Short Indonesian description of LPPM
  - Social media icons: Facebook, Instagram, Youtube — circular buttons with hover effect (accent color)
- **Column 2 (Tautan Cepat / Quick Links):**
  - Heading with accent color + separator
  - Links: Beranda, Profil, Kerja Sama, Agenda, Galeri, Kontak
- **Column 3 (Layanan / Services):**
  - Heading with accent color + separator
  - Links: Penelitian, Pengabdian, Publikasi, Hibah, Dokumen
- **Column 4 (Kontak / Contact):**
  - Heading with accent color + separator
  - Address with `MapPin` icon
  - Email with `Mail` icon
  - Phone with `Phone` icon
  - WhatsApp with `Phone` icon
- **Bottom bar:**
  - Separator line
  - Copyright text: "© 2024 LPPM Kampus. All rights reserved."
- All links use Next.js `Link` component for client-side navigation
- **lucide-react icons used:** GraduationCap, Facebook, Instagram, Youtube, MapPin, Mail, Phone

### 3. PublicLayout.tsx

A simple wrapper component that composes the layout:

- `'use client'` directive
- `min-h-screen flex flex-col` container for sticky footer pattern
- Navbar at top, main content in flexible middle area, Footer at bottom
- `flex-1` on `<main>` ensures content pushes footer down when needed

### 4. page.tsx Updated

- Updated to use `PublicLayout` wrapper
- Simple welcome content for testing the layout components

### Design Decisions

- Used CSS variable-based theme colors (`text-primary`, `bg-primary`, `text-accent`, etc.) from the existing globals.css setup (Task 3)
- All interactive elements have hover/focus states for accessibility
- Mobile-first responsive design with Tailwind breakpoints
- Subtle animations: Framer Motion for navbar mount, CSS transitions for scroll effects and hover states
- Consistent spacing and padding following the LPPM theme


---

## Task 5-a: Create Public-Facing API Routes

**Date:** 2026-03-05
**Files Created/Updated:** 15 API route files under `/home/z/my-project/src/app/api/`

### Routes Created

| # | File Path | Method | Description |
|---|-----------|--------|-------------|
| 1 | `api/stats/route.ts` | GET | Dashboard statistics: totalResearch, totalCommunityService, totalPublication, totalResearcher, totalPartner, totalFundingScheme, ongoingResearch, completedResearch, ongoingService, completedService, totalActiveHibah |
| 2 | `api/research/route.ts` | GET | Paginated research list with filters: year, status, fundingSchemeId, facultyId, search, featured. Includes leader, faculty, fundingScheme, members relations. Only published. |
| 3 | `api/community-service/route.ts` | GET | Paginated community service list with same filters as research. Includes leader, faculty, fundingScheme, members. Only published. |
| 4 | `api/publication/route.ts` | GET | Paginated publications with filters: publicationType, year, search. Includes research, service, publicationAuthors. Only published. |
| 5 | `api/funding-scheme/route.ts` | GET | Active funding schemes with optional year filter. |
| 6 | `api/news/route.ts` | GET | Paginated published news with filters: categoryId, search, featured. Includes category relation. |
| 7 | `api/announcement/route.ts` | GET | Active announcements only. |
| 8 | `api/partner/route.ts` | GET | Active partners only. |
| 9 | `api/agenda/route.ts` | GET | Agenda with filters: status (default 'upcoming'), eventType. Ordered by startDate asc. |
| 10 | `api/gallery/route.ts` | GET | Gallery albums with photos. Optional category filter. |
| 11 | `api/contact/route.ts` | POST | Contact message submission. Validates with contactMessageSchema (Zod). Returns 201 on success, 400 on validation error. |
| 12 | `api/document/route.ts` | GET | Active documents with optional categoryId filter. Includes category relation. |
| 13 | `api/reviewer/route.ts` | GET | Active reviewers only. Ordered by name. |
| 14 | `api/lppm-profile/route.ts` | GET | First LppmProfile record or 404. |
| 15 | `api/site-settings/route.ts` | GET | First SiteSetting record or 404. |

### Design Decisions

- **Pagination format**: `{ data, total, page, pageSize, totalPages }` for all paginated endpoints
- **Non-paginated endpoints** return `{ data }` directly
- **Search**: Uses Prisma `contains` filter (SQLite is case-insensitive by default)
- **Error handling**: try/catch with console.error and appropriate HTTP status codes (400, 404, 500)
- **Validation**: Contact POST uses Zod `contactMessageSchema` from `@/lib/validations`
- **Constants**: Uses `DEFAULT_PAGE_SIZE` from `@/lib/constants`
- All imports use `import { db } from '@/lib/db'`
- Responses use `NextResponse.json()`
- No admin POST/PUT/DELETE routes created (will be done separately)

### Testing
All 15 endpoints verified working via curl. Key test results:
- Stats returns all 11 fields with correct counts from seed data
- Research search filter works (tested with "iklim" search term)
- Pagination works correctly with page/pageSize params
- Contact POST validates input and returns 400 with Zod error details
- Contact POST creates record successfully with 201 status

---

## Task 5-b: Create Homepage (Beranda)

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/components/Providers.tsx` — React Query provider wrapper
- `/home/z/my-project/seed.ts` — Database seeder with LPPM sample data

**Files Modified:**
- `/home/z/my-project/src/app/layout.tsx` — Added Providers wrapper around children
- `/home/z/my-project/src/app/page.tsx` — Complete homepage with 9 sections

### 1. Providers.tsx

React Query provider component:
- `'use client'` directive
- Uses `useState` to create `QueryClient` instance (prevents re-creation on re-render)
- Default stale time: 60 seconds
- `refetchOnWindowFocus: false`

### 2. Root Layout Updated

Added `Providers` import and wrapped `PublicLayout` + `Toaster` with `<Providers>` in the root layout.

### 3. Database Seeding (seed.ts)

Seeded the database with comprehensive LPPM sample data:
- **News Categories**: Penelitian, Pengabdian, Hibah
- **News**: 3 featured articles with categories and excerpts
- **Announcements**: 5 active announcements (3 important, 2 normal)
- **Faculties**: 2 faculties (FTE, FISIP)
- **Study Programs**: 3 programs (Teknik Informatika, Teknik Elektro, Administrasi Publik)
- **Researchers**: 3 researchers across faculties
- **Funding Schemes**: 1 active internal research grant
- **Research**: 3 featured research projects with leaders and abstracts
- **Community Services**: 3 featured community service projects with locations
- **Publications**: 5 publications (international journals, national journals, proceedings)
- **Partners**: 6 active partners (government, industry, university, NGO)

### 4. Homepage (page.tsx) — 9 Sections

Complete `'use client'` homepage with the following sections:

#### Section 1: Hero Section
- Full-width gradient background (navy blue → sky blue)
- Decorative geometric shapes with Framer Motion floating animations
- Grid pattern overlay at 4% opacity
- Large heading with "Pengabdian" in accent (golden yellow) color
- Sub-heading text
- 3 CTA buttons: "Lihat Penelitian" (accent bg), "Lihat Pengabdian" (glass outline), "Download Panduan" (glass outline)
- Staggered Framer Motion entrance animation

#### Section 2: Statistics Section
- 6 stat cards in responsive grid (1/2/3 cols)
- Each card: icon + number + label
- Stats: Total Penelitian, Total Pengabdian, Total Publikasi, Total Dosen/Peneliti, Total Mitra Kerja Sama, Total Hibah Aktif
- Icons: FlaskConical, HeartHandshake, BookOpen, Users, Handshake, Award
- Cards with hover effect (lift + shadow)
- Data fetched from `/api/stats` via TanStack Query
- Skeleton loading state

#### Section 3: Berita Terbaru Section
- 3 featured news cards in horizontal grid
- Each card: gradient image placeholder, category badge, title, excerpt, date
- "Lihat Semua Berita" button linking to /berita
- Data fetched from `/api/news?featured=true&pageSize=3`

#### Section 4: Pengumuman Terbaru Section
- List of 5 latest announcements
- Each item: icon, title, date, "Penting" badge for important ones
- "Lihat Semua Pengumuman" link
- Data fetched from `/api/announcement`

#### Section 5: Penelitian Unggulan Section
- 3 featured research cards
- Each card: status badge, year badge, title, abstract (truncated), leader name, funding source
- "Lihat Semua Penelitian" link
- Data fetched from `/api/research?featured=true&pageSize=3`

#### Section 6: Pengabdian Unggulan Section
- 3 featured community service cards
- Each card: status badge, year badge, title, summary (truncated), location, leader name
- "Lihat Semua Pengabdian" link
- Data fetched from `/api/community-service?featured=true&pageSize=3`

#### Section 7: Publikasi Terbaru Section
- List of 5 latest publications
- Each item: type badge, year badge, title, authors, journal name
- "Lihat Semua Publikasi" link
- Data fetched from `/api/publication?pageSize=5`

#### Section 8: Mitra Kerja Sama Section
- Grid of up to 6 partner cards
- Each card: emoji icon based on type, name, type badge, cooperation type
- "Lihat Semua Mitra" link
- Data fetched from `/api/partner`

#### Section 9: CTA Section
- Gradient navy blue background with decorative elements
- "Hubungi LPPM" heading
- Description text
- 2 buttons: "Hubungi Kami" (accent, links to /kontak), "Download Panduan" (glass outline, links to /dokumen)

### Technical Implementation

- **Data Fetching**: 7 custom `useQuery` hooks using TanStack Query, each with proper error handling
- **Animations**: Framer Motion `whileInView` for scroll-triggered animations, stagger containers for card grids
- **Loading States**: Custom skeleton components (StatsSkeleton, NewsSkeleton, ListSkeleton, CardGridSkeleton)
- **Empty States**: Graceful empty state displays with icons and messages
- **Error States**: Error messages for failed API calls
- **Responsive Design**: Mobile-first with Tailwind breakpoints (sm:, md:, lg:, xl:)
- **Color Scheme**: Uses LPPM theme variables (primary=navy, secondary=sky blue, accent=golden yellow)
- **shadcn/ui**: Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton components
- **lucide-react**: FlaskConical, HeartHandshake, BookOpen, Users, Handshake, Award, ArrowRight, Megaphone, MapPin, FileText, Building2, Download, Phone, ChevronRight, AlertCircle

### Lint & Build
- ESLint passes with no errors
- All API endpoints return 200 status
- Homepage compiles and renders correctly

---

## Task 7-b: Create Public Pages (Pengumuman, Dokumen, Reviewer, Kerjasama, Agenda, Galeri, Kontak)

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/app/pengumuman/page.tsx` — Announcements page
- `/home/z/my-project/src/app/dokumen/page.tsx` — Documents page
- `/home/z/my-project/src/app/reviewer/page.tsx` — Reviewers page
- `/home/z/my-project/src/app/kerjasama/page.tsx` — Partners page
- `/home/z/my-project/src/app/agenda/page.tsx` — Agenda/Events page
- `/home/z/my-project/src/app/galeri/page.tsx` — Gallery page
- `/home/z/my-project/src/app/kontak/page.tsx` — Contact page

**Files Modified:**
- `/home/z/my-project/src/app/api/document/route.ts` — Added PATCH endpoint for download count increment

### 1. Pengumuman Page (`/pengumuman`)

- **Hero banner**: "Pengumuman" with gradient navy→sky blue background, decorative shapes, grid pattern
- **Content**: Accordion-based expandable list of announcements
- Each announcement displays: title, published date, "Penting" badge for important ones
- Click to expand/collapse reveals full content text and attachment link
- Important announcements have red icon + red "Penting" badge
- Normal announcements have primary-colored icon + "Biasa" badge
- Data fetched from `/api/announcement` via TanStack Query `useQuery`
- Uses `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from shadcn/ui
- Loading skeleton, empty state, error state all implemented
- Framer Motion stagger animation on initial load

### 2. Dokumen Page (`/dokumen`)

- **Hero banner**: "Dokumen Unduhan" with gradient background
- **Category filter**: Select dropdown fetching categories from document data
- **Table layout**: Displays documents with file type icon, title, description, category, download count, download button
- File type icons: `FileText` for PDF/Word, `FileSpreadsheet` for Excel/CSV, `FileImage` for images
- Color-coded file type icons (red for PDF, emerald for Excel, sky for Word, purple for images)
- Download button opens file URL and calls PATCH `/api/document` to increment download count
- Toast notification on download success/failure
- Responsive table with hidden columns on mobile (category, download count shown inline on mobile)
- Uses `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead` from shadcn/ui
- Loading skeleton, empty state, error state

### 3. Reviewer Page (`/reviewer`)

- **Hero banner**: "Reviewer / Mitra Bestari" with gradient background
- **Filter**: Select dropdown for reviewer type (Internal/Eksternal)
- **Grid layout**: 1/2/3 columns responsive grid of reviewer cards
- Each reviewer card: avatar with initials, name, NIDN, institution, expertise badges, type badge (Internal/Eksternal)
- Expertise field split by comma into individual badges
- Email shown at bottom of card with separator
- Type badges color-coded (primary for internal, sky for external)
- Counter showing total reviewers matching filter
- "Lihat Semua Reviewer" button when filter has no results
- Loading skeleton, empty state, error state

### 4. Kerjasama Page (`/kerjasama`)

- **Hero banner**: "Kerja Sama / Mitra" with gradient background
- **Filter**: Select dropdown for partner type (Pemerintah, Industri, LSM/NGO, Universitas, Komunitas, Lainnya)
- **Grid layout**: 1/2/3 columns responsive grid of partner cards
- Each partner card: logo placeholder (emoji based on type), name, type badge, cooperation type, address, date range, status badge
- Logo area shows emoji for type (🏛️🏭🤝🎓👥🏢) or actual logo if available
- Status badges: Aktif (green), Tidak Aktif (gray), Kedaluwarsa (red)
- Counter showing total partners matching filter
- Loading skeleton, empty state, error state

### 5. Agenda Page (`/agenda`)

- **Hero banner**: "Agenda Kegiatan" with gradient background
- **Filters**: Two Select dropdowns — Status (Akan Datang, Berlangsung, Selesai, Dibatalkan) and Event Type (Seminar, Workshop, Sosialisasi, Monev, Deadline, Pelatihan)
- **Card-based timeline**: Each agenda card with date badge (day + month), title, event type badge, status badge, date range, location, organizer
- Date badge uses primary color with day number and abbreviated month
- Event type badges color-coded (primary for seminar, sky for workshop, emerald for sosialisasi, amber for monev, red for deadline, purple for pelatihan)
- Event type emojis: 🎤🔧📢📊⏰📚
- Counter showing total events matching filter
- "Reset Filter" button when no results
- Loading skeleton, empty state, error state

### 6. Galeri Page (`/galeri`)

- **Hero banner**: "Galeri Kegiatan" with gradient background
- **Category filter**: Select dropdown for gallery categories (Penelitian, Pengabdian Masyarakat, Seminar, Workshop)
- **Grid layout**: Album cards with cover image placeholder
- Each album card: gradient/cover image, category badge, photo count overlay, title, description, date
- **Photo dialog**: Click album to open modal dialog showing photos
- Dialog features: photo navigation (prev/next arrows), thumbnail strip, caption display, photo counter
- Responsive dialog (95vw max, max-w-4xl) with dark background
- Loading skeleton, empty state, error state

### 7. Kontak Page (`/kontak`)

- **Hero banner**: "Hubungi Kami" with gradient background
- **Two-column layout**: Left = contact info, Right = contact form
- **Left column**:
  - Contact info cards: Address, Email (mailto link), Phone (tel link), WhatsApp (wa.me link)
  - Each card has colored icon + label + clickable value
  - Office hours card: Senin-Kamis 08:00-16:00, Jumat 08:00-11:30, Sabtu-Minggu Tutup
  - Google Maps embed: iframe if googleMapsUrl is set, otherwise gray placeholder
- **Right column**:
  - Contact form with react-hook-form + Zod validation
  - Fields: Name (required), Email (required, validated), Phone (optional), Subject (optional), Message (required)
  - Uses `contactMessageSchema` from `@/lib/validations` for validation
  - Submit via `useMutation` to POST `/api/contact`
  - Success toast: "Pesan berhasil dikirim!"
  - Error toast: "Gagal mengirim pesan"
  - Form resets on successful submission
  - Loading spinner during submission
  - Red border + error message for invalid fields
- Loading skeleton, error state

### API Enhancement

Added PATCH endpoint to `/api/document/route.ts`:
- Accepts `{ id: string }` in request body
- Increments `downloadCount` by 1 using Prisma atomic update
- Returns updated document data
- 400 if no ID provided, 500 on server error

### Technical Implementation (All Pages)

- **Data Fetching**: TanStack Query `useQuery` for all GET requests, `useMutation` for contact form POST
- **Animations**: Framer Motion `fadeInUp` and stagger variants on all pages
- **Hero Banners**: Consistent gradient (navy→sky blue) with decorative shapes and grid pattern
- **Loading States**: Custom skeleton components matching each page layout
- **Empty States**: Icon + heading + description pattern
- **Error States**: Red icon + error message + suggestion text
- **Responsive Design**: Mobile-first with Tailwind breakpoints (sm:, md:, lg:)
- **shadcn/ui Components**: Card, Badge, Button, Skeleton, Accordion, Table, Select, Dialog, Input, Textarea, Separator
- **Constants**: `ANNOUNCEMENT_TYPE_LABELS`, `REVIEWER_TYPE_LABELS`, `PARTNER_TYPE_LABELS`, `PARTNER_STATUS_LABELS`, `AGENDA_EVENT_TYPE_LABELS`, `AGENDA_STATUS_LABELS`, `GALLERY_CATEGORY_LABELS`, `GALLERY_CATEGORY_OPTIONS`, `PARTNER_TYPE_OPTIONS`, `AGENDA_EVENT_TYPE_OPTIONS`, `AGENDA_STATUS_OPTIONS`, `PARTNER_STATUS_COLORS`, `AGENDA_STATUS_COLORS` from `@/lib/constants`
- **Helpers**: `formatDate`, `truncateText`, `getInitials`, `getStatusColor` from `@/lib/helpers`
- **Validation**: `contactMessageSchema` from `@/lib/validations`

### Lint & Testing
- All 7 pages return HTTP 200
- No new lint errors introduced (2 pre-existing errors in admin/layout.tsx and hooks/useAuth.ts)
- All pages compile and render correctly in dev server

---

## Task 7-a: Create Public Pages (Profil, Penelitian, Pengabdian, Publikasi, Hibah, Berita)

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/app/profil/page.tsx` — LPPM Profile page
- `/home/z/my-project/src/app/penelitian/page.tsx` — Research listing page
- `/home/z/my-project/src/app/pengabdian/page.tsx` — Community Service listing page
- `/home/z/my-project/src/app/publikasi/page.tsx` — Publications listing page
- `/home/z/my-project/src/app/hibah/page.tsx` — Funding Schemes page
- `/home/z/my-project/src/app/berita/page.tsx` — News listing page

**Files Modified:**
- `/home/z/my-project/src/app/api/funding-scheme/route.ts` — Added status filter support (active/closed)

### 1. Profil Page (`/profil`)

LPPM Profile page with the following sections:

- **Hero banner**: "Profil LPPM" with gradient navy→sky blue background, decorative shapes, grid pattern overlay
- **About section**: Card displaying LPPM description text from `/api/lppm-profile`, with Building2 icon header
- **Chairman's greeting**: Card with photo placeholder (User icon fallback), chairman name, role, and italic blockquote message with left accent border
- **Vision/Mission/Goals/Duties**: Accordion component (shadcn/ui) with all 4 sections expandable, each with colored icon:
  - Visi (Eye icon, primary color)
  - Misi (Target icon, sky color)
  - Tujuan (ClipboardList icon, emerald color)
  - Tugas & Fungsi (ClipboardList icon, amber color)
  - Default: all expanded (`type="multiple"`)
- **Organization structure**: Card with Network icon header, image display if `structureImageUrl` exists, otherwise gradient placeholder
- **Contact info**: Card with MapPin icon header, grid of contact items from `/api/site-settings` (Address, Email, Phone, WhatsApp), each with icon, label, and clickable link
- Data fetched from `/api/lppm-profile` and `/api/site-settings` via TanStack Query
- Loading skeleton, empty state, error state

### 2. Penelitian Page (`/penelitian`)

Research listing page with filters and pagination:

- **Hero banner**: "Penelitian" with FlaskConical icon badge, gradient background
- **Filter bar**: Card with 4 filter controls in responsive grid:
  - Search input (with Search icon prefix) for title search
  - Year select dropdown (current year - 10 years)
  - Status select dropdown (Draft, Berlangsung, Selesai, Dibatalkan)
  - Funding scheme select dropdown
- **Research cards**: Responsive grid (1/2/3 columns), each card:
  - Status badge with color from `PROJECT_STATUS_COLORS`
  - Year badge (outline)
  - Title (line-clamp-2)
  - Abstract truncated to 150 chars via `truncateText`
  - Footer: leader name with User icon, funding source badge
  - Hover: lift + shadow effect
- **Pagination**: Page numbers with ellipsis, prev/next buttons, "Menampilkan X - Y dari Z" counter
- Data fetched from `/api/research` with query params
- Loading skeleton (6 cards), empty state with FlaskConical icon, error state
- Filters reset page to 1 on change

### 3. Pengabdian Page (`/pengabdian`)

Community Service listing page:

- **Hero banner**: "Pengabdian kepada Masyarakat" with HeartHandshake icon badge
- **Filter bar**: 3 controls — search (title + location), year select, status select
- **Service cards**: Responsive grid, each card:
  - Status badge + year badge
  - Title (line-clamp-2)
  - Summary truncated to 150 chars
  - Footer: location with MapPin icon, leader name with User icon
  - Location combines village, district, regency, and location fields
- **Pagination**: Same pattern as penelitian
- Data fetched from `/api/community-service`
- Loading skeleton, empty state with HeartHandshake icon, error state

### 4. Publikasi Page (`/publikasi`)

Publications listing page:

- **Hero banner**: "Publikasi Ilmiah" with BookOpen icon badge
- **Filter bar**: 3 controls — search, publication type select (all 8 types from `PUBLICATION_TYPE_LABELS`), year select
- **Publication list**: Stacked card layout (not grid), each card:
  - Type badge with color from `pubTypeColorMap` (8 distinct colors)
  - Year badge, accreditation badge, indexing badge
  - Title (font-semibold, line-clamp-2)
  - Author names (from `authors` field or `publicationAuthors` relation)
  - Journal name in italic
  - Volume/Number/Pages metadata
  - DOI link with ExternalLink icon (auto-prefixed with https://doi.org/ if not full URL)
  - Generic URL link if no DOI
- **Pagination**: Same pattern
- Data fetched from `/api/publication`
- Loading skeleton (5 list items), empty state with BookOpen icon

### 5. Hibah Page (`/hibah`)

Funding Schemes page:

- **Hero banner**: "Hibah dan Pendanaan" with Award icon badge
- **Filter bar**: 2 controls — status select (Semua/Aktif/Ditutup), year select (5 years)
- **Funding scheme cards**: Responsive grid (1/2/3 columns), each card:
  - Status badge with `FUNDING_SCHEME_STATUS_COLORS`
  - Year badge
  - "Segera Tutup" badge (orange) if deadline ≤ 14 days and active
  - Title (line-clamp-2)
  - Description truncated to 180 chars
  - Source info with Banknote icon
  - Budget range with formatCurrency (Mulai/Maks. prefixes for partial ranges)
  - Deadline with Clock icon and `formatDate`
  - Footer: "Daftar" button (links to registrationUrl if available), "Panduan" button (links to guideFileUrl)
- **No pagination** (funding schemes typically small dataset)
- Data fetched from `/api/funding-scheme` with status/year params
- Loading skeleton (6 cards), empty state with Award icon

### 6. Berita Page (`/berita`)

News listing page:

- **Hero banner**: "Berita LPPM" with Newspaper icon badge
- **Filter bar**: 2 controls — search input, category select
- **Featured news**: Highlighted at top of page 1 (when no filters active):
  - Large card with 2-column grid layout (image left, content right)
  - Gold "Berita Utama" badge with Star icon
  - Category badge + date
  - Title (larger font, xl/2xl)
  - Excerpt (line-clamp-4)
- **News cards**: Responsive grid (1/2/3 columns), each card:
  - Gradient image placeholder (5 rotating gradient styles)
  - Category badge (white, top-left)
  - "Utama" badge (accent, top-right) for featured items
  - Title (line-clamp-2)
  - Excerpt truncated to 120 chars
  - Date footer
- **Pagination**: Same pattern
- Featured news fetched separately from `/api/news?featured=true&pageSize=1`
- Main list from `/api/news` with filters
- Featured item excluded from grid on page 1 to avoid duplication
- Loading skeleton (featured + 6 grid cards), empty state with Newspaper icon

### API Enhancement

Updated `/api/funding-scheme/route.ts`:
- Added `status` query parameter support
- Default behavior: shows both 'active' and 'closed' (excludes 'draft')
- Supports `?status=active` or `?status=closed` for specific filtering
- Previously hardcoded to only show `status: 'active'`

### Technical Implementation (All Pages)

- **Data Fetching**: TanStack Query `useQuery` for all GET requests
- **Animations**: Framer Motion `motion.div` with `initial={{ opacity: 0, y: 20 }}` and `whileInView={{ opacity: 1, y: 0 }}` for all section animations
- **Hero Banners**: Consistent gradient (navy→sky blue) with decorative blur circles and grid pattern overlay
- **Loading States**: Custom skeleton components matching each page's layout
- **Empty States**: Relevant icon + heading + suggestion pattern
- **Error States**: Red error message
- **Responsive Design**: Mobile-first with Tailwind breakpoints (sm:, md:, lg:)
- **shadcn/ui Components**: Card, CardContent, CardHeader, CardTitle, CardFooter, Badge, Button, Input, Skeleton, Select, Accordion, AccordionItem, AccordionTrigger, AccordionContent
- **Constants**: `PROJECT_STATUS_LABELS`, `PROJECT_STATUS_COLORS`, `PUBLICATION_TYPE_LABELS`, `FUNDING_SCHEME_STATUS_LABELS`, `FUNDING_SCHEME_STATUS_COLORS`, `DEFAULT_PAGE_SIZE` from `@/lib/constants`
- **Helpers**: `formatDate`, `formatCurrency`, `truncateText` from `@/lib/helpers`

### Lint & Testing
- All 6 pages return HTTP 200
- ESLint passes with no errors on new files
- All pages compile successfully in dev server (first compile ~450ms, subsequent <15ms)
- No new lint errors introduced

---

## Task 8: Admin Layout with Sidebar, Login Page, and Dashboard

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/hooks/useAuth.ts` — Custom authentication hook
- `/home/z/my-project/src/app/api/auth/login/route.ts` — Login API endpoint
- `/home/z/my-project/src/app/api/auth/logout/route.ts` — Logout API endpoint
- `/home/z/my-project/src/app/login/page.tsx` — Admin login page
- `/home/z/my-project/src/app/admin/layout.tsx` — Admin layout with sidebar
- `/home/z/my-project/src/app/admin/page.tsx` — Admin dashboard page

**Files Modified:**
- `/home/z/my-project/src/components/layout/PublicLayout.tsx` — Added path exclusion for admin/login routes
- `/home/z/my-project/src/app/api/stats/route.ts` — Enhanced with chart data (per-year stats, groupBy, recent activity)
- `/home/z/my-project/seed.ts` — Added admin Profile records for authentication

### 1. useAuth Hook (`/src/hooks/useAuth.ts`)

Custom React hook for client-side authentication state management:
- **State**: `user` (AuthUser | null), `loading` (boolean), `isAuthenticated` (derived boolean)
- **Methods**: `login(userData)`, `logout()`
- **Storage**: Uses `localStorage` with key `lppm_admin` for persistence
- **Lazy initialization**: Uses `useState(() => getStoredUser())` to read from localStorage on mount (avoiding SSR issues with `typeof window === 'undefined'` check)
- **AuthUser interface**: `{ id, email, fullName, role }`
- **Helper function**: `getStoredUser()` safely parses localStorage with error handling, validates required fields, cleans up invalid entries

### 2. Login API Route (`/api/auth/login`)

POST endpoint for admin authentication:
- **Request body**: `{ email: string, password: string }`
- **Validation**: Returns 400 if email or password is missing
- **Authentication logic**: Checks if email exists in Profile table and `isActive` is true
- **Response on success**: `{ success: true, data: { id, email, fullName, role } }`
- **Response on failure**: 401 with error message "Email tidak terdaftar atau akun tidak aktif"
- **Error handling**: 500 for server errors with console.error logging
- **Note**: Password validation is simplified (any password accepted) since Profile model doesn't have a password field — this is a demo setup

### 3. Logout API Route (`/api/auth/logout`)

POST endpoint that returns success response:
- **Response**: `{ success: true, message: "Logout berhasil" }`
- Actual token/session clearing is done client-side via the `useAuth` hook

### 4. Login Page (`/login`)

Professional login page with LPPM branding:
- **Layout**: Centered card on full-screen gradient background (navy → sky blue)
- **Decorative elements**: Blurred circles, grid pattern overlay
- **Card content**:
  - LPPM logo (GraduationCap icon in primary-colored rounded square)
  - Title: "Login Admin LPPM"
  - Subtitle: "Lembaga Penelitian dan Pengabdian kepada Masyarakat"
  - Email field with Mail icon prefix
  - Password field with Lock icon prefix
  - Submit button with loading state (Loader2 spinner)
  - Footer text with admin contact suggestion
- **Form handling**: react-hook-form with zodResolver validation (email format, password required)
- **Authentication flow**:
  1. Submit to POST `/api/auth/login`
  2. On success: store user data via `useAuth.login()`, show success toast, redirect to `/admin`
  3. On failure: show error toast with API error message
  4. On network error: show "Terjadi kesalahan jaringan" toast
- **Animations**: Framer Motion fade-in for card, scale-in for logo
- **shadcn/ui**: Card, CardHeader, CardContent, Button, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- **sonner**: Toast notifications for success/error messages

### 5. Admin Layout (`/admin/layout.tsx`)

Full admin layout with sidebar navigation:
- **Authentication guard**: Uses `useAuth` hook, redirects to `/login` if not authenticated
- **Loading state**: Pulsing logo animation while checking auth
- **Desktop sidebar** (≥lg breakpoint):
  - Fixed width 280px, dark navy background (`bg-primary`)
  - Collapse/expand toggle button (72px collapsed width)
  - Logo section: GraduationCap icon + "LPPM" text + "Admin Panel" subtitle
  - 20 navigation items with lucide-react icons, each with active state highlighting
  - Active items: white/15 background, accent-colored icon
  - Inactive items: 75% opacity text, hover effect
  - Logout button at bottom with red hover effect
  - ScrollArea for menu overflow
- **Mobile sidebar** (<lg breakpoint):
  - Hamburger menu button in header
  - Slides in from left with Framer Motion spring animation
  - Dark overlay backdrop
  - Close on link click via `onNavigate` callback
  - Same navigation items as desktop
- **Top header bar**:
  - Sticky positioning with white background and shadow
  - Page title derived from current route
  - Admin name and role badge (from `useAuth.user`)
  - Logout button with red styling
- **Main content area**: Flexible with padding, overflow scroll
- **Navigation items** (20 items):
  1. Dashboard → /admin
  2. Profil LPPM → /admin/profil
  3. Dosen/Peneliti → /admin/researchers
  4. Fakultas → /admin/faculties
  5. Program Studi → /admin/study-programs
  6. Penelitian → /admin/research
  7. Pengabdian → /admin/community-service
  8. Publikasi → /admin/publications
  9. Hibah/Pendanaan → /admin/funding
  10. Berita → /admin/news
  11. Pengumuman → /admin/announcements
  12. Dokumen Unduhan → /admin/documents
  13. Reviewer → /admin/reviewers
  14. Review Proposal → /admin/reviews
  15. Kerja Sama → /admin/partners
  16. Agenda → /admin/agenda
  17. Galeri → /admin/gallery
  18. Pesan Kontak → /admin/messages
  19. User Admin → /admin/users
  20. Pengaturan → /admin/settings

### 6. Admin Dashboard Page (`/admin`)

Comprehensive dashboard overview with statistics, charts, and recent activity:
- **Statistics cards** (6 cards in responsive 1/2/3 grid):
  - Total Penelitian (FlaskConical, primary color)
  - Total Pengabdian (HeartHandshake, sky color)
  - Total Publikasi (FileText, emerald color)
  - Total Dosen/Peneliti (Users, amber color)
  - Total Hibah Aktif (Banknote, purple color)
  - Total Mitra (Handshake, rose color)
- **Charts** (4 charts using Recharts with shadcn/ui ChartContainer):
  1. **Bar chart**: Penelitian per Tahun (last 5 years) — primary navy color
  2. **Bar chart**: Pengabdian per Tahun (last 5 years) — sky blue color
  3. **Pie chart**: Publikasi berdasarkan Jenis — 8-color palette for publication types
  4. **Bar chart**: Hibah berdasarkan Status — gray/green/red for draft/active/closed
- **Recent activity section**:
  - Combined list of 5 most recent research, community services, and news
  - Each item: colored icon, title (truncated), status badge, creation date
  - Color-coded by type: primary for research, sky for community service, amber for news
- **Chart configs**: Proper ChartConfig objects for tooltip/legend labels
- **Data fetching**: TanStack Query `useQuery` from `/api/stats`
- **Loading states**: Skeleton components for cards and charts
- **Empty states**: Centered text for charts with no data
- **Animations**: Framer Motion stagger container with fade-up items

### 7. PublicLayout Modification

Updated `PublicLayout.tsx` to conditionally render Navbar/Footer:
- Uses `usePathname()` to check current route
- Excluded paths: `/admin`, `/login` (and all sub-paths)
- For excluded paths: renders children only (no Navbar/Footer wrapper)
- For all other paths: renders Navbar + main + Footer layout

### 8. Stats API Enhancement

Enhanced `/api/stats/route.ts` with additional data for admin dashboard charts:
- **researchPerYear**: Array of `{ year, count }` for last 5 years
- **servicePerYear**: Array of `{ year, count }` for last 5 years
- **publicationsByType**: Grouped by `publicationType` using Prisma `groupBy`
- **fundingByStatus**: Grouped by `status` using Prisma `groupBy`
- **recentResearch**: 5 most recent research entries (id, title, status, year, createdAt)
- **recentServices**: 5 most recent community services (id, title, status, year, createdAt)
- **recentNews**: 5 most recent news (id, title, status, createdAt)
- All new data fetched via `Promise.all` alongside existing stats

### 9. Seed Data Update

Added admin Profile records to `seed.ts`:
- **Super Admin**: `admin@lppm.ac.id` / fullName: "Admin LPPM" / role: super_admin
- **Editor**: `editor@lppm.ac.id` / fullName: "Editor LPPM" / role: editor
- Both with `isActive: true` and `upsert` pattern for idempotent seeding

---

## Task 10-b: Create Admin CRUD Pages for Publications, Funding, News, Announcements, Documents

**Date:** 2026-03-05
**Files Created:**

### API Routes (10 files)

| # | File Path | Methods | Description |
|---|-----------|---------|-------------|
| 1 | `api/admin/publications/route.ts` | GET, POST | List publications (paginated, filterable by publicationType/year/isPublished/search) + Create publication with Zod validation |
| 2 | `api/admin/publications/[id]/route.ts` | GET, PUT, DELETE | Get/Update/Delete single publication by ID |
| 3 | `api/admin/funding/route.ts` | GET, POST | List funding schemes (paginated, filterable by status/year/search) + Create with Zod validation + deadline > openDate refine |
| 4 | `api/admin/funding/[id]/route.ts` | GET, PUT, DELETE | Get/Update/Delete single funding scheme by ID |
| 5 | `api/admin/news/route.ts` | GET, POST | List news (paginated, filterable by status/categoryId/isFeatured/search) + Create with Zod validation |
| 6 | `api/admin/news/[id]/route.ts` | GET, PUT, DELETE | Get/Update/Delete single news by ID |
| 7 | `api/admin/announcements/route.ts` | GET, POST | List announcements (paginated, filterable by status/type/search) + Create with Zod validation |
| 8 | `api/admin/announcements/[id]/route.ts` | GET, PUT, DELETE | Get/Update/Delete single announcement by ID |
| 9 | `api/admin/documents/route.ts` | GET, POST | List documents (paginated, filterable by categoryId/isActive/search) + Create with Zod validation |
| 10 | `api/admin/documents/[id]/route.ts` | GET, PUT, DELETE | Get/Update/Delete single document by ID |

### Admin Pages (5 files)

| # | File Path | Module | Description |
|---|-----------|--------|-------------|
| 1 | `admin/publications/page.tsx` | Publikasi | DataTable with Title, Type (badge), Year, Authors, Journal, Status columns. Add/Edit dialog with all publication fields including researchId/serviceId selects. Delete confirmation. |
| 2 | `admin/funding/page.tsx` | Hibah/Pendanaan | DataTable with Name, Source, Year, Budget Range, Deadline, Status columns. Add/Edit dialog with date inputs for openDate/deadline, budget fields, validation deadline > openDate. Delete confirmation. |
| 3 | `admin/news/page.tsx` | Berita | DataTable with Title, Category, Status, Featured, Published Date columns. Add/Edit dialog with category select, content textarea, SEO fields, isFeatured checkbox. Delete confirmation. |
| 4 | `admin/announcements/page.tsx` | Pengumuman | DataTable with Title, Type (badge), Status, Published Date columns. Add/Edit dialog with type select (normal/important), status select (draft/active/inactive), date fields. Delete confirmation. |
| 5 | `admin/documents/page.tsx` | Dokumen Unduhan | DataTable with Title, Category, File Type, Downloads, Active columns. Add/Edit dialog with category select, file metadata fields, isActive checkbox, read-only download count. Delete confirmation. |

### API Route Implementation Details

All API routes follow a consistent pattern:
- **GET (list)**: Paginated with `page`, `pageSize` query params, returns `{ data, total, page, pageSize, totalPages }`
- **GET (single)**: Returns `{ data: item }` or 404
- **POST**: Validates body with Zod schema from `@/lib/validations`, auto-generates slug via `generateSlug()` from `@/lib/helpers`, returns 201 on success with `{ success: true, data }`
- **PUT**: Same validation as POST, checks existence first (404 if not found), handles slug collision with `slug-timestamp` pattern
- **DELETE**: Checks existence first (404 if not found), returns `{ success: true, message }`
- **Error handling**: try/catch with `console.error`, Zod validation errors return 400 with `{ error, details }`, server errors return 500
- **Dynamic route params**: Uses `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params` (Next.js 16 pattern)
- **Database**: All routes use `import { db } from '@/lib/db'` (Prisma client)
- **Slug generation**: `generateSlug()` from `@/lib/helpers`, with timestamp suffix for collision avoidance

### Admin Page Implementation Details

All 5 admin pages follow a consistent pattern:
- **`'use client'`** directive for client-side rendering
- **TanStack Query**: `useQuery` for data fetching, `useMutation` for create/update/delete operations
- **react-hook-form + zodResolver**: Form validation using Zod schemas from `@/lib/validations`
- **sonner toast**: Success/error notifications on CRUD operations
- **shadcn/ui components**: Dialog (add/edit), AlertDialog (delete confirmation), Card, Badge, Button, Input, Textarea, Select, Table, Skeleton, Checkbox, Label
- **Search**: Input with Search icon, debounced search triggers page reset
- **Pagination**: Simple prev/next with page counter, uses `DEFAULT_PAGE_SIZE` from constants
- **Responsive**: Tables with `overflow-x-auto`, hidden columns on mobile (`hidden md:table-cell`, `hidden lg:table-cell`)
- **Status badges**: Color-coded using `getStatusColor()` from helpers + specific label maps from constants
- **Framer Motion**: Fade-in animation on page mount
- **Loading states**: Skeleton rows while data loads
- **Empty states**: Centered text when no data

### Module-Specific Features

**Publications**:
- Form fields: title, publicationType (8 options from PUBLICATION_TYPE_OPTIONS), authors, publisherName, journalName, year, volume, number, pages, issn, isbn, doi, url, indexing, accreditation, researchId (optional select), serviceId (optional select), isPublished
- Research/Community Service selects fetched from public API endpoints when dialog opens
- `_none` placeholder value for nullable selects (researchId, serviceId)

**Funding**:
- Budget range display using `formatCurrency()` from helpers
- Date inputs (type="date") for openDate and deadline
- Deadline validation built into Zod schema (`.refine()` ensuring deadline > openDate)
- Budget fields use `setValueAs` to convert empty strings to null

**News**:
- Featured indicator with Star icon (filled amber for featured items)
- Content as Textarea (6 rows)
- Category select fetched from `/api/news/categories`
- Auto-set publishedAt when status changes to 'published'

**Announcements**:
- Type badge with red border for "important" type
- Date inputs for publishedAt and expiredAt
- Auto-set publishedAt when status changes to 'active'

**Documents**:
- Download count displayed in table (read-only)
- File type shown as uppercase Badge (secondary variant)
- Category select fetched from `/api/document/categories`
- isActive shown as status badge (Aktif/Nonaktif)
- Read-only download count field in edit form

### Lint & Testing

- All 5 admin pages return HTTP 200
- All 5 API list endpoints return HTTP 200 with valid JSON
- ESLint: 0 errors, 7 warnings (all React Compiler incompatible library warnings for `form.watch()` — same pattern as existing pages)
- No new lint errors introduced
- Dev server compiles and serves all pages correctly
- Stats API returns all fields including chart data
- All pages compile successfully in dev server


---

## Task 11: SEO, Error Handling, and Middleware

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/app/sitemap.ts` — Dynamic sitemap generation
- `/home/z/my-project/src/app/robots.ts` — Robots.txt generation
- `/home/z/my-project/src/app/not-found.tsx` — Custom 404 page
- `/home/z/my-project/src/app/loading.tsx` — Global loading page
- `/home/z/my-project/src/app/error.tsx` — Global error boundary
- `/home/z/my-project/src/middleware.ts` — Admin route protection middleware

**Files Modified:**
- `/home/z/my-project/src/app/api/auth/login/route.ts` — Added auth cookie on login
- `/home/z/my-project/src/app/api/auth/logout/route.ts` — Clear auth cookie on logout
- `/home/z/my-project/src/hooks/useAuth.ts` — Clear cookie on client-side logout
- `/home/z/my-project/src/app/admin/layout.tsx` — Call logout API on admin logout

### 1. sitemap.ts

Dynamic sitemap generation for SEO:
- **Static pages**: 14 pages (home, profil, penelitian, pengabdian, publikasi, hibah, berita, pengumuman, dokumen, reviewer, kerjasama, agenda, galeri, kontak) with appropriate changeFrequency and priority values
- **Dynamic pages**: Fetched from database (research, community service, publication, news, announcement, funding schemes) with their `updatedAt` timestamps
- **Fallback**: If database query fails, returns only static pages
- Uses `NEXT_PUBLIC_SITE_URL` environment variable with fallback to `https://lppm.kampus.ac.id`

### 2. robots.ts

Robots.txt configuration:
- Allows all user agents to crawl `/`
- Disallows: `/admin`, `/api/`, `/login`
- Points to sitemap at `{baseUrl}/sitemap.xml`

### 3. not-found.tsx

Custom 404 page with LPPM branding:
- **'use client'** directive
- Centered content with gradient background
- Large "404" text (8xl font, primary/20 color)
- FileQuestion icon in primary-colored circle
- "Halaman Tidak Ditemukan" heading
- Description text explaining the error
- "Kembali ke Beranda" button (Home icon, links to /)
- "Halaman Sebelumnya" button (ArrowLeft icon, uses history.back())
- Footer text with LPPM name
- Responsive layout (stacked buttons on mobile, inline on desktop)

### 4. loading.tsx

Global loading page:
- Centered spinner/skeleton on full-screen background
- GraduationCap icon in primary-colored rounded square
- Ping animation around the logo
- "LPPM" text with "Memuat halaman..." subtitle
- Three animated bouncing dots
- Simple and professional design matching LPPM theme

### 5. error.tsx

Global error boundary:
- **'use client'** directive (required for error.tsx)
- Console error logging on mount
- AlertCircle icon in destructive-colored circle
- "Terjadi Kesalahan" heading
- Description text with error digest ID if available
- "Coba Lagi" button (RotateCcw icon, calls reset())
- "Kembali ke Beranda" button (Home icon, links to /)
- Responsive layout with stacked/inline buttons
- LPPM footer text

### 6. middleware.ts

Admin route protection middleware:
- Checks for `lppm_auth` cookie on all `/admin/*` routes
- If cookie is missing, redirects to `/login`
- Uses Next.js middleware with `matcher: ['/admin/:path*']`
- Works alongside client-side auth check in admin layout (defense in depth)

### 7. Login API Update

Updated `/api/auth/login/route.ts`:
- Sets `lppm_auth=1` cookie on successful login
- Cookie options: path=/, httpOnly=false, sameSite=lax, maxAge=7 days
- Secure flag enabled in production environment

### 8. Logout API Update

Updated `/api/auth/logout/route.ts`:
- Clears `lppm_auth` cookie by setting maxAge=0
- Returns success JSON response

### 9. useAuth Hook Update

Updated `useAuth.ts`:
- `logout()` function now also clears `lppm_auth` cookie via `document.cookie`
- Ensures cookie is cleared even if only client-side logout is called

### 10. Admin Layout Update

Updated `admin/layout.tsx`:
- Both logout handlers (sidebar + header) now call `/api/auth/logout` before client-side cleanup
- Ensures server-side cookie is properly cleared on logout
- Error handling: ignores API errors, still proceeds with local logout

### Lint & Testing
- ESLint passes with no new errors (9 pre-existing react-hooks/incompatible-library warnings)
- All new files compile successfully
- Pre-existing dev server issue with conflicting dynamic route slug names in gallery API (not from this task)

## Task 10-a: Create Admin CRUD Pages for LPPM Profile, Reviewers, Reviews, Partners, Agenda

**Date:** 2026-03-05
**Files Created:**

### API Routes
- `/home/z/my-project/src/app/api/admin/lppm-profile/route.ts` — GET (first record) + PUT (upsert)
- `/home/z/my-project/src/app/api/admin/reviewers/route.ts` — GET (paginated) + POST
- `/home/z/my-project/src/app/api/admin/reviewers/[id]/route.ts` — GET + PUT + DELETE
- `/home/z/my-project/src/app/api/admin/reviews/route.ts` — GET (paginated) + POST
- `/home/z/my-project/src/app/api/admin/reviews/[id]/route.ts` — GET + PUT + DELETE
- `/home/z/my-project/src/app/api/admin/partners/route.ts` — GET (paginated) + POST
- `/home/z/my-project/src/app/api/admin/partners/[id]/route.ts` — GET + PUT + DELETE
- `/home/z/my-project/src/app/api/admin/agenda/route.ts` — GET (paginated) + POST
- `/home/z/my-project/src/app/api/admin/agenda/[id]/route.ts` — GET + PUT + DELETE

### Admin Pages
- `/home/z/my-project/src/app/admin/profil/page.tsx` — LPPM Profile form page with preview
- `/home/z/my-project/src/app/admin/reviewers/page.tsx` — Reviewers DataTable with CRUD
- `/home/z/my-project/src/app/admin/reviews/page.tsx` — Proposal Reviews DataTable with CRUD
- `/home/z/my-project/src/app/admin/partners/page.tsx` — Partners DataTable with CRUD
- `/home/z/my-project/src/app/admin/agenda/page.tsx` — Agenda DataTable with CRUD

---

### 1. Admin Profil LPPM (`/admin/profil`)

**NOT a DataTable** — this is a form page with live preview:
- **Form fields**: about (textarea), vision (textarea), mission (textarea), goals (textarea), duties (textarea), chairmanName, chairmanPhotoUrl, chairmanMessage (textarea), structureImageUrl
- **Save button** that PUTs to `/api/admin/lppm-profile` with upsert pattern
- **Preview card** on the right side (desktop only) showing how the profile looks
- **API**: GET returns first LppmProfile record or null; PUT uses upsert (create if not exists, update if exists)
- **Responsive**: 2-column layout on desktop (form + preview), single column on mobile
- **Loading skeleton** while fetching existing data
- **Auto-populates** form with existing data on load via `useQuery` + `onSuccess`

### 2. Admin Reviewers (`/admin/reviewers`)

**DataTable** with full CRUD:
- **Table columns**: Name, NIDN, Institution, Expertise, Type (Internal/External badge with colors), Active status, Actions
- **Filters**: Search (name, NIDN, email, institution), Type filter (Internal/Eksternal), Active status filter
- **Form dialog**: name (required), nidn, nip, email, phone, institution, expertise, reviewerType (required, select from REVIEWER_TYPE_OPTIONS), isActive (switch)
- **Type badges**: Internal = green outline, External = purple outline
- **Status badges**: Aktif = green, Tidak Aktif = yellow (via getStatusColor)
- **Validation**: Uses `reviewerSchema` from `@/lib/validations`
- **API includes**: researcher relation and proposalReviews count

### 3. Admin Review Proposal (`/admin/reviews`)

**DataTable** with full CRUD:
- **Table columns**: Proposal Type (badge), Proposal Title, Reviewer name, Score, Status (badge with PROPOSAL_REVIEW_STATUS_COLORS), Reviewed At, Actions
- **Filters**: Search (proposal title, reviewer name), Proposal Type filter, Status filter
- **Form dialog**: proposalType (research/community_service select), researchId (select from research list, shown when type=research), serviceId (select from community service list, shown when type=community_service), reviewerId (select from reviewers), score (0-100 number input), notes (textarea), status (select from PROPOSAL_REVIEW_STATUS_OPTIONS), reviewFileUrl, reviewedAt (datetime-local)
- **Dynamic form**: researchId/serviceId fields toggle based on proposalType
- **Status badges**: Waiting=yellow, Reviewing=blue, Revision=orange, Accepted=green, Rejected=red
- **Validation**: Inline Zod schema (proposalReviewSchema) with proper type constraints
- **API includes**: research, service, and reviewer relations

### 4. Admin Partners - Kerja Sama (`/admin/partners`)

**DataTable** with full CRUD:
- **Table columns**: Name, Type (badge from PARTNER_TYPE_LABELS), Cooperation Type, Status (badge with PARTNER_STATUS_COLORS), Period (formatted date range), Actions
- **Filters**: Search (name, contact, email, cooperationType), Type filter (from PARTNER_TYPE_OPTIONS), Status filter (from PARTNER_STATUS_OPTIONS)
- **Form dialog**: name (required), partnerType (required, select from PARTNER_TYPE_OPTIONS), cooperationType, contactPerson, email, phone, startDate (date input), endDate (date input), status (required, select from PARTNER_STATUS_OPTIONS), logoUrl, address (textarea), documentUrl
- **Status badges**: Aktif=green, Tidak Aktif=gray, Kedaluwarsa=red
- **Slug generation**: Auto-generates unique slug from name using `generateSlug()` helper
- **Validation**: Uses `partnerSchema` from `@/lib/validations`

### 5. Admin Agenda (`/admin/agenda`)

**DataTable** with full CRUD:
- **Table columns**: Title, Event Type (badge from AGENDA_EVENT_TYPE_LABELS), Start Date, End Date, Location, Status (badge with AGENDA_STATUS_COLORS), Actions
- **Filters**: Search (title, location, organizer), Event Type filter (from AGENDA_EVENT_TYPE_OPTIONS), Status filter (from AGENDA_STATUS_OPTIONS)
- **Form dialog**: title (required), description (textarea), eventType (select from AGENDA_EVENT_TYPE_OPTIONS, with "__none__" for null), status (required, select from AGENDA_STATUS_OPTIONS), startDate (datetime-local, required), endDate (datetime-local), location, organizer, posterUrl
- **Status badges**: Akan Datang=blue, Berlangsung=green, Selesai=gray, Dibatalkan=red
- **Slug generation**: Auto-generates unique slug from title using `generateSlug()` helper
- **Validation**: Uses `agendaSchema` from `@/lib/validations` (includes endDate >= startDate refinement)
- **Ordered by**: startDate desc

---

### Technical Implementation (All Pages)

- **Pattern**: Followed existing researchers page pattern exactly
- **'use client'**: All pages are client components
- **Data Fetching**: `useQuery` + `useMutation` from @tanstack/react-query
- **Notifications**: sonner toast for success/error
- **Forms**: react-hook-form + zodResolver with existing schemas from `@/lib/validations`
- **UI Components**: shadcn/ui Dialog, AlertDialog, Card, Badge, Button, Input, Textarea, Select, Table, Skeleton, ScrollArea, Form, Switch, Separator
- **Constants**: Imported from `@/lib/constants` for all status labels, options, and color maps
- **Helpers**: `formatDate`, `formatDateTime`, `getStatusColor`, `generateSlug` from `@/lib/helpers`
- **Pagination**: "Menampilkan X dari Y" + Sebelumnya/Selanjutnya buttons
- **Loading**: Skeleton placeholders matching table row structure
- **Empty states**: Module-specific icon + heading + suggestion text
- **Animations**: Framer Motion stagger container with fade-up items
- **Responsive**: Mobile-first with sm:/lg: breakpoints, overflow-x-auto on tables
- **API pattern**: `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params`
- **API error handling**: try/catch with console.error and JSON error responses
- **API validation**: Zod safeParse with joined error messages on failure

### Lint
- 0 errors, 13 warnings (all pre-existing react-hooks/incompatible-library warnings)
- No new issues introduced

---

## Task 10-b: Admin CRUD Pages for Gallery, Messages, Users, Settings

**Date:** 2026-06-12
**Files Created:**

### API Routes
- `/home/z/my-project/src/app/api/admin/gallery/route.ts` — Gallery albums: GET (list with photo count), POST (create album)
- `/home/z/my-project/src/app/api/admin/gallery/[id]/route.ts` — Gallery album: GET (with photos), PUT (update), DELETE (cascade)
- `/home/z/my-project/src/app/api/admin/gallery/[id]/photos/route.ts` — Album photos: GET (list), POST (add photo)
- `/home/z/my-project/src/app/api/admin/gallery/[id]/photos/[photoId]/route.ts` — Photo: PUT (update caption), DELETE
- `/home/z/my-project/src/app/api/admin/messages/route.ts` — Messages: GET (list with pagination, isRead filter, unreadCount)
- `/home/z/my-project/src/app/api/admin/messages/[id]/route.ts` — Message: GET, PUT (mark as read), DELETE
- `/home/z/my-project/src/app/api/admin/users/route.ts` — Users: GET (list), POST (create profile)
- `/home/z/my-project/src/app/api/admin/users/[id]/route.ts` — User: GET, PUT (update), DELETE
- `/home/z/my-project/src/app/api/admin/settings/route.ts` — Settings: GET (first record or null), PUT (upsert pattern)

### Admin Pages
- `/home/z/my-project/src/app/admin/gallery/page.tsx` — Gallery admin page
- `/home/z/my-project/src/app/admin/messages/page.tsx` — Contact messages admin page
- `/home/z/my-project/src/app/admin/users/page.tsx` — User management admin page
- `/home/z/my-project/src/app/admin/settings/page.tsx` — Site settings admin page

**Files Modified:**
- `/home/z/my-project/src/lib/validations.ts` — Added `galleryCategoryEnum`, `galleryAlbumSchema`, `GalleryAlbumInput`, `galleryPhotoSchema`, `GalleryPhotoInput`

### 1. Gallery API Routes

**GET /api/admin/gallery**: List albums with photo count using `_count` include, supports search and category filter, paginated.
**POST /api/admin/gallery**: Create album with auto-generated slug from title, validates with `galleryAlbumSchema`.
**GET /api/admin/gallery/[id]**: Get album with all photos ordered by createdAt desc.
**PUT /api/admin/gallery/[id]**: Update album, handles slug conflict resolution.
**DELETE /api/admin/gallery/[id]**: Delete album (cascade deletes photos via Prisma `onDelete: Cascade`).
**GET /api/admin/gallery/[id]/photos**: List photos in album.
**POST /api/admin/gallery/[id]/photos**: Add photo to album (imageUrl, caption).
**PUT /api/admin/gallery/[id]/photos/[photoId]**: Update photo (imageUrl, caption).
**DELETE /api/admin/gallery/[id]/photos/[photoId]**: Delete photo.

### 2. Contact Messages API Routes

**GET /api/admin/messages**: List all contact messages with pagination, supports `isRead` filter and search, includes `unreadCount` in response.
**No POST** — messages are created from the public contact form.
**GET /api/admin/messages/[id]**: Get message detail.
**PUT /api/admin/messages/[id]**: Update message (mark as read: `{ isRead: true }`).
**DELETE /api/admin/messages/[id]**: Delete message.

### 3. Users API Routes

**GET /api/admin/users**: List all profiles with pagination, search, and role filter.
**POST /api/admin/users**: Create new profile with email uniqueness check.
**GET /api/admin/users/[id]**: Get profile detail.
**PUT /api/admin/users/[id]**: Update profile with email conflict detection.
**DELETE /api/admin/users/[id]**: Delete profile.

### 4. Settings API Route

**GET /api/admin/settings**: Get first SiteSetting record, returns `{ data: null }` if none exists.
**PUT /api/admin/settings**: Upsert pattern — updates existing record or creates new one if none exists.

### 5. Admin Gallery Page

DataTable of albums with columns: Title, Category, Photo Count, Cover, Actions.
- **Add/Edit album dialog**: title, description, coverUrl, category (select from GALLERY_CATEGORY_OPTIONS)
- **View album button** → opens a Dialog showing photos in a responsive grid (2/3/4 cols)
- **Add photo form** inside the photo dialog: imageUrl, caption inputs
- **Delete photo button** on each photo (hover-revealed X button)
- **Delete album** with confirmation (warns about cascade photo deletion)
- Search, pagination, loading skeleton states
- Follows same pattern as existing admin pages (useQuery + useMutation, sonner toast, react-hook-form + zodResolver)

### 6. Admin Messages Page

DataTable: Name, Email, Subject, Date, Read/Unread badge, Actions.
- **Filter**: read/unread/all via Select dropdown
- **Click to view** message detail in a Dialog (shows name, email, phone, date, subject, message body)
- **Auto mark as read** when opening a message
- **Mark as read button** in table and dialog
- **Unread count** shown in header with Badge
- **Delete** with confirmation AlertDialog
- Unread messages have highlighted row background (`bg-muted/40`)
- Responsive layout with hidden columns on mobile

### 7. Admin Users Page

DataTable: Name (with avatar), Email, Role (colored badge), Active status, Created date, Actions.
- **Form dialog**: fullName, email, role (select from USER_ROLE_OPTIONS), avatarUrl, isActive (Switch toggle)
- **Role badges** with distinct colors per role:
  - super_admin: red
  - admin_lppm: emerald
  - editor: sky blue
  - reviewer: amber
- **Cannot delete self** — delete button hidden for current user
- **Email uniqueness** validated on both create and update
- Search, pagination, loading states

### 8. Admin Settings Page

NOT a DataTable — a form page for editing site settings, organized in Tabs:
- **Tab "Umum"**: siteName, lppmName, email, phone, whatsapp, address
- **Tab "Media"**: logoUrl, lppmLogoUrl, faviconUrl, googleMapsUrl — with logo preview section
- **Tab "Sosial Media"**: facebookUrl, instagramUrl, youtubeUrl
- **Tab "SEO"**: seoTitle, seoDescription — with Google search result preview
- Single "Simpan Pengaturan" save button using PUT upsert pattern
- Form synced with fetched data via separate useQuery
- Loading skeleton while data is being fetched
- Tabs use shadcn/ui Tabs component with icons

### Design Decisions

- **Consistent pattern**: All admin pages follow the same pattern established by existing pages (announcements, etc.)
- **Dynamic route params**: Using `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params` as required by Next.js 16
- **Gallery route structure**: Used `[id]` consistently for album routes (not `[albumId]`) to avoid Next.js slug name conflict
- **Settings upsert**: PUT creates if no record exists, updates if one does
- **Messages auto-read**: Automatically marks message as read when opened in dialog
- **User self-protection**: Delete button hidden for current user (placeholder logic for auth integration)
- **Role badge colors**: Each role gets a distinct color for quick visual identification

### Lint & Testing

- ESLint passes with 0 errors, 13 warnings (all are `react-hooks/incompatible-library` warnings from `form.watch()` — same as existing pages)
- All 4 new API endpoint groups tested and returning correct responses
- All 4 admin pages compile successfully

## Task 2-a: Create Detail API Routes for Public Pages

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/app/api/research/[slug]/route.ts` — GET single research detail
- `/home/z/my-project/src/app/api/community-service/[slug]/route.ts` — GET single community service detail
- `/home/z/my-project/src/app/api/publication/[slug]/route.ts` — GET single publication detail
- `/home/z/my-project/src/app/api/news/[slug]/route.ts` — GET single news article detail
- `/home/z/my-project/src/app/api/announcement/[slug]/route.ts` — GET single announcement detail
- `/home/z/my-project/src/app/api/funding-scheme/[slug]/route.ts` — GET single funding scheme detail

### 1. Research Detail (`/api/research/[slug]`)
- Fetches research by slug with full relations:
  - leader: select id, name, nidn, photoUrl, expertise, email
  - fundingScheme: select id, name, slug, source, year
  - faculty: select id, name, slug
  - studyProgram: select id, name, slug
  - members: include researcher (select id, name, nidn, photoUrl)
  - studentMembers: all fields
  - publications: select id, title, slug, publicationType, year
- Returns 404 if not found or isPublished is false

### 2. Community Service Detail (`/api/community-service/[slug]`)
- Fetches community service by slug with full relations:
  - leader: select id, name, nidn, photoUrl, expertise, email
  - fundingScheme: select id, name, slug, source, year
  - faculty: select id, name, slug
  - studyProgram: select id, name, slug
  - members: include researcher (select id, name, nidn, photoUrl)
  - studentMembers: all fields
  - publications: select id, title, slug, publicationType, year
- Returns 404 if not found or isPublished is false

### 3. Publication Detail (`/api/publication/[slug]`)
- Fetches publication by slug with:
  - research: select id, title, slug, year
  - service: select id, title, slug, year
  - publicationAuthors: include researcher (select id, name, nidn, photoUrl)
- Returns 404 if not found or isPublished is false

### 4. News Detail (`/api/news/[slug]`)
- Fetches news by slug with:
  - category: select id, name, slug
- Returns 404 if not found or status is not 'published'

### 5. Announcement Detail (`/api/announcement/[slug]`)
- Fetches announcement by slug (no relations)
- Returns 404 if not found or status is not 'active'

### 6. Funding Scheme Detail (`/api/funding-scheme/[slug]`)
- Fetches funding scheme by slug with filtered relations:
  - researches: where isPublished=true, select id, title, slug, year, status, leader (select id, name)
  - communityServices: where isPublished=true, select id, title, slug, year, status, leader (select id, name)
- Returns 404 if not found (no isPublished check on funding scheme itself)

### Design Patterns
- All endpoints follow the same structure: try/catch with console.error logging
- Dynamic route params use `{ params }: { params: Promise<{ slug: string }> }` with `await params`
- Responses wrapped in `{ data: item }` on success
- Error responses: `{ error: 'Not found' }` (404) or `{ error: 'Failed to fetch data' }` (500)
- Console error tags: `[API_RESEARCH_GET]`, `[API_COMMUNITY_SERVICE_GET]`, `[API_PUBLICATION_GET]`, `[API_NEWS_GET]`, `[API_ANNOUNCEMENT_GET]`, `[API_FUNDING_SCHEME_GET]`

### Lint & Testing
- ESLint passes with 0 errors (13 pre-existing warnings only)
- No new lint issues introduced

---

## Task 3: Admin Document Categories Page, Error Boundary, and Loading Boundary

**Date:** 2026-03-05
**Task ID:** 3

**Files Created:**
- `/home/z/my-project/src/app/api/admin/document-categories/route.ts` — GET list + POST create
- `/home/z/my-project/src/app/api/admin/document-categories/[id]/route.ts` — GET, PUT, DELETE
- `/home/z/my-project/src/app/admin/document-categories/page.tsx` — CRUD admin page
- `/home/z/my-project/src/app/admin/error.tsx` — Admin error boundary
- `/home/z/my-project/src/app/admin/loading.tsx` — Admin loading boundary

**Files Modified:**
- `/home/z/my-project/src/app/admin/layout.tsx` — Added "Kategori Dokumen" nav item + FolderOpen icon import

### 1. Document Categories API — List & Create (`/api/admin/document-categories/route.ts`)

- **GET**: Paginated list of document categories with search filter
  - Query params: `page`, `pageSize`, `search`
  - Includes `_count.documents` for document count per category
  - Ordered by `createdAt` desc
  - Returns `{ data, total, page, pageSize, totalPages }`
- **POST**: Create new document category
  - Body: `{ name: string }`
  - Auto-generates slug via `generateSlug()`
  - Checks slug uniqueness (409 conflict if exists)
  - Returns `{ data: category }` with 201 status

### 2. Document Categories API — Individual Item (`/api/admin/document-categories/[id]/route.ts`)

- **GET**: Get single document category by ID with document count
  - Returns 404 if not found
- **PUT**: Update document category by ID
  - Body: `{ name: string }`
  - Auto-regenerates slug
  - Checks slug uniqueness excluding self
  - Returns 404 if not found
- **DELETE**: Delete document category by ID
  - Prevents deletion if category has associated documents (returns 400 with error message)
  - Returns 404 if not found
  - Returns `{ data: { id } }` on success

### 3. Admin Document Categories Page (`/admin/document-categories`)

Same CRUD pattern as the existing news-categories admin page:
- **Header**: FolderOpen icon, "Kategori Dokumen" title, "Kelola kategori dokumen unduhan" subtitle
- **Search input**: Filters by name, resets page to 1
- **Table columns**: Name, Slug (code badge), Jumlah Dokumen (Badge), Aksi (Edit/Delete buttons)
- **Add/Edit Dialog**: Name field with Zod validation (min 1 char), auto-slug generation
- **Delete Confirmation**: AlertDialog with destructive action button
- **Pagination**: Sebelumnya/Selanjutnya buttons with page/totalPages display
- **Loading state**: 5-row skeleton
- **Empty state**: FolderOpen icon with "Belum ada data kategori dokumen" message
- **TanStack React Query**: `useQuery` for data fetching, `useMutation` for create/update/delete
- **sonner**: Toast notifications for success/error on all mutations
- **Framer Motion**: Stagger container animation

### 4. Admin Error Boundary (`/admin/error.tsx`)

- `'use client'` component
- Logs error to console via `useEffect`
- Displays: destructive-colored AlertCircle icon, "Terjadi Kesalahan" heading, error message, "Coba Lagi" button with RotateCcw icon
- Uses shadcn/ui Button with outline variant
- Centered layout with `min-h-[400px]`

### 5. Admin Loading Boundary (`/admin/loading.tsx`)

- Server component (no `'use client'` needed)
- Displays: animated spinning Loader2 icon with primary color, "Memuat data..." text
- Centered layout with `min-h-[400px]`

### 6. Admin Sidebar Update

Added to `/admin/layout.tsx`:
- Imported `FolderOpen` from lucide-react
- Added nav item: `{ label: 'Kategori Dokumen', icon: FolderOpen, href: '/admin/document-categories' }`
- Positioned after "Dokumen Unduhan" (item 12), before "Reviewer" (now item 14)
- Total nav items: 21 (was 20)

### Lint & Testing
- ESLint: 0 errors, 13 pre-existing warnings (no new issues introduced)
- API endpoint responds correctly (returns "Unauthorized" due to auth middleware, as expected)
- All files compile successfully

---

## Task 2: Refactor useAuth Hook and Add RBAC Permission System

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/lib/permissions.ts` — Complete RBAC permission system (was a simpler route-only version, now enhanced with full Permission type system)

**Files Modified:**
- `/home/z/my-project/src/hooks/useAuth.ts` — Refactored with hasPermission, canAccess helpers and useSyncExternalStore
- `/home/z/my-project/src/middleware.ts` — Added role-based API and page route protection
- `/home/z/my-project/src/app/api/auth/login/route.ts` — Added lppm_role cookie
- `/home/z/my-project/src/app/api/auth/logout/route.ts` — Clear lppm_role cookie on logout

### 1. permissions.ts — Complete RBAC System

Created comprehensive permission system with two complementary approaches:

#### Permission-Based System (fine-grained)
- **Permission type**: 24 permission strings covering `dashboard:view`, resource `:manage`/`:view` pairs, and singleton permissions (`messages:view`, `users:manage`, `settings:manage`, `profil:manage`, `news-categories:manage`, `document-categories:manage`)
- **ROLE_PERMISSIONS map**: Full mapping of each role to its allowed permissions
  - `super_admin`: All 24 permissions
  - `admin_lppm`: 22 permissions (excludes `users:manage`, `settings:manage`, `profil:manage`)
  - `editor`: 18 permissions (manage: news, announcements, documents, agenda, gallery, news-categories, document-categories; view-only: research, community-service, publication, funding, partners, messages, reviews)
  - `reviewer`: 5 permissions (dashboard:view, reviews:manage/view, research:view, community-service:view)
- **Helper functions**: `hasPermission(role, permission)`, `canManage(role, resource)`, `canView(role, resource)`

#### Route-Based System (sidebar/UI control)
- **RouteAccess interface**: `{ path: string, viewOnly?: boolean }` — viewOnly marks read-only routes
- **ROLE_ROUTES map**: Per-role accessible admin routes with viewOnly flags
  - `super_admin`: All 21 routes, full access
  - `admin_lppm`: 19 routes (no /admin/users, /admin/settings), profil is viewOnly
  - `editor`: 14 routes (news, announcements, documents, document-categories, agenda, gallery + view-only for research, community-service, publications, funding, partners, messages, reviews)
  - `reviewer`: 4 routes (dashboard, reviews, research view-only, community-service view-only)
- **Helper functions**: `canAccessRoute(role, route)`, `getAccessibleRoutes(role)`, `getAccessibleRoutePaths(role)`, `isRouteViewOnly(role, route)`, `canWriteRoute(role, route)`

### 2. useAuth.ts — Refactored with Permission Helpers

Refactored the useAuth hook to include RBAC helpers:
- **Imports**: Added `Permission` type and `hasPermission`/`canAccessRoute` from `@/lib/permissions`
- **AuthUser interface**: Changed `role` type from `string` to `UserRole`
- **useSyncExternalStore**: Replaced `useState`+`useEffect` pattern with `useSyncExternalStore` to avoid the React Compiler lint error (`react-hooks/set-state-in-effect`)
- **hasPermission callback**: `hasPermission(permission: Permission) => boolean` — checks if current user has a specific permission
- **canAccess callback**: `canAccess(route: string) => boolean` — checks if current user can access a specific admin route
- **logout**: Now clears both `lppm_auth` and `lppm_role` cookies
- **Return value**: `{ user, loading, login, logout, isAuthenticated, hasPermission, canAccess }`

### 3. middleware.ts — Role-Based Route Protection

Enhanced middleware with role-based access control:
- **lppm_role cookie**: Reads the new `lppm_role` cookie for role checking
- **Admin page protection**:
  - `/admin/users` and `/admin/settings`: Only `super_admin` (redirects to `/admin` for others)
  - `/admin/researchers`, `/admin/faculties`, `/admin/study-programs`, `/admin/reviewers`: Only `super_admin` and `admin_lppm`
  - Other `/admin/*` routes: All authenticated users
- **Admin API protection**:
  - `/api/admin/users/*` and `/api/admin/settings/*`: Only `super_admin` (returns 403 Forbidden for others)
  - `/api/admin/researchers/*`, `/api/admin/faculties/*`, `/api/admin/study-programs/*`, `/api/admin/reviewers/*`: Only `super_admin` and `admin_lppm` (returns 403)
  - Other `/api/admin/*` routes: All authenticated users (client-side handles further restrictions)

### 4. Login API — lppm_role Cookie

Updated `/api/auth/login/route.ts`:
- Added `lppm_role` cookie with the user's role value on successful login
- Same cookie settings as `lppm_auth`: `path=/`, `httpOnly=false`, `sameSite=lax`, 7-day expiry
- This allows the middleware to check the role without database queries

### 5. Logout API — Clear lppm_role Cookie

Updated `/api/auth/logout/route.ts`:
- Now clears both `lppm_auth` and `lppm_role` cookies on logout

### Admin Layout — Already Uses Permission System

The admin layout (`/admin/layout.tsx`) was already updated by a previous agent to:
- Filter sidebar navigation items based on user role using `getAccessibleRoutes()`
- Show "Lihat" (view-only) badges on read-only sidebar items using `isRouteViewOnly()`
- Use `useMemo` for filtered nav items and page title based on role

### Lint & Testing
- ESLint: 0 errors, 13 warnings (all pre-existing `react-hooks/incompatible-library` from react-hook-form)
- Fixed the previous `react-hooks/set-state-in-effect` error in useAuth.ts by switching to `useSyncExternalStore`
- Dev server compiles successfully

## Task 3 (Optimize): Admin Layout Role-Based Sidebar + Dashboard Performance

**Date:** 2026-03-05
**Files Created:**
- `/home/z/my-project/src/lib/permissions.ts` — Role-based route access permissions module
- `/home/z/my-project/src/app/admin/loading.tsx` — Skeleton loader for admin pages
- `/home/z/my-project/src/app/admin/error.tsx` — Error boundary with retry button

**Files Modified:**
- `/home/z/my-project/src/app/admin/layout.tsx` — Refactored with role-based sidebar, memoization, view-only badges
- `/home/z/my-project/src/app/admin/page.tsx` — Optimized with lazy-loaded charts, memoized stat cards, error boundaries, staleTime

### 1. Permissions Module (`/src/lib/permissions.ts`)

Centralized role-based route access control:
- **`getAccessibleRoutes(role)`**: Returns array of `{ path, viewOnly }` for a given role
- **`getAccessibleRoutePaths(role)`**: Returns just the path strings
- **`canAccessRoute(role, routePath)`**: Boolean check if user can access a route
- **`isRouteViewOnly(role, routePath)`**: Returns true if route is view-only for that role
- **`canWriteRoute(role, routePath)`**: Returns true if route is accessible AND not view-only

Role visibility definitions:
- **super_admin**: ALL 21 routes, full access
- **admin_lppm**: All EXCEPT `/admin/users` and `/admin/settings`
- **editor**: Dashboard, Berita, Pengumuman, Dokumen, Kategori Dokumen, Agenda, Galeri, Pesan Kontak (full access) + Penelitian, Pengabdian, Publikasi, Hibah, Kerja Sama (view-only)
- **reviewer**: Dashboard + Review Proposal only

### 2. Admin Layout Refactor (`/admin/layout.tsx`)

Major refactoring for role-based sidebar:
- **Role-based nav filtering**: `getNavItemsForRole(role)` uses `getAccessibleRoutes()` from permissions module to filter NAV_ITEMS based on user role
- **FilteredNavItem type**: Extends NavItem with `viewOnly: boolean` flag
- **"Lihat" badge for view-only items**: View-only sidebar items show a subtle `Badge` with `Eye` icon and "Lihat" text, plus dimmed styling (60% opacity text, 40% opacity icons)
- **Removed duplicate useAuth**: Previously `SidebarContent` called `useAuth()` separately for logout — now logout is passed as `onLogout` prop from parent, avoiding duplicate hook instance
- **useMemo for sidebar items**: `filteredNavItems` memoized based on `user.role` to prevent recalculation on re-renders
- **useMemo for page title**: `currentPageTitle` memoized based on `filteredNavItems` and `pathname`
- **useCallback for handleLogout**: Logout handler has stable reference via `useCallback`
- **Smooth sidebar filtering**: No flicker — filtered items are computed before render

### 3. Dashboard Page Optimization (`/admin/page.tsx`)

Performance improvements:
- **React.lazy() for chart components**: 4 lazy-loaded chart components (`LazyResearchChart`, `LazyServiceChart`, `LazyPublicationChart`, `LazyFundingChart`) using dynamic `import('recharts')` for code splitting
- **Suspense boundaries**: Each chart wrapped in `<Suspense fallback={<ChartSkeleton />}>` for loading state
- **Error boundaries for charts**: `ChartErrorBoundary` component wraps each chart section — one failed chart doesn't break the whole page, shows retry button
- **Class-based ErrorBoundaryWrapper**: Used inside `ChartErrorBoundary` for proper React error catching
- **Memoized StatCard**: `React.memo` wraps stat card component to prevent unnecessary re-renders
- **Query optimization**: `staleTime: 60000` (60 seconds) and `refetchOnWindowFocus: false` on the stats query to prevent excessive refetching
- **STAT_CARDS constant**: Moved outside component to prevent recreation

### 4. Admin Loading Page (`/admin/loading.tsx`)

Skeleton loader matching the dashboard layout:
- Page heading skeleton
- 6 stat card skeletons in responsive grid
- 4 chart card skeletons (2+2 grid)
- Recent activity list skeleton
- Uses `animate-in fade-in` for smooth appearance

### 5. Admin Error Page (`/admin/error.tsx`)

Error boundary page with:
- Error icon with destructive color
- Error message display with digest ID
- "Coba Lagi" (retry) button calling `reset()`
- "Kembali ke Dashboard" button linking to `/admin`
- Clean centered layout

### Lint & Testing
- ESLint: 0 errors, 13 pre-existing warnings (react-hooks/incompatible-library from react-hook-form)
- Admin page returns 307 (redirect to login) when unauthenticated — correct behavior
- Login API returns 200 with valid credentials
- Admin page returns 200 with valid auth cookies
- Dev server compiles successfully

---

## Task 5: Verify and Fix All CRUD API Routes for Every Prisma Model

**Date:** 2026-03-05
**Files Modified:**
- `/home/z/my-project/src/app/api/admin/partners/[id]/route.ts` — Added slug regeneration on PUT
- `/home/z/my-project/src/app/api/admin/partners/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/faculties/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/study-programs/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/researchers/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/research/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/community-service/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/news-categories/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/document-categories/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/reviewers/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/reviews/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/admin/agenda/route.ts` — Added DEFAULT_PAGE_SIZE import, consistent page/pageSize bounds
- `/home/z/my-project/src/app/api/stats/route.ts` — Added 5 new dashboard count fields

### 1. Complete API Route Inventory (All 26 Models)

Every Prisma model now has a complete set of CRUD admin API routes:

| # | Model | Admin Route | GET list | POST create | GET [id] | PUT update | DELETE | Status |
|---|-------|-------------|----------|-------------|----------|------------|--------|--------|
| 1 | Profile | /api/admin/users | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 2 | SiteSetting | /api/admin/settings | ✅ | N/A (singleton) | N/A | ✅ (upsert) | N/A | Complete |
| 3 | LppmProfile | /api/admin/lppm-profile | ✅ | N/A (singleton) | N/A | ✅ (upsert) | N/A | Complete |
| 4 | Faculty | /api/admin/faculties | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 5 | StudyProgram | /api/admin/study-programs | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 6 | Researcher | /api/admin/researchers | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 7 | FundingScheme | /api/admin/funding | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 8 | Research | /api/admin/research | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 9 | ResearchMember | (within Research) | — | — | — | — | — | Managed via Research |
| 10 | ResearchStudentMember | (within Research) | — | — | — | — | — | Managed via Research |
| 11 | CommunityService | /api/admin/community-service | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 12 | CommunityServiceMember | (within CommunityService) | — | — | — | — | — | Managed via CS |
| 13 | CommunityServiceStudentMember | (within CommunityService) | — | — | — | — | — | Managed via CS |
| 14 | Publication | /api/admin/publications | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 15 | PublicationAuthor | (within Publication) | — | — | — | — | — | Managed via Publication |
| 16 | NewsCategory | /api/admin/news-categories | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 17 | News | /api/admin/news | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 18 | Announcement | /api/admin/announcements | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 19 | DocumentCategory | /api/admin/document-categories | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 20 | Document | /api/admin/documents | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 21 | Reviewer | /api/admin/reviewers | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 22 | ProposalReview | /api/admin/reviews | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 23 | Partner | /api/admin/partners | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 24 | Agenda | /api/admin/agenda | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 25 | GalleryAlbum | /api/admin/gallery | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 25b | GalleryPhoto | /api/admin/gallery/[id]/photos | ✅ | ✅ | — | ✅ (by photoId) | ✅ (by photoId) | Complete |
| 26 | ContactMessage | /api/admin/messages | ✅ | N/A (public POST) | ✅ | ✅ (mark read) | ✅ | Complete |
| 27 | ActivityLog | No admin CRUD | — | — | — | — | — | System-generated |

### 2. Auth Cookies (Already Implemented)

- **Login route** (`/api/auth/login`): Already sets both `lppm_auth` (user ID) and `lppm_role` (user role) cookies ✅
- **Logout route** (`/api/auth/logout`): Already clears both `lppm_auth` and `lppm_role` cookies ✅

### 3. Partner PUT Route Bug Fix

**Problem**: The partner PUT route did NOT regenerate the slug when the name was changed. This meant:
- If a partner name was updated, the slug would remain the old value
- No slug uniqueness check was performed on update
- This was inconsistent with all other routes (faculties, study-programs, research, community-service, etc.) that do regenerate slugs on PUT

**Fix**: Added `generateSlug` import and slug regeneration logic to `/api/admin/partners/[id]/route.ts`:
- Import `generateSlug` from `@/lib/helpers`
- Generate new slug from the updated name
- Check for slug uniqueness (excluding self) with `findFirst({ where: { slug, id: { not: id } } })`
- Return 409 conflict if another partner already has that slug
- Include `slug` in the `update` data object

### 4. Stats API Enhancement

Added 5 new dashboard count fields to `/api/stats/route.ts`:

| Field | Description | Query |
|-------|-------------|-------|
| `totalNews` | Total published news | `db.news.count({ where: { status: 'published' } })` |
| `totalAnnouncement` | Total active announcements | `db.announcement.count({ where: { status: 'active' } })` |
| `totalDocument` | Total active documents | `db.document.count({ where: { isActive: true } })` |
| `unreadMessages` | Unread contact messages | `db.contactMessage.count({ where: { isRead: false } })` |
| `pendingReviews` | Reviews awaiting review | `db.proposalReview.count({ where: { status: 'waiting' } })` |

All 5 new queries are included in the same `Promise.all` call for optimal parallel execution.

### 5. Consistency Fix: page/pageSize Bounds

**Problem**: 11 admin routes used bare `parseInt()` for page/pageSize without bounds checking or `DEFAULT_PAGE_SIZE`, while 8 routes properly used `Math.max(1, parseInt(...))` and `Math.min(100, Math.max(1, parseInt(...)))` with `DEFAULT_PAGE_SIZE`.

**Fixed routes** (11 files):
1. `/api/admin/faculties/route.ts`
2. `/api/admin/study-programs/route.ts`
3. `/api/admin/researchers/route.ts`
4. `/api/admin/research/route.ts`
5. `/api/admin/community-service/route.ts`
6. `/api/admin/news-categories/route.ts`
7. `/api/admin/document-categories/route.ts`
8. `/api/admin/reviewers/route.ts`
9. `/api/admin/reviews/route.ts`
10. `/api/admin/agenda/route.ts`
11. `/api/admin/partners/route.ts`

**Changes per file**:
- Added `import { DEFAULT_PAGE_SIZE } from '@/lib/constants'`
- Changed `page` from `parseInt(searchParams.get('page') || '1')` to `Math.max(1, parseInt(searchParams.get('page') || '1'))`
- Changed `pageSize` from `parseInt(searchParams.get('pageSize') || '10')` to `Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE))))`

Now all 19 paginated admin routes use the same consistent pattern for page/pageSize parsing and validation.

### 6. Lint & Testing

- ESLint: 0 errors, 13 pre-existing warnings (React Hook Form `watch()` compatibility)
- `/api/stats` returns all 16 fields including the 5 new ones (verified via curl)
- `/api/auth/login` sets both `lppm_auth` and `lppm_role` cookies (verified via curl -c)
- All admin routes return proper paginated response format `{ data, total, page, pageSize, totalPages }`
- Dev server compiles successfully
