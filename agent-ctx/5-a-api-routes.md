# Task 5-a: Public API Routes — Work Log

## Summary
Created 15 public-facing API route files for the LPPM campus website. All routes are GET endpoints (except `/api/contact` which is POST), using Prisma with the SQLite database via `@/lib/db`.

## Routes Created/Updated

| # | Route | Method | Key Features |
|---|-------|--------|-------------|
| 1 | `/api/stats` | GET | Returns 11 dashboard statistics (totalResearch, totalCommunityService, totalPublication, totalResearcher, totalPartner, totalFundingScheme, ongoingResearch, completedResearch, ongoingService, completedService, totalActiveHibah) |
| 2 | `/api/research` | GET | Pagination + filters: year, status, fundingSchemeId, facultyId, search, featured. Includes leader, faculty, fundingScheme, members. Only published. |
| 3 | `/api/community-service` | GET | Same filters as research. Includes leader, faculty, fundingScheme, members. Only published. |
| 4 | `/api/publication` | GET | Filters: publicationType, year, search. Includes research, service, publicationAuthors. Only published. |
| 5 | `/api/funding-scheme` | GET | Filter: year. Only active schemes. |
| 6 | `/api/news` | GET | Filters: categoryId, search, featured. Only published news. Includes category. |
| 7 | `/api/announcement` | GET | Only active announcements. |
| 8 | `/api/partner` | GET | Only active partners. |
| 9 | `/api/agenda` | GET | Filters: status (default 'upcoming'), eventType. Ordered by startDate asc. |
| 10 | `/api/gallery` | GET | Filter: category. Includes photos per album. |
| 11 | `/api/contact` | POST | Validates with contactMessageSchema. Returns 201 on success, 400 on validation error. |
| 12 | `/api/document` | GET | Filter: categoryId. Only active documents. Includes category. |
| 13 | `/api/reviewer` | GET | Only active reviewers. Ordered by name. |
| 14 | `/api/lppm-profile` | GET | Returns first LppmProfile record or 404. |
| 15 | `/api/site-settings` | GET | Returns first SiteSetting record or 404. |

## Design Decisions
- **Pagination format**: `{ data, total, page, pageSize, totalPages }` for all paginated endpoints
- **Non-paginated endpoints** (funding-scheme, announcement, partner, agenda, gallery, document, reviewer, lppm-profile, site-settings) return `{ data }` directly
- **Search**: Uses Prisma `contains` filter (case-insensitive in SQLite by default)
- **Error handling**: try/catch with console.error and 500 status code
- **Validation**: Contact POST uses Zod `contactMessageSchema` from `@/lib/validations`
- **Constants**: Uses `DEFAULT_PAGE_SIZE` from `@/lib/constants`

## All endpoints tested and verified working ✓
