/**
 * Service Data Registry
 *
 * CENTRAL SOURCE OF TRUTH for all service information.
 *
 * 🎯 ADD NEW SERVICES - they will automatically appear on the website.
 *
 * This file imports and exports all services. Each service is defined in its own file.
 *
 * To add a new service:
 * 1. Create a new file: `your-service.service.ts`
 * 2. Define your service following the Service type structure
 * 3. Import and add it to the services array below
 * 4. Add service images to /public/images/services/
 * 5. Add service icons to /public/images/services/icons/
 * 6. Save the file - no other code changes needed!
 *
 * The service will automatically appear on:
 * - Services listing page (/services)
 * - Individual service page (/services/your-slug)
 * - Site navigation (if configured)
 * - Sitemap and search engines
 */

import type { Service } from '@/lib/types/services/service.type'

// Import generic example services

// NOTE: The following specific services are kept for reference but not used in the generic template
import { seoOptimizationService } from './seo-optimization.service'
import { websiteDesignDevelopmentService } from './website-design-development.service'
import { websiteModernizationService } from './website-modernization.service'

/**
 * All Services
 *
 * Services are automatically sorted by the `order` field.
 */
export const services: Service[] = [
    websiteDesignDevelopmentService,
    websiteModernizationService,
    seoOptimizationService,
]
