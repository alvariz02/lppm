# Task 3-a: Rewrite API Routes from Prisma to Supabase

**Agent**: API Migration Agent  
**Date**: 2026-03-05  
**Status**: ✅ Completed

## Summary

Successfully rewrote all 9 API route files from Prisma ORM to Supabase JS client, maintaining full backward compatibility with the frontend by mapping snake_case database columns back to camelCase in API responses.

## Files Modified

| # | File | Key Changes |
|---|------|-------------|
| 1 | `src/app/api/auth/login/route.ts` | `db.profile.findUnique()` → `supabase.from('profiles').select().eq().single()` |
| 2 | `src/app/api/auth/logout/route.ts` | No DB usage — only cookie clearing (verified) |
| 3 | `src/app/api/site-settings/route.ts` | `db.siteSetting.findFirst()` → Supabase query + `mapSiteSetting()` |
| 4 | `src/app/api/lppm-profile/route.ts` | `db.lppmProfile.findFirst()` → Supabase query + `mapLppmProfile()` |
| 5 | `src/app/api/admin/settings/route.ts` | Upsert pattern: check exists → update or insert with snake_case data |
| 6 | `src/app/api/admin/lppm-profile/route.ts` | Upsert pattern for lppm_profiles with snake_case mapping |
| 7 | `src/app/api/admin/users/route.ts` | Paginated list with `paginateQuery()` + `buildOrSearch()`; create with insert |
| 8 | `src/app/api/admin/users/[id]/route.ts` | GET/PUT/DELETE all using Supabase; email uniqueness check migrated |
| 9 | `src/app/api/stats/route.ts` | `countRecords()` for counts; client-side reduce for groupBy replacements |

## Design Decisions

1. **Mapping functions per file**: Added `mapProfile()`, `mapSiteSetting()`, `mapLppmProfile()` at top of each file to convert snake_case → camelCase
2. **Upsert pattern**: For single-record tables (site_settings, lppm_profiles), check if record exists then update or insert
3. **groupBy replacement**: Supabase doesn't have groupBy, so used `.select('column')` + client-side `reduce()`
4. **Validation unchanged**: All Zod schemas remain camelCase; conversion happens after validation

## Lint Status
- 0 new errors from rewritten files
- Pre-existing warnings unchanged
