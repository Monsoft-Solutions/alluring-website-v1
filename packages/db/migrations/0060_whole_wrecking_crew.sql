CREATE TABLE "price_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"procedure_slug" varchar(60) NOT NULL,
	"line_key" varchar(60) NOT NULL,
	"label" varchar(160) NOT NULL,
	"usd" integer NOT NULL,
	"unit" varchar(20) DEFAULT 'each' NOT NULL,
	"is_add_on" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_line_usd_check" CHECK ("price_line"."usd" >= 0),
	CONSTRAINT "price_line_unit_check" CHECK ("price_line"."unit" in ('each', 'per-breast', 'first-area', 'additional-area')),
	CONSTRAINT "price_line_procedure_slug_check" CHECK ("price_line"."procedure_slug" ~ '^[a-z0-9][a-z0-9-]*$'),
	CONSTRAINT "price_line_line_key_check" CHECK ("price_line"."line_key" ~ '^[a-z0-9][a-z0-9-]*$')
);
--> statement-breakpoint
CREATE TABLE "pricing_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"default_discount_percent" smallint DEFAULT 0 NOT NULL,
	"discount_statement" text,
	"combo_discount_two_usd" integer NOT NULL,
	"combo_discount_three_usd" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_settings_singleton_check" CHECK ("pricing_settings"."id" = 1),
	CONSTRAINT "pricing_settings_default_discount_percent_check" CHECK ("pricing_settings"."default_discount_percent" between 0 and 90),
	CONSTRAINT "pricing_settings_combo_discount_check" CHECK ("pricing_settings"."combo_discount_two_usd" >= 0 and "pricing_settings"."combo_discount_three_usd" >= 0)
);
--> statement-breakpoint
CREATE TABLE "procedure_pricing" (
	"procedure_slug" varchar(60) PRIMARY KEY NOT NULL,
	"starting_line_key" varchar(60),
	"discount_percent" smallint,
	"discount_label" varchar(80),
	"notes" text,
	"typical_max_usd" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "procedure_pricing_discount_percent_check" CHECK ("procedure_pricing"."discount_percent" is null or "procedure_pricing"."discount_percent" between 0 and 90),
	CONSTRAINT "procedure_pricing_typical_max_usd_check" CHECK ("procedure_pricing"."typical_max_usd" is null or "procedure_pricing"."typical_max_usd" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "price_line_procedure_line_idx" ON "price_line" USING btree ("procedure_slug","line_key");
--> statement-breakpoint
-- Hand-written data migration (issue #354). Seeds the pricing tables from the
-- practice price sheet of 2026-09-15 (docs/pricing/practice-price-list.md),
-- generated from PRICE_SHEET and DEFAULT_PROCEDURE_SETTINGS in
-- @workspace/shared/claims/prices, which stay the code fallback. Idempotent:
-- a line or setting the admin already has is left alone.
INSERT INTO "price_line" ("procedure_slug", "line_key", "label", "usd", "unit", "is_add_on", "sort_order") VALUES
	('bbl', 'lipo360-bbl', 'Lipo 360 + BBL', 5500, 'each', false, 10),
	('lipo', 'lipo360', 'Lipo 360', 4000, 'each', false, 20),
	('lipo', 'abdomen-flanks', 'abdomen and flanks liposuction', 1500, 'each', true, 30),
	('lipo', 'full-back-flanks', 'full back and flanks liposuction', 1500, 'each', true, 40),
	('lipo', 'arms', 'arm liposuction', 1000, 'each', true, 50),
	('lipo', 'inner-thighs', 'inner thigh liposuction', 800, 'each', true, 60),
	('lipo', 'outer-thighs', 'outer thigh liposuction', 800, 'each', true, 70),
	('lipo', 'hips', 'hip liposuction', 800, 'each', true, 80),
	('lipo', 'axillary', 'underarm (axillary) liposuction', 600, 'each', true, 90),
	('lipo', 'chin', 'chin liposuction', 500, 'each', true, 100),
	('lipo', 'pubic', 'pubic liposuction', 500, 'each', true, 110),
	('lipo', 'buffalo-hump', 'buffalo hump liposuction (with back procedures only)', 500, 'each', true, 120),
	('lipo', 'banana-rolls', 'banana roll liposuction (with back procedures only)', 500, 'each', true, 130),
	('lipo', 'j-plasma-first-area', 'J-Plasma, first area', 1000, 'first-area', true, 140),
	('lipo', 'j-plasma-additional-area', 'J-Plasma, each additional area', 500, 'additional-area', true, 150),
	('tummy-tuck', 'mini', 'mini tummy tuck (no muscle repair)', 3000, 'each', false, 160),
	('tummy-tuck', 'extended-mini', 'extended mini tummy tuck (no muscle repair, hip-to-hip incision)', 4000, 'each', false, 170),
	('tummy-tuck', 'full', 'full tummy tuck (loose skin that doesn''t extend to the hips)', 4500, 'each', false, 180),
	('tummy-tuck', 'extended', 'extended tummy tuck (hip-to-hip incision)', 5500, 'each', false, 190),
	('tummy-tuck', 'fleur-de-lis', 'fleur-de-lis tummy tuck', 10000, 'each', false, 200),
	('breast-augmentation', 'saline', 'breast augmentation with saline implants', 3500, 'each', false, 210),
	('breast-augmentation', 'silicone', 'breast augmentation with silicone implants', 4500, 'each', false, 220),
	('breast-augmentation', 'fat-grafting-breasts', 'fat grafting to the breasts', 1500, 'each', true, 230),
	('breast-augmentation', 'implant-exchange-saline', 'implant exchange with saline implants', 3500, 'each', false, 240),
	('breast-augmentation', 'implant-exchange-silicone', 'implant exchange with silicone implants', 4500, 'each', false, 250),
	('breast-augmentation', 'implant-removal', 'implant removal as its own procedure (rare)', 3000, 'each', false, 260),
	('breast-augmentation', 'implant-removal-added', 'implant removal added to another breast procedure', 500, 'per-breast', true, 270),
	('breast-augmentation', 'capsulectomy', 'capsulectomy or capsulorrhaphy', 500, 'per-breast', false, 280),
	('breast-augmentation', 'axillary-skin-excision', 'underarm (axillary) skin excision', 1500, 'each', true, 290),
	('breast-augmentation', 'inframammary-crease-repair', 'inframammary crease repair', 500, 'per-breast', true, 300),
	('breast-augmentation', 'double-bubble-repair', 'double bubble repair', 500, 'per-breast', true, 310),
	('breast-lift', 'modified', 'modified breast lift (skin below the areola only)', 4000, 'each', false, 320),
	('breast-lift', 'no-implants', 'breast lift without implants', 5000, 'each', false, 330),
	('breast-lift', 'saline', 'breast lift with saline implants', 6000, 'each', false, 340),
	('breast-lift', 'silicone', 'breast lift with silicone implants', 7000, 'each', false, 350),
	('breast-reduction', 'small-medium', 'breast reduction, small to medium', 6000, 'each', false, 360),
	('breast-reduction', 'large', 'breast reduction, large', 8000, 'each', false, 370),
	('breast-reduction', 'extra-large', 'breast reduction, extra large', 9000, 'each', false, 380),
	('breast-reduction', 'male', 'male breast reduction', 6000, 'each', false, 390),
	('facelift', 'face-neck-lift', 'face and neck lift', 15000, 'each', false, 400),
	('facelift', 'fat-grafting-face', 'fat grafting to the face', 1500, 'each', false, 410),
	('facelift', 'brow-lift', 'brow lift', 8500, 'each', false, 420),
	('facelift', 'lip-lift', 'lip lift', 1500, 'each', false, 430),
	('facelift', 'tca-peel', 'TCA peel', 1000, 'each', false, 440),
	('blepharoplasty', 'upper', 'upper eyelid surgery', 3500, 'each', false, 450),
	('blepharoplasty', 'lower', 'lower eyelid surgery', 3500, 'each', false, 460),
	('blepharoplasty', 'both', 'upper and lower eyelid surgery', 6500, 'each', false, 470),
	('mens', 'gynecomastia', 'gynecomastia surgery (gland excision and chest liposuction)', 4500, 'each', false, 480),
	('mens', 'breast-lift-gynecomastia', 'breast lift with gynecomastia surgery', 5500, 'each', false, 490),
	('mens', 'breast-reduction', 'male breast reduction', 6000, 'each', false, 500),
	('mens', 'chest-lipo', 'chest liposuction (with another procedure only)', 1000, 'each', true, 510),
	('otoplasty', 'otoplasty', 'otoplasty (ear surgery)', 4500, 'each', false, 520),
	('back-lift', 'with-back-lipo', 'back lift with back liposuction', 8000, 'each', false, 530),
	('arm-lift', 'without-lipo', 'arm lift without liposuction', 5000, 'each', false, 540),
	('arm-lift', 'with-lipo', 'arm lift with arm liposuction', 6000, 'each', false, 550),
	('thigh-lift', 'medial', 'medial thigh lift', 8000, 'each', false, 560),
	('thigh-lift', 'medial-with-lipo', 'medial thigh lift with inner thigh liposuction', 8800, 'each', false, 570),
	('thigh-lift', 'medial-vertical', 'medial and vertical thigh lift', 10000, 'each', false, 580),
	('thigh-lift', 'medial-vertical-with-lipo', 'medial and vertical thigh lift with inner thigh liposuction', 10800, 'each', false, 590)
ON CONFLICT ("procedure_slug", "line_key") DO NOTHING;
--> statement-breakpoint
-- Each procedure's default "starting at" line (claims canon §5, D2, D3, D8) and
-- the BBL "most patients pay" range top. No discount: discount_percent NULL
-- inherits the site-wide default of 0.
INSERT INTO "procedure_pricing" ("procedure_slug", "starting_line_key", "typical_max_usd") VALUES
	('bbl', 'lipo360-bbl', 10000),
	('lipo', 'lipo360', NULL),
	('tummy-tuck', 'mini', NULL),
	('breast-augmentation', 'saline', NULL),
	('breast-lift', 'modified', NULL),
	('breast-reduction', 'small-medium', NULL),
	('facelift', 'face-neck-lift', NULL),
	('blepharoplasty', 'upper', NULL),
	('mommy-makeover', NULL, NULL),
	('mens', 'gynecomastia', NULL),
	('otoplasty', 'otoplasty', NULL),
	('back-lift', 'with-back-lipo', NULL),
	('arm-lift', 'without-lipo', NULL),
	('thigh-lift', 'medial', NULL)
ON CONFLICT ("procedure_slug") DO NOTHING;
--> statement-breakpoint
-- The singleton settings row: no site-wide discount, no 456.062 statement yet
-- (counsel confirms the text), and the sheet's combination discounts.
INSERT INTO "pricing_settings" ("id", "default_discount_percent", "combo_discount_two_usd", "combo_discount_three_usd") VALUES
	(1, 0, 500, 1000)
ON CONFLICT ("id") DO NOTHING;
