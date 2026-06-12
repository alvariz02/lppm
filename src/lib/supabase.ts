import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side Supabase client with service role key (bypasses RLS)
const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
}

export const supabase =
  globalForSupabase.supabase ??
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase

// Helper: Build paginated query
export function paginateQuery(page: number, pageSize: number) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

// Helper: Build Supabase query with common filter patterns
export function buildTextSearch(query: any, field: string, search: string) {
  return query.ilike(field, `%${search}%`)
}

// Helper: Build OR text search across multiple fields
export function buildOrSearch(fields: string[], search: string) {
  // Supabase OR filter syntax: or(field1.ilike.%val%,field2.ilike.%val%)
  const orParts = fields.map(f => `${f}.ilike.%${search}%`).join(',')
  return orParts
}

// Helper: Get count from a table
export async function getCount(table: string, filter?: Record<string, any>): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value)
      }
    }
  }
  const { count, error } = await query
  if (error) {
    console.error(`[getCount] Error counting ${table}:`, error)
    return 0
  }
  return count ?? 0
}

// Helper: Format Supabase error
export function handleError(context: string, error: any) {
  console.error(`[${context}]`, error)
  return { error: error?.message || 'Terjadi kesalahan server' }
}

// Export type for convenience
export type { SupabaseClient }
