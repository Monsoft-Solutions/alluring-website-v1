CREATE TABLE "lp_form_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tab_key" text NOT NULL,
	"page_variant" text NOT NULL,
	"form_variant" text NOT NULL,
	"ad_variant" text NOT NULL,
	"section" text,
	"language" text NOT NULL,
	"step" text NOT NULL,
	"answer" text NOT NULL,
	"entry_point" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "lp_form_step_created_at_idx" ON "lp_form_step" USING btree ("created_at");