# Task 7-b: Public Pages Agent

## Task Description
Create 7 public pages for the LPPM campus website: Pengumuman, Dokumen, Reviewer, Kerjasama, Agenda, Galeri, Kontak.

## Files Created
1. `/home/z/my-project/src/app/pengumuman/page.tsx` — Announcements with accordion
2. `/home/z/my-project/src/app/dokumen/page.tsx` — Documents with table + download
3. `/home/z/my-project/src/app/reviewer/page.tsx` — Reviewer grid cards with filter
4. `/home/z/my-project/src/app/kerjasama/page.tsx` — Partner grid cards with filter
5. `/home/z/my-project/src/app/agenda/page.tsx` — Agenda cards with dual filters
6. `/home/z/my-project/src/app/galeri/page.tsx` — Gallery albums + photo dialog
7. `/home/z/my-project/src/app/kontak/page.tsx` — Contact form + info + map

## Files Modified
- `/home/z/my-project/src/app/api/document/route.ts` — Added PATCH endpoint for download count increment

## Key Implementation Details

### Common Patterns
- All pages use `'use client'` directive
- All fetch data with `useQuery` from `@tanstack/react-query`
- All use Framer Motion animations (fadeInUp, stagger)
- All have consistent hero banners with gradient (navy→sky blue)
- All have loading skeletons, empty states, and error states
- All import constants from `@/lib/constants` and helpers from `@/lib/helpers`

### Contact Form
- Uses `react-hook-form` with `zodResolver` and `contactMessageSchema`
- Submits via `useMutation` to POST `/api/contact`
- Toast notifications for success/error

### Document Download
- Opens file URL in new tab + PATCH `/api/document` to increment download count
- Toast notification on success

### Gallery
- Photo dialog with prev/next navigation and thumbnail strip
- Album cards with gradient cover placeholder

## Testing
- All 7 pages return HTTP 200
- No new lint errors
- All pages compile and render correctly
