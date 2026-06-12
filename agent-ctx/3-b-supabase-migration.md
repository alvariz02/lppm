# Task 3-b: Rewrite API Routes from Prisma to Supabase

**Agent:** supabase-migration-agent
**Date:** 2026-03-05

## Summary
Rewrote all 15 API route files from Prisma ORM to Supabase JS client while preserving identical API response formats.

## Files Modified
1. `/home/z/my-project/src/app/api/news/route.ts`
2. `/home/z/my-project/src/app/api/news/[slug]/route.ts`
3. `/home/z/my-project/src/app/api/admin/news/route.ts`
4. `/home/z/my-project/src/app/api/admin/news/[id]/route.ts`
5. `/home/z/my-project/src/app/api/admin/news-categories/route.ts`
6. `/home/z/my-project/src/app/api/admin/news-categories/[id]/route.ts`
7. `/home/z/my-project/src/app/api/announcement/route.ts`
8. `/home/z/my-project/src/app/api/announcement/[slug]/route.ts`
9. `/home/z/my-project/src/app/api/admin/announcements/route.ts`
10. `/home/z/my-project/src/app/api/admin/announcements/[id]/route.ts`
11. `/home/z/my-project/src/app/api/document/route.ts`
12. `/home/z/my-project/src/app/api/admin/documents/route.ts`
13. `/home/z/my-project/src/app/api/admin/documents/[id]/route.ts`
14. `/home/z/my-project/src/app/api/admin/document-categories/route.ts`
15. `/home/z/my-project/src/app/api/admin/document-categories/[id]/route.ts`

## Key Decisions
- Each file has its own `mapXxx()` function to convert snake_case → camelCase
- `_count` aggregation in Prisma replaced with Supabase's aggregate select: `news:news(count)` / `documents:documents(count)`
- Download count increment for documents uses manual fetch → increment → update pattern since Supabase doesn't support atomic increment
- All validation logic (Zod schemas) and helper functions preserved unchanged
- No new lint errors introduced
