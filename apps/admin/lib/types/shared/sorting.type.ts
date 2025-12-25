/**
 * Sorting Types
 *
 * Unified sorting type definitions used across admin tables and components.
 *
 * @module @/lib/types/shared/sorting
 */

/**
 * Sort direction for table columns and data queries.
 * Used in server-sortable tables, data tables, and API queries.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Nullable sort direction for client-side tables that support
 * unsorted state (no column selected for sorting).
 */
export type NullableSortDirection = SortDirection | null
