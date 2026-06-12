# Task 2-a: Detail API Routes

## Summary
Created 6 individual item GET API endpoints for public detail pages.

## Files Created
1. `/home/z/my-project/src/app/api/research/[slug]/route.ts`
2. `/home/z/my-project/src/app/api/community-service/[slug]/route.ts`
3. `/home/z/my-project/src/app/api/publication/[slug]/route.ts`
4. `/home/z/my-project/src/app/api/news/[slug]/route.ts`
5. `/home/z/my-project/src/app/api/announcement/[slug]/route.ts`
6. `/home/z/my-project/src/app/api/funding-scheme/[slug]/route.ts`

## Key Implementation Details
- All use `await params` pattern for Next.js 16 dynamic routes
- Research & Community Service: check `isPublished` after fetch (not in where clause, since slug is the lookup key)
- News: check `status !== 'published'` after fetch
- Announcement: check `status !== 'active'` after fetch
- Funding Scheme: uses filtered `include` with `where: { isPublished: true }` on researches/communityServices relations
- All return `{ data: item }` on success, `{ error: 'Not found' }` on 404, `{ error: 'Failed to fetch data' }` on 500

## Lint Result
0 errors, 13 pre-existing warnings only
