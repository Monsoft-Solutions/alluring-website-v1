ALTER TABLE "gallery_group" ADD COLUMN "procedure_slug" varchar(255);--> statement-breakpoint
CREATE INDEX "gallery_group_procedure_slug_idx" ON "gallery_group" USING btree ("procedure_slug");