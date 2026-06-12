// ============================================================================
// Supabase Database Client
// Replaces Prisma - all database operations use Supabase JS client
// ============================================================================

import { supabase, paginateQuery, buildOrSearch } from './supabase'

export { supabase, paginateQuery, buildOrSearch }

// Helper types for common DB operations
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Helper: Get single record by ID
export async function getById<T>(table: string, id: string): Promise<T | null> {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null // not found
    console.error(`[getById] Error from ${table}:`, error)
    return null
  }
  return data as T
}

// Helper: Get single record by slug
export async function getBySlug<T>(table: string, slug: string): Promise<T | null> {
  const { data, error } = await supabase.from(table).select('*').eq('slug', slug).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    console.error(`[getBySlug] Error from ${table}:`, error)
    return null
  }
  return data as T
}

// Helper: Get first record
export async function getFirst<T>(table: string): Promise<T | null> {
  const { data, error } = await supabase.from(table).select('*').limit(1).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    console.error(`[getFirst] Error from ${table}:`, error)
    return null
  }
  return data as T
}

// Helper: Get paginated list
export async function getList<T>(
  table: string,
  options?: {
    page?: number
    pageSize?: number
    filters?: Record<string, any>
    search?: { fields: string[]; query: string }
    orderBy?: string
    orderAsc?: boolean
    select?: string
  }
): Promise<PaginatedResult<T>> {
  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? 10
  const { from, to } = paginateQuery(page, pageSize)

  let query = supabase
    .from(table)
    .select(options?.select || '*', { count: 'exact' })
    .range(from, to)

  // Apply filters
  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value)
      }
    }
  }

  // Apply search
  if (options?.search && options.search.query) {
    const orFilter = buildOrSearch(options.search.fields, options.search.query)
    query = query.or(orFilter)
  }

  // Apply ordering
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options?.orderAsc ?? false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, count, error } = await query

  if (error) {
    console.error(`[getList] Error from ${table}:`, error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  return {
    data: (data as T[]) ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// Helper: Create record
export async function createRecord<T>(
  table: string,
  data: Record<string, any>
): Promise<T | null> {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error(`[createRecord] Error inserting into ${table}:`, error)
    throw error
  }
  return result as T
}

// Helper: Update record
export async function updateRecord<T>(
  table: string,
  id: string,
  data: Record<string, any>
): Promise<T | null> {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`[updateRecord] Error updating ${table}:`, error)
    throw error
  }
  return result as T
}

// Helper: Delete record
export async function deleteRecord(table: string, id: string): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) {
    console.error(`[deleteRecord] Error deleting from ${table}:`, error)
    throw error
  }
  return true
}

// Helper: Count records
export async function countRecords(
  table: string,
  filters?: Record<string, any>
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value)
      }
    }
  }
  const { count, error } = await query
  if (error) {
    console.error(`[countRecords] Error counting ${table}:`, error)
    return 0
  }
  return count ?? 0
}
