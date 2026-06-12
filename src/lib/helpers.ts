// ============================================================================
// LPPM Helper Functions
// ============================================================================

import { cn } from '@/lib/utils'

// Re-export cn for convenience
export { cn }

// ============ SLUG GENERATION ============

/**
 * Convert text to a URL-friendly slug.
 * Lowercases, replaces spaces with hyphens, removes special characters.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')       // Remove special chars (keep word chars, spaces, hyphens)
    .replace(/[\s_]+/g, '-')         // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')             // Replace multiple hyphens with single
    .replace(/^-+/, '')              // Remove leading hyphens
    .replace(/-+$/, '')              // Remove trailing hyphens
}

// ============ DATE FORMATTING ============

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

/**
 * Format a date to Indonesian locale string.
 * Example: "12 Januari 2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const day = d.getDate()
  const month = INDONESIAN_MONTHS[d.getMonth()]
  const year = d.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Format a date with time to Indonesian locale string.
 * Example: "12 Januari 2024, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const dateStr = formatDate(d)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')

  return `${dateStr}, ${hours}:${minutes}`
}

// ============ CURRENCY FORMATTING ============

/**
 * Format a number to Indonesian Rupiah string.
 * Example: 50000000 -> "Rp 50.000.000"
 */
export function formatCurrency(amount: number): string {
  if (amount == null || isNaN(amount)) return 'Rp 0'

  const formatted = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`
}

// ============ TEXT UTILITIES ============

/**
 * Truncate text to a maximum length and add ellipsis if needed.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Get initials from a name string.
 * Example: "John Doe" -> "JD", "John" -> "J"
 */
export function getInitials(name: string): string {
  if (!name) return ''

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ============ STATUS COLORS ============

/**
 * Return Tailwind badge color classes based on a status string.
 * Covers all LPPM entity statuses with sensible defaults.
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    // Project / Research / Community Service statuses
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    ongoing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',

    // Funding scheme statuses
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',

    // News statuses
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',

    // Announcement statuses
    inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',

    // Proposal review statuses
    waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',

    // Partner statuses
    expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',

    // Agenda statuses
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }

  return colorMap[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}
