# Task 3: Optimize Admin Layout and Dashboard

## Summary
Refactored admin layout for role-based sidebar filtering, optimized dashboard with lazy-loaded charts and error boundaries, created loading and error pages.

## Files Created
- `/home/z/my-project/src/lib/permissions.ts` — Role-based route access module
- `/home/z/my-project/src/app/admin/loading.tsx` — Skeleton loader
- `/home/z/my-project/src/app/admin/error.tsx` — Error boundary with retry

## Files Modified
- `/home/z/my-project/src/app/admin/layout.tsx` — Role-based sidebar, memoization, "Lihat" badge
- `/home/z/my-project/src/app/admin/page.tsx` — Lazy charts, memo stat cards, error boundaries, staleTime

## Key Decisions
- Permissions module is centralized in `/src/lib/permissions.ts` with functions: `getAccessibleRoutes`, `canAccessRoute`, `isRouteViewOnly`, `canWriteRoute`
- View-only items show "Lihat" badge with Eye icon in sidebar
- Charts use React.lazy() with dynamic import('recharts') for code splitting
- ErrorBoundaryWrapper is a class component (required by React for error boundaries)
- Stats query uses staleTime: 60000 to prevent excessive refetching
- No duplicate useAuth calls — logout passed as prop to SidebarContent
