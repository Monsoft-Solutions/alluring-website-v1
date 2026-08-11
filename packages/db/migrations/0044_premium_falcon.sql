CREATE TABLE "blog_ai_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_model_id" varchar(120) DEFAULT 'claude-opus-5' NOT NULL,
	"review_model_id" varchar(120) DEFAULT 'claude-opus-5' NOT NULL,
	"image_model_id" varchar(40) DEFAULT 'gpt-image-2' NOT NULL,
	"artistic_style_id" varchar(60),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
