// ============================================================================
// RBAC Permission System for LPPM Admin Panel
// ============================================================================

import type { UserRole } from '@/types'

// ============ PERMISSION TYPES ============

export type Permission =
  | 'dashboard:view'
  | 'research:manage' | 'research:view'
  | 'community-service:manage' | 'community-service:view'
  | 'publication:manage' | 'publication:view'
  | 'funding:manage' | 'funding:view'
  | 'news:manage' | 'news:view'
  | 'announcements:manage' | 'announcements:view'
  | 'documents:manage' | 'documents:view'
  | 'researchers:manage' | 'researchers:view'
  | 'faculties:manage' | 'faculties:view'
  | 'study-programs:manage' | 'study-programs:view'
  | 'reviewers:manage' | 'reviewers:view'
  | 'reviews:manage' | 'reviews:view'
  | 'partners:manage' | 'partners:view'
  | 'agenda:manage' | 'agenda:view'
  | 'gallery:manage' | 'gallery:view'
  | 'messages:view'
  | 'users:manage'
  | 'settings:manage'
  | 'profil:manage'
  | 'news-categories:manage'
  | 'document-categories:manage'

// ============ ROLE-PERMISSION MAPPING ============

/**
 * super_admin: Full access to everything
 * admin_lppm: Can manage all content (research, service, publications, news, announcements,
 *             documents, agenda, gallery, partners, funding) + can view messages, reviews.
 *             Cannot manage users, settings, or profiles.
 * editor: Can manage news, announcements, documents, agenda, gallery. Can view research,
 *         service, publications, partners, funding, messages, reviews (read-only).
 *         Cannot manage users, settings, researchers, faculties, study-programs, reviewers.
 * reviewer: Can only view and manage reviews assigned to them. Read-only dashboard.
 *           No other management access.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'dashboard:view',
    'research:manage', 'research:view',
    'community-service:manage', 'community-service:view',
    'publication:manage', 'publication:view',
    'funding:manage', 'funding:view',
    'news:manage', 'news:view',
    'announcements:manage', 'announcements:view',
    'documents:manage', 'documents:view',
    'researchers:manage', 'researchers:view',
    'faculties:manage', 'faculties:view',
    'study-programs:manage', 'study-programs:view',
    'reviewers:manage', 'reviewers:view',
    'reviews:manage', 'reviews:view',
    'partners:manage', 'partners:view',
    'agenda:manage', 'agenda:view',
    'gallery:manage', 'gallery:view',
    'messages:view',
    'users:manage',
    'settings:manage',
    'profil:manage',
    'news-categories:manage',
    'document-categories:manage',
  ],

  admin_lppm: [
    'dashboard:view',
    'research:manage', 'research:view',
    'community-service:manage', 'community-service:view',
    'publication:manage', 'publication:view',
    'funding:manage', 'funding:view',
    'news:manage', 'news:view',
    'announcements:manage', 'announcements:view',
    'documents:manage', 'documents:view',
    'researchers:manage', 'researchers:view',
    'faculties:manage', 'faculties:view',
    'study-programs:manage', 'study-programs:view',
    'reviewers:manage', 'reviewers:view',
    'reviews:manage', 'reviews:view',
    'partners:manage', 'partners:view',
    'agenda:manage', 'agenda:view',
    'gallery:manage', 'gallery:view',
    'messages:view',
    'news-categories:manage',
    'document-categories:manage',
  ],

  editor: [
    'dashboard:view',
    'news:manage', 'news:view',
    'announcements:manage', 'announcements:view',
    'documents:manage', 'documents:view',
    'agenda:manage', 'agenda:view',
    'gallery:manage', 'gallery:view',
    'research:view',
    'community-service:view',
    'publication:view',
    'funding:view',
    'partners:view',
    'messages:view',
    'reviews:view',
    'news-categories:manage',
    'document-categories:manage',
  ],

  reviewer: [
    'dashboard:view',
    'reviews:manage', 'reviews:view',
    'research:view',
    'community-service:view',
  ],
}

// ============ ROUTE ACCESS DEFINITIONS ============

/**
 * Full list of admin routes with metadata.
 * `viewOnly` means the role can see the sidebar item and view data,
 * but create/edit/delete actions should be hidden in the page component.
 */
export interface RouteAccess {
  path: string
  viewOnly?: boolean
}

const ROLE_ROUTES: Record<UserRole, RouteAccess[]> = {
  super_admin: [
    // ALL routes, full access
    { path: '/admin' },
    { path: '/admin/profil' },
    { path: '/admin/researchers' },
    { path: '/admin/faculties' },
    { path: '/admin/study-programs' },
    { path: '/admin/research' },
    { path: '/admin/community-service' },
    { path: '/admin/publications' },
    { path: '/admin/funding' },
    { path: '/admin/news' },
    { path: '/admin/announcements' },
    { path: '/admin/documents' },
    { path: '/admin/document-categories' },
    { path: '/admin/reviewers' },
    { path: '/admin/reviews' },
    { path: '/admin/partners' },
    { path: '/admin/agenda' },
    { path: '/admin/gallery' },
    { path: '/admin/messages' },
    { path: '/admin/news-categories' },
    { path: '/admin/users' },
    { path: '/admin/settings' },
  ],

  admin_lppm: [
    // All EXCEPT User Admin, Pengaturan, and Profil
    { path: '/admin' },
    { path: '/admin/profil', viewOnly: true },
    { path: '/admin/researchers' },
    { path: '/admin/faculties' },
    { path: '/admin/study-programs' },
    { path: '/admin/research' },
    { path: '/admin/community-service' },
    { path: '/admin/publications' },
    { path: '/admin/funding' },
    { path: '/admin/news' },
    { path: '/admin/announcements' },
    { path: '/admin/documents' },
    { path: '/admin/document-categories' },
    { path: '/admin/reviewers' },
    { path: '/admin/reviews' },
    { path: '/admin/partners' },
    { path: '/admin/agenda' },
    { path: '/admin/gallery' },
    { path: '/admin/messages' },
    { path: '/admin/news-categories' },
    // NO /admin/users
    // NO /admin/settings
  ],

  editor: [
    { path: '/admin' },
    // Full access content management
    { path: '/admin/news' },
    { path: '/admin/news-categories' },
    { path: '/admin/announcements' },
    { path: '/admin/documents' },
    { path: '/admin/document-categories' },
    { path: '/admin/agenda' },
    { path: '/admin/gallery' },
    // View-only for academic content
    { path: '/admin/research', viewOnly: true },
    { path: '/admin/community-service', viewOnly: true },
    { path: '/admin/publications', viewOnly: true },
    { path: '/admin/funding', viewOnly: true },
    { path: '/admin/partners', viewOnly: true },
    { path: '/admin/messages', viewOnly: true },
    { path: '/admin/reviews', viewOnly: true },
  ],

  reviewer: [
    { path: '/admin' },
    { path: '/admin/reviews' },
    { path: '/admin/research', viewOnly: true },
    { path: '/admin/community-service', viewOnly: true },
  ],
}

// ============ PERMISSION HELPER FUNCTIONS ============

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}

/**
 * Check if a role can access a specific admin route.
 * Returns true if the route is in the user's accessible routes.
 */
export function canAccessRoute(role: UserRole, routePath: string): boolean {
  const routes = ROLE_ROUTES[role] ?? ROLE_ROUTES.reviewer
  return routes.some(
    (r) => r.path === routePath || (r.path !== '/admin' && routePath.startsWith(r.path))
  )
}

/**
 * Returns the list of accessible routes for a given role.
 * Each entry includes the path and whether it's view-only.
 */
export function getAccessibleRoutes(role: UserRole): RouteAccess[] {
  return ROLE_ROUTES[role] ?? ROLE_ROUTES.reviewer
}

/**
 * Returns just the route path strings for a given role.
 */
export function getAccessibleRoutePaths(role: UserRole): string[] {
  return (ROLE_ROUTES[role] ?? ROLE_ROUTES.reviewer).map((r) => r.path)
}

/**
 * Check if a route is view-only for a given role.
 * Returns true if the route is accessible but marked as view-only.
 */
export function isRouteViewOnly(role: UserRole, routePath: string): boolean {
  const routes = ROLE_ROUTES[role] ?? ROLE_ROUTES.reviewer
  const match = routes.find(
    (r) => r.path === routePath || (r.path !== '/admin' && routePath.startsWith(r.path))
  )
  return match?.viewOnly === true
}

/**
 * Check if a user can perform write operations (create/edit/delete) on a route.
 * Returns true if the route is accessible AND not view-only.
 */
export function canWriteRoute(role: UserRole, routePath: string): boolean {
  return canAccessRoute(role, routePath) && !isRouteViewOnly(role, routePath)
}

/**
 * Check if a role has manage permission for a given resource.
 * E.g., canManage(role, 'research') checks for 'research:manage'
 */
export function canManage(role: UserRole, resource: string): boolean {
  return hasPermission(role, `${resource}:manage` as Permission)
}

/**
 * Check if a role has view permission for a given resource.
 * Having manage permission implies view permission.
 */
export function canView(role: UserRole, resource: string): boolean {
  const viewPerm = `${resource}:view` as Permission
  const managePerm = `${resource}:manage` as Permission
  return hasPermission(role, viewPerm) || hasPermission(role, managePerm)
}
