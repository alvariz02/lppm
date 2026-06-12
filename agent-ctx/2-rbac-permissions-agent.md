# Task 2: Refactor useAuth Hook and Add RBAC Permission System

## Summary
Implemented a complete RBAC (Role-Based Access Control) permission system for the LPPM admin panel, refactored the useAuth hook with permission helpers, updated middleware with role-based protection, and added lppm_role cookie support.

## Files Created
- `/home/z/my-project/src/lib/permissions.ts` — Complete RBAC permission system

## Files Modified
- `/home/z/my-project/src/hooks/useAuth.ts` — Added hasPermission, canAccess, useSyncExternalStore
- `/home/z/my-project/src/middleware.ts` — Role-based API and page route protection
- `/home/z/my-project/src/app/api/auth/login/route.ts` — Added lppm_role cookie
- `/home/z/my-project/src/app/api/auth/logout/route.ts` — Clear lppm_role cookie

## Key Decisions
- Dual permission system: Permission-based (fine-grained actions) + Route-based (sidebar/UI control)
- 4 roles: super_admin, admin_lppm, editor, reviewer
- Middleware reads lppm_role cookie for server-side role checks
- Client-side uses useAuth().hasPermission() and canAccess() for UI-level checks
- Used useSyncExternalStore to fix React Compiler lint error
