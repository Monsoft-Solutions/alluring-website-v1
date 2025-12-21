/**
 * Blog Post Validation Utilities
 *
 * Shared validation logic for blog post data to ensure consistency
 * across create and update operations.
 *
 * @module @/lib/utils/blog-validation
 */

import type { BlogPostFormData } from '@/lib/actions/blog.action'

/**
 * Validation error result
 */
type ValidationError = {
    isValid: false
    error: string
}

/**
 * Validation success result
 */
type ValidationSuccess = {
    isValid: true
}

/**
 * Result of blog post validation
 */
type ValidationResult = ValidationSuccess | ValidationError

/**
 * Validate required blog post fields
 *
 * Checks that all required fields are present and non-empty after trimming.
 * Used by both create and update operations to ensure data consistency.
 *
 * @param data - Blog post form data to validate
 * @returns Validation result with error message if validation fails
 *
 * @example
 * ```typescript
 * const result = validateBlogPostData(formData)
 * if (!result.isValid) {
 *   return { success: false, error: result.error }
 * }
 * ```
 */
export function validateBlogPostData(data: BlogPostFormData): ValidationResult {
    // Validate title
    if (!data.title?.trim()) {
        return { isValid: false, error: 'Title is required' }
    }

    // Validate slug
    if (!data.slug?.trim()) {
        return { isValid: false, error: 'Slug is required' }
    }

    // Validate content
    if (!data.content?.trim()) {
        return { isValid: false, error: 'Content is required' }
    }

    // Validate meta description
    if (!data.metaDescription?.trim()) {
        return { isValid: false, error: 'Meta description is required' }
    }

    return { isValid: true }
}
