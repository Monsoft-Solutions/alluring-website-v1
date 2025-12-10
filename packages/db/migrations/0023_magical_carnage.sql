-- ============================================================================
-- Gallery Index Optimization Migration
-- Removes inefficient single-column boolean indexes and adds optimized composites
-- ============================================================================

-- Step 1: Drop inefficient single-column boolean indexes (low selectivity)
DROP INDEX IF EXISTS "gallery_media_is_featured_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "gallery_media_is_before_after_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "gallery_media_display_order_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "gallery_media_published_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "gallery_group_is_visible_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "gallery_group_display_order_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "before_after_pair_is_featured_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "before_after_pair_display_order_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "before_after_pair_procedure_slug_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "gallery_media_group_display_order_idx";--> statement-breakpoint

-- Step 2: Create new optimized composite indexes for before_after_pair
-- Composite for procedure page queries (WHERE procedure_slug = X ORDER BY display_order)
CREATE INDEX "before_after_pair_procedure_listing_idx" ON "before_after_pair" USING btree ("procedure_slug","display_order");--> statement-breakpoint
-- Composite for featured pairs (WHERE is_featured = true ORDER BY display_order)
CREATE INDEX "before_after_pair_featured_listing_idx" ON "before_after_pair" USING btree ("is_featured","display_order");--> statement-breakpoint

-- Step 3: Create new optimized composite indexes for gallery_group
-- Composite for visible groups listing (WHERE is_visible = true ORDER BY display_order)
CREATE INDEX "gallery_group_visible_display_idx" ON "gallery_group" USING btree ("is_visible","display_order");--> statement-breakpoint

-- Step 4: Create new optimized composite indexes for gallery_media
-- Main public listing: status + sort columns
CREATE INDEX "gallery_media_published_listing_idx" ON "gallery_media" USING btree ("status","display_order","published_at");--> statement-breakpoint
-- Featured queries: covers WHERE status + is_featured + ORDER BY
CREATE INDEX "gallery_media_status_featured_idx" ON "gallery_media" USING btree ("status","is_featured","display_order");--> statement-breakpoint

-- Step 5: Create critical index for gallery_media_group junction table
-- Enables efficient WHERE group_id = X queries (PK only covers media_id first)
CREATE INDEX "gallery_media_group_group_id_idx" ON "gallery_media_group" USING btree ("group_id");